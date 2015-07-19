var pocketRequest = function(method, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.setRequestHeader('X-Accept', 'application/json');
  xhr.onreadystatechange = callback;
  return xhr;
};

var PocketURI = function() {
  this.base = 'https://getpocket.com';
  this.apiVersion = 'v3';
  this.apiBase = this.base + '/' + this.apiVersion;
  this.oAuthRequest = this.apiBase + '/oauth/request';
  this.oAuthAuthorize = this.apiBase + '/oauth/authorize';
  this.add = this.apiBase + '/add';
  this.modify = this.apiBase + '/send';
  this.retrieve = this.apiBase + '/get';
}

var PocketClient = function(config) {
  var uri = new PocketURI();
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

  this.getUserRedirectURL = function(requestToken, redirectURI) {
    return uri.base + '/auth/authorize?request_token=' + requestToken + '&redirect_uri=' + redirectURI;
  };

  this.getRequestToken = function(redirectURI, success, error) {
    var request = pocketRequest('POST', uri.oAuthRequest, function() {
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
      redirect_uri: redirectURI
    }

    request.send(JSON.stringify(requestData));
  };

  this.getAccessToken = function(requestToken, success, error) {
    var request = pocketRequest('POST', uri.oAuthAuthorize, function() {
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

  this.add = baseRequest(uri.add);
  this.modify = baseRequest(uri.modify);
  this.retrieve = baseRequest(uri.retrieve);

  // Find matched pocket item by URL.
  this.urlMatch = function(url, item) {
    var found = false;
    var matchedItem;
    if (item.status === 0 || item.status === 1) {
      for (var k in item.list) {
        if (item.list[k].given_url === url) {
          found = true;
          matchedItem = item.list[k];
          break;
        }
      }
    }

    if (found) {
      return matchedItem;
    } else {
      return null;
    }
  };
};

module.exports = PocketClient;
