'use strict';

var config = require('./config.js');
var PocketClient = require('./pocket_client.js');
var client = new PocketClient(config.pocket);

var checkAuthResult = function() {
  if (window.localStorage.accessToken) {
    document.write("You have authorized BookPocket to access Your Pocket account.");
  } else {
    if (window.localStorage.requestToken) {
      client.getAccessToken(window.localStorage.requestToken, function(details) {
        window.localStorage.setItem('accessToken', details.access_token);
        document.write("Authorized successfully!");
      });
    } else {
      document.write("Authorized failed!");
    }
  }
};

window.onload = checkAuthResult;
