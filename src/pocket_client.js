'use strict';

var pocketRequest = function(method, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.setRequestHeader('X-Accept', 'application/json');
  xhr.onreadystatechange = callback;
  return xhr;
}

var PocketConfig = function() {
  this.consumerKey = '40986-5d5c52c35d952de067604507';
  this.redirectURI = chrome.identity.getRedirectURL();
};

var PocketURI = function() {
  this.base = 'https://getpocket.com';
  this.apiVersion = 'v3';
  this.apiBase = this.base + '/' + this.apiVersion;
  this.oauthRequest = this.apiBase + '/oauth/request';
  this.oauthAuthorize = this.apiBase + '/oauth/authorize';
  this.add = this.apiBase + '/add';
  this.modify = this.apiBase + '/send';
  this.retrieve = this.apiBase + '/get';
  this.getUserRedirectURL = function(requestToken, redirectURI) {
    return this.base + '/auth/authorize?request_token=' + requestToken + '&redirect_uri=' + redirectURI;
  };
}

var PocketClient = function(pocketConfig) {
  var config = pocketConfig;
  var url = new PocketURI();
  var baseRequest = function(url) {
    var f = function(accessToken, data, success, error) {
      var request = pocketRequest('POST', url, function() {
        var details;
        if (request.readyState === 4) {
          if (request.status === 200) {
            details = JSON.parse(request.responseText);
            success(details);
          } else {
            if (error) {
              error();
            }
          }
        }
      });

      var requestData = {
        consumer_key: config.consumerKey,
        access_token: accessToken
      };

      for (var k in data) {
        requestData[k] = data[k];
      }

      request.send(JSON.stringify(requestData));

    };

    return f;
  };

  this.getRequestToken = function(success, error) {
    var request = pocketRequest('POST', url.oauthRequest, function() {
      var details;
      if (request.readyState === 4) {
        if (request.status === 200) {
          details = JSON.parse(request.responseText);
          success(details);
        } else {
          if (error) {
            error();
          }
        }
      }
    });

    var requestData = {
      consumer_key: config.consumerKey,
      redirect_uri: config.redirectURI
    }

    request.send(JSON.stringify(requestData));
  };

  this.getAccessToken = function(requestToken, success, error) {
    var request = pocketRequest('POST', url.oauthAuthorize, function() {
      var details;
      if (request.readyState === 4) {
        if (request.status === 200) {
          details = JSON.parse(request.responseText);
          success(details);
        } else {
          if (error) {
            error();
          }
        }
      }
    });

    var requestData = {
      consumer_key: config.consumerKey,
      code: requestToken
    }

    request.send(JSON.stringify(requestData));
  };

  this.add = baseRequest(url.add);
  this.modify = baseRequest(url.modify);
  this.retrieve = baseRequest(url.retrieve);
};
