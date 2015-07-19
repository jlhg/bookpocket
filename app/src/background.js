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
      domain: uri.host()
    };
    var success = function(pocketItem) {
      common.displayIcon(details.tabId, details.url, pocketItem);
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
