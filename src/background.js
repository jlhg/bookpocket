'use strict';

var config = new PocketConfig();
var client = new PocketClient(config);

chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    var uri = new URI(details.url);
    var found = false;
    var key;

    chrome.storage.local.get(['accessToken'], function(items) {
      var data = {
        domain: uri.host()
      };
      var success = function(pocketItems) {
        displayIcon(details.tabId, details.url, pocketItems);
      };
      var error = function() {
        displayOfflineIcon(details.tabId);
      };

      if (items.accessToken) {
        client.retrieve(items.accessToken, data, success, error);
      } else {
        error();
      }
    });
  }
});
