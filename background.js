// background.js

console.log('Background script loaded');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Message received in background script:', request);

  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['githubUsername', 'targetContributions'], function (data) {
      console.log('Data retrieved from storage:', data);
      sendResponse(data);
    });
    // Return true to indicate that the response is asynchronous
    return true;
  }
});
