'use strict';

var client = new PocketClient(pocketConfig);

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
