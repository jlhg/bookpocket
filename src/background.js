var currentTabId = '';

chrome.webNavigation.onCommitted.addListener(function (details) {
  if (details.frameId === 0) {
    chrome.pageAction.show(details.tabId);
    chrome.pageAction.setIcon({'tabId': details.tabId, 'path': 'assets/icon_grey_19.png'});
  }
})
