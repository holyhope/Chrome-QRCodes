(function() {
	/**
	 * Enable/Disable browserAction on update
	 */
	function enableDisableForTab(tabId) {
		// Test modify dom (needed for switchDisplay.js
		chrome.tabs.executeScript(tabId, {
			code : 'document.getElementsByTagName(\'body\').innerHTML += \'\';'
		}, function() {
			// Disable browserAction update if error
			if (chrome.runtime.lastError) {
				chrome.browserAction.disable(tabId);
			} else {
				chrome.browserAction.enable(tabId);
			}
		});
	}
	chrome.tabs.onUpdated.addListener(enableDisableForTab);

	/**
	 * Enable or disable for each tabs already loaded.
	 */
	chrome.tabs.query({}, function(tabs) {
		for (i in tabs) {
			enableDisableForTab(tabs[i].id);
		}
	});

	function log(level, messages) {
		console.log('[' + level + '] ' + new Date());
		console.log(messages.join('\n'));
	}

	chrome.runtime.onMessage
			.addListener(function(request, sender, sendResponse) {
				if (request.error) {
					if (sender.tab) {
						chrome.browserAction.disable(sender.tab.id);
					}
					var error = [];
					if (sender.tab) {
						error.push(sender.tab.url);
					}
					error.push(request.error);
					log('error', error);
				}
			});

	/**
	 * Alert user that tabs must be reloaded to work after installation.
	 */
	chrome.runtime.onInstalled.addListener(function(details) {
		switch (details.reason) {
		case 'install':
			var message = chrome.i18n.getMessage('installMessage');
			alert(message);
			break;
		default:
			break;
		}
	});

	/**
	 * Display QRCode in currentTab on browserAction click. Create one if does
	 * not exist.
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
			code : 'pluginQRCodes.switchDisplay();'
		}, disableOnError);
	});
})();