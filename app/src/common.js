var offlineIconPath = 'assets/images/icon_grey_19.png';
var savedIconPath = 'assets/images/icon_19.png';
var unsavedIconPath = 'assets/images/icon_blue_19.png';

var displayOfflineIcon = function(tabId, callback) {
  chrome.pageAction.setIcon({'tabId': tabId, 'path': offlineIconPath});
  chrome.pageAction.show(tabId);
  if (callback) {
    callback();
  }
};

var displaySavedIcon = function(tabId, callback) {
  chrome.pageAction.setIcon({'tabId': tabId, 'path': savedIconPath});
  chrome.pageAction.show(tabId);
  if (callback) {
    callback();
  }
}

var displayUnsavedIcon = function(tabId, callback) {
  chrome.pageAction.setIcon({'tabId': tabId, 'path': unsavedIconPath});
  chrome.pageAction.show(tabId);
  if (callback) {
    callback();
  }
}

var getAccessToken = function() {
  chrome.storage.local.get('access_token', function(){
  });
};

module.exports = {
  displaySavedIcon: displaySavedIcon,
  displayOfflineIcon: displayOfflineIcon,
  displayUnsavedIcon: displayUnsavedIcon
};
