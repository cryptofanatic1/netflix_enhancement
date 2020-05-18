function checkForValidUrl(tabId, changeInfo, tab) {
    if(typeof tab != "undefined" && typeof tab != "null" ) {
        if (/netflix[.]com/.test(tab.url)) {
            chrome.pageAction.show(tabId);
        }
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl)