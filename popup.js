document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  var usernameInput = document.getElementById('username');
  var targetInput = document.getElementById('target');
  var saveButton = document.getElementById('save');
  var statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['githubUsername', 'targetContributions'], function(data) {
    if (data.githubUsername) {
      usernameInput.value = data.githubUsername;
    }
    if (data.targetContributions) {
      targetInput.value = data.targetContributions;
    }
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    var username = usernameInput.value.trim();
    var target = parseInt(targetInput.value);

    if (username && target) {
      chrome.storage.sync.set({
        'githubUsername': username,
        'targetContributions': target
      }, function() {
        statusDiv.textContent = 'Settings saved!';
        setTimeout(function() {
          statusDiv.textContent = '';
        }, 2000);
      });
    } else {
      statusDiv.textContent = 'Please enter both username and target contributions.';
      setTimeout(function() {
        statusDiv.textContent = '';
      }, 2000);
    }
  });
});
