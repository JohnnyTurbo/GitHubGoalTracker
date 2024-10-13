(function () {
  console.log('Content script loaded');

  function run() {
    console.log('Running main function');

    // Request stored settings from background script
    chrome.runtime.sendMessage({ action: 'getSettings' }, function (data) {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        return;
      }

      console.log('Data received from background script:', data);

      var storedUsername = data.githubUsername;
      var targetContributions = data.targetContributions;

      if (!storedUsername || !targetContributions) {
        // Settings are not set
        console.log('Settings not found');
        return;
      }

      // Get the current page username from the URL
      var urlParts = window.location.pathname.split('/');
      var currentUsername = urlParts[1];

      console.log('Current username:', currentUsername);

      if (currentUsername.toLowerCase() !== storedUsername.toLowerCase()) {
        // Not the specified user's profile page
        console.log('Usernames do not match');
        return;
      }

      // Use MutationObserver to wait for the contributions header to be available
      var observer = new MutationObserver(function (mutations, obs) {
        var contributionsHeader = findContributionsHeader();
        if (contributionsHeader) {
          console.log('Contributions header found via MutationObserver');
          obs.disconnect();
          processContributionsHeader(contributionsHeader, targetContributions);
        }
      });

      observer.observe(document, {
        childList: true,
        subtree: true
      });

      // Try to find the contributions header immediately in case it's already loaded
      var initialContributionsHeader = findContributionsHeader();
      if (initialContributionsHeader) {
        console.log('Contributions header found immediately');
        observer.disconnect();
        processContributionsHeader(initialContributionsHeader, targetContributions);
      }

      // Helper function to find the contributions header
      function findContributionsHeader() {
        var headers = document.querySelectorAll('h2.f4.text-normal.mb-2');
        console.log('Number of headers found:', headers.length);

        var header = Array.from(headers).find(el => {
          var text = el.textContent.trim();
          // Normalize whitespace
          var normalizedText = text.replace(/\s+/g, ' ');
          var matches = /\d[\d,]* contributions in \d{4}/.test(normalizedText);
          console.log('Checking header:', normalizedText, 'Matches pattern:', matches);
          return matches;
        });

        return header;
      }


      // Function to process and update the contributions header
      function processContributionsHeader(contributionsHeader, targetContributions) {
        // Extract and normalize the text content
        var rawText = contributionsHeader.innerText.trim();
        var contributionsText = rawText.replace(/\s+/g, ' ');
      
        var regex = /([\d,]+) contributions in (\d{4})/;
        var match = contributionsText.match(regex);
      
        if (match) {
          var currentContributions = parseInt(match[1].replace(/,/g, ''));
          var currentYear = parseInt(match[2]);
      
          console.log('Current contributions:', currentContributions);
          console.log('Current year:', currentYear);
      
          // Calculate contributions per day needed
          var today = new Date();
          var endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
          var oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
          var remainingDays = Math.floor((endOfYear - today) / oneDay) + 1; // Include today
      
          var contributionsPerDayNeeded = 0;
          if (targetContributions > currentContributions && remainingDays > 0) {
            contributionsPerDayNeeded = (targetContributions - currentContributions) / remainingDays;
            contributionsPerDayNeeded = contributionsPerDayNeeded.toFixed(2);
          }
      
          // Create a new element to hold the appended text
          var appendedText = document.createElement('span');
          appendedText.style.fontWeight = 'normal';
          appendedText.style.fontSize = '12px';
		  appendedText.style.color = '#9198a1';
          appendedText.style.display = 'block'; // Adjust display as needed
      
          appendedText.innerText = contributionsPerDayNeeded + ' contributions per day to reach goal: ' + targetContributions;
      
          // Append the new element to the contributionsHeader
          contributionsHeader.appendChild(appendedText);
      
          console.log('Updated contributions header:', contributionsHeader.outerHTML);
        } else {
          console.log('Could not parse contributions text:', contributionsText);
        }
      }
    });
  }

  // Check if the DOM is already loaded
  if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded event');
    document.addEventListener('DOMContentLoaded', run);
  } else {
    console.log('Document already loaded, running script immediately');
    run();
  }
})();
