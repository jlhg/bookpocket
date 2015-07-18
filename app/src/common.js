var offlineIconPath = 'assets/images/icon_grey_19.png';
var savedIconPath = 'assets/images/icon_19.png';
var unsavedIconPath = 'assets/images/icon_blue_19.png';

var displayOfflineIcon = function(tabId) {
  chrome.pageAction.setIcon({'tabId': tabId, 'path': offlineIconPath});
  chrome.pageAction.show(tabId);
};

var displaySavedIcon = function(tabId) {
  chrome.pageAction.setIcon({'tabId': tabId, 'path': savedIconPath});
  chrome.pageAction.show(tabId);
}

var displayUnsavedIcon = function(tabId) {
  chrome.pageAction.setIcon({'tabId': tabId, 'path': unsavedIconPath});
  chrome.pageAction.show(tabId);
}

var displayIcon = function(tabId, url, pocketItem) {
  var found = false;
  if (pocketItem.status === 0 || pocketItem.status === 1) {
    for (var k in pocketItem.list) {
      if (pocketItem.list[k].given_url === url) {
        found = true;
        break;
      }
    }
  }

  if (found) {
    displaySavedIcon(tabId);
  } else {
    displayUnsavedIcon(tabId);
  }
};

var getAccessToken = function() {
  chrome.storage.local.get('access_token', function(){
  });
};

module.exports = {
  displayIcon: displayIcon,
  displaySavedIcon: displaySavedIcon,
  displayOfflineIcon: displayOfflineIcon,
  displayUnsavedIcon: displayUnsavedIcon
};
