/**
 * Enable browserAction on update
 */
chrome.tabs.onUpdated.addListener(function(tabId) {
	/**
	 * Disable browserAction update if error
	 */
	function enableOrDisableOnError() {
		if (chrome.runtime.lastError) {
			chrome.browserAction.disable(tabId);
		} else {
			chrome.browserAction.enable(tabId);
		}
	}

	// Test modify dom (needed for switchDisplay.js
	chrome.tabs.executeScript({
		code : 'document.getElementsByTagName(\'body\').innerHTML += \'\';'
	}, enableOrDisableOnError);
});

/**
 * Display QRCode in currentTab on browserAction click. Create one if does not
 * exist.
 */
chrome.browserAction.onClicked.addListener(function(tab) {
	/**
	 * Disable browserAction update if error
	 */
	function disableOnError() {
		if (chrome.runtime.lastError) {
			chrome.browserAction.disable(tab.id);
		}
	}

	chrome.tabs.executeScript({
		file : 'switchDisplay.js'
	}, disableOnError);
});