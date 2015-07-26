'use strict';

var URI = require('URIjs');
var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var common = require('./common.js');
var client = new PocketClient(config.pocket);

chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    var uri = new URI(details.url);
    var found = false;
    var key;

    var data = {
      domain: uri.host(),
      state: 'all',
      detailType: 'complete'
    };
    var success = function(pocketItem) {
      var matchedItem = client.urlMatch(details.url, pocketItem);
      if (matchedItem) {
        common.displaySavedIcon(details.tabId);
        common.itemCache.set(details.url, matchedItem);
      } else {
        common.displayUnsavedIcon(details.tabId);
      }
    };
    var error = function() {
      common.displayOfflineIcon(details.tabId);
    };

    if (window.localStorage.accessToken) {
      client.retrieve(window.localStorage.accessToken, data, success, error);
    } else {
      error();
    }
  }
});



// 3 hours.
var runClearItemCacheInterval = 1000 * 60 * 60 * 3;

var clearItemCache = function() {
  var reservedKeys = {
    'accessToken': true,
    'requestToken': true
  };

  chrome.tabs.query({}, function(tabs) {
    var urls = {};
    var i;
    var k;

    for (i = 0; i < tabs.length; ++i) {
      urls[tabs[i].url] = true;
    }

    for (i = 0; i < window.localStorage.length; ++i) {
      k = window.localStorage.key(i);
      if (!urls[k] && !reservedKeys[k]) {
        window.localStorage.removeItem(k);
      }
    }
  });
};

window.setInterval(clearItemCache, runClearItemCacheInterval);
window.onload = function() {
  clearItemCache();
}
