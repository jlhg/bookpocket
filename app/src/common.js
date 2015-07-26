var offlineIconPath = 'assets/images/icon_grey_19.png';
var savedIconPath = 'assets/images/icon_19.png';
var unsavedIconPath = 'assets/images/icon_blue_19.png';

var displayOfflineIcon = function(tabId, callback) {
  var data = {
    'tabId': tabId,
    'path': offlineIconPath
  };
  chrome.pageAction.setIcon(data, function() {
    chrome.pageAction.show(tabId);
    if (callback) {
      callback();
    }
  });
};

var displaySavedIcon = function(tabId, callback) {
  var data = {
    'tabId': tabId,
    'path': savedIconPath
  };
  chrome.pageAction.setIcon(data, function() {
    chrome.pageAction.show(tabId);
    if (callback) {
      callback();
    }
  });
};

var displayUnsavedIcon = function(tabId, callback) {
  var data = {
    'tabId': tabId,
    'path': unsavedIconPath
  };
  chrome.pageAction.setIcon(data, function() {
    chrome.pageAction.show(tabId);
    if (callback) {
      callback();
    }
  });
};

var itemCache = {
  set: function(item) {
    var data = {
      item_id: item.item_id,
      title: item.resolved_title,
      favorite: item.favorite,
      status: item.status,
      tags: item.tags
    };

    try {
      window.localStorage.setItem(item.given_url, JSON.stringify(data));
    } catch(e) {
      if (e.code == 22) {
        console.log('Local storage is full.');
      }
      return false;
    }
    return true;
  }
};

module.exports = {
  displaySavedIcon: displaySavedIcon,
  displayOfflineIcon: displayOfflineIcon,
  displayUnsavedIcon: displayUnsavedIcon,
  itemCache: itemCache
};
