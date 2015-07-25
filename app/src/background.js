'use strict';

var URI = require('URIjs');
var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var common = require('./common.js');
var client = new PocketClient(config.pocket);
var runClearItemCacheInterval = 1000 * 60 * 60 * 3;

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
        common.itemCache.set(matchedItem);
      } else {
        common.displayUnsavedIcon(details.tabId);
      }



    };
    var error = function() {
      common.displayOfflineIcon(details.tabId);
    };

    if (localStorage.accessToken) {
      client.retrieve(localStorage.accessToken, data, success, error);
    } else {
      error();
    }
  }
});

// TODO:
var clearItemCache = function() {};
// window.setInterval(clearItemCache, runClearItemCacheInterval);
