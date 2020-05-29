function checkForValidUrl(tabId, changeInfo, tab) {
    if(typeof tab != "undefined" && typeof tab != "null" ) {
        if (/netflix[.]com/.test(tab.url)) {
            chrome.pageAction.show(tabId);
        }
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl)

chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        if (request.id == 'fetchGoogle') {
            var url = "https://www.google.com/search?q=" + request.query;
            fetch(url)
                .then(response => response.text())
                .then(text => callback(text))
            return true;
        }
        else if (request.id == 'fetchRottenTomatoes') {
            var url = "https://www.rottentomatoes.com" + request.query;
            fetch(url)
                .then(response => response.text())
                .then(text => callback(text))
            return true;
        }
    }
);
