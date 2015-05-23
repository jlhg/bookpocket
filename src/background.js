'use strict';

var client = new PocketClient(pocketConfig);

chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    var uri = new URI(details.url);
    var found = false;
    var key;

    var data = {
      domain: uri.host()
    };
    var success = function(pocketItems) {
      displayIcon(details.tabId, details.url, pocketItems);
    };
    var error = function() {
      displayOfflineIcon(details.tabId);
    };

    if (localStorage.accessToken) {
      client.retrieve(localStorage.accessToken, data, success, error);
    } else {
      error();
    }
  }
});
