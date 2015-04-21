chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('Display qrcode on ' + tab.url);
    chrome.tabs.executeScript({
	file : 'switchDisplay.js'
    });
});
