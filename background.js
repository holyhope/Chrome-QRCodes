chrome.browserAction.onClicked.addListener(function(tab) {
	function callback() {
		if (chrome.runtime.lastError) {
			var error = chrome.runtime.lastError;
			console.log('Error: ' + error.message);
		} else {
			console.log('QRCode displayed on ' + tab.url);
		}
	}

	chrome.tabs.executeScript({
		file : 'switchDisplay.js'
	}, callback);
});