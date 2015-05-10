'use strict';

var jsonRequest = function(method, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.setRequestHeader('X-Accept', 'application/json');
  xhr.onreadystatechange = callback;
  return xhr;
}

var PocketURI = function() {
  this.base = 'https://getpocket.com';
  this.apiVersion = 'v3';
  this.apiBase = this.base + '/' + this.apiVersion;
  this.oauthRequest = this.apiBase + '/oauth/request';
  this.oauthAuthorize = this.apiBase + '/oauth/authorize';
  this.userRedirect = function(requestToken) {
    return this.base + '/auth/authorize?request_token=' + requestToken + '&redirect_uri=' + chrome.identity.getRedirectURL();
  };
  this.add = this.apiBase + '/add';
  this.modify = this.apiBase + '/send';
  this.retrieve = this.apiBase + '/get';
}

var PocketAPI = function() {
  var url = new PocketURI();
  var consumerKey = '40986-5d5c52c35d952de067604507'
  var requestToken = '';
  var accessToken = '';
  var userName = '';

  this.getRequestToken = function(callback) {
    if (requestToken) {
      callback(requestToken);
      return;
    }

    var request = jsonRequest('POST', url.oauthRequest, function() {
      if (request.readyState === 4 && request.status === 200) {
        var response = JSON.parse(request.responseText);
        requestToken = response.code;
        callback(requestToken);
      }
    });
    request.send(JSON.stringify({
      consumer_key: consumerKey,
      redirect_uri: url.userRedirect(requestToken)
    }));
  };

  this.getAccessToken = function(callback) {
    var self = this;
    if (!requestToken) {
      this.getRequestToken(function(requestToken) {
        if (requestToken) {
          self.getAccessToken(callback);
        }
      });
      return;
    }

    if (accessToken) {
      callback(accessToken);
      return;
    }

    var request = jsonRequest('POST', url.oauthAuthorize, function() {
      if (request.readyState === 4 && request.status === 200) {
        var response = JSON.parse(request.responseText);
        accessToken = response.access_token;
        userName = response.username;
        callback(accessToken);
      }
    });

    var details = {
      url: url.userRedirect(requestToken),
      interactive: true
    };

    chrome.identity.launchWebAuthFlow(details, function(redirectURL) {
      if (chrome.identity.getRedirectURL() === redirectURL) {
        request.send(JSON.stringify({
          consumer_key: consumerKey,
          code: requestToken
        }));
      }
    });
  };

  this.getItem = function(search, callback) {
    this.getAccessToken(function(accessToken) {
      var request = jsonRequest('POST', url.retrieve, function() {
        if (request.readyState === 4 && request.status === 200) {
          var response = JSON.parse(request.responseText);
          callback(response);
        }
      });
      var requestData = {
        consumer_key: consumerKey,
        access_token: accessToken,
        search: search
      };
      request.send(JSON.stringify(requestData));
    });
  };

  this.addItem = function(url, title, tags, tweet_id, callback) {
    this.getAccessToken(function(accessToken) {
      request = jsonRequest('POST', url.add, function() {
        if (request.readyState === 4 && request.status === 200) {
          var response = JSON.parse(request.responseText);
          callback(response);
        }
      });
      var requestData = {
        consumer_key: consumerKey,
        access_token: accessToken,
        url: url
      };
      if (title) {
        requestData.title = title;
      }
      if (tags) {
        requestData.tags = tags;
      }
      if (tweet_id) {
        requestData.tweet_id = tweet_id;
      }
      request.send(JSON.stringify(requestData));
    });
  };
};

var currentTabId = '';
var api = new PocketAPI();
chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    chrome.pageAction.show(details.tabId);
  }
});

chrome.pageAction.onClicked.addListener(function(tab) {
  console.log('clicked.');
  api.getItem(tab.url, function(item) {
    console.log(item);
  });
});
