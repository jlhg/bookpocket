'use strict';

var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var client = new PocketClient(config.pocket);

var checkAuthResult = function() {
  if (localStorage.requestToken) {
    client.getAccessToken(localStorage.requestToken, function(details) {
      localStorage.setItem('accessToken', details.access_token);
    });
  } else {
      // TODO: error.
  }
};

window.onload = checkAuthResult;
