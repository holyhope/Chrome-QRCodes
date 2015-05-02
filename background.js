(function() {
	/**
	 * Enable/Disable browserAction on update.
	 * 
	 * @param tabId -
	 *            Tab identifier.
	 */
	function enableDisableForTab(tabId) {
		// Test modify dom (needed for switchDisplay.js
		chrome.tabs.executeScript(tabId, {
			code : 'document.getElementsByTagName(\'body\').innerHTML += \'\';'
		}, function() {
			// Enable browserAction if no error
			if (!disableOnError(tabId)) {
				chrome.browserAction.enable(tabId);
			}
		});
	}
	chrome.tabs.onUpdated.addListener(enableDisableForTab);

	/**
	 * Enable or disable for each tabs.
	 */
	chrome.tabs.query({}, function(tabs) {
		for (i in tabs) {
			enableDisableForTab(tabs[i].id);
		}
	});

	/**
	 * Log messages.
	 * 
	 * @param level -
	 *            level of the log (infos, notice, warning, error)
	 * @param messages -
	 *            Array of messages to log.
	 */
	function log(level, messages) {
		console.log('[' + level + '] ' + new Date());

		if (messages instanceof Array) {
			for (index in messages) {
				console.log(messages.join('\n'));
			}
		} else {
			console.log(messages);
		}
	}

	/**
	 * Disable browserAction if error.
	 * 
	 * @return (bool) true if disabled.
	 */
	function disableOnError(tabId) {
		if (chrome.runtime.lastError) {
			log('notice', chrome.runtime.lastError.message);
			chrome.browserAction.disable(tabId);
			return true;
		}
		return false;
	}

	/**
	 * Receive message and disable browser action if error.
	 * 
	 * @param request -
	 *            Message received.
	 * @param sender -
	 *            Sender of request.
	 * @param sendResponse -
	 *            Function to call.
	 */
	chrome.runtime.onMessage
			.addListener(function(request, sender, sendResponse) {
				response = {
					action : 'none'
				};
				// Disable browser action
				if (request.disable === true) {
					if (sender.tab) {
						chrome.browserAction.disable(sender.tab.id);
					} else {
						chrome.browserAction.disable();
					}
					response.action = 'disabled';
				}
				// Log message
				if (request.log) {
					var error = [];
					if (sender.tab) {
						error.push(sender.tab.url);
					}
					error.push(request.log.message);
					log(request.log.level, error);
				}
				sendResponse(response);
			});

	/**
	 * Alert user that tabs must be reloaded to work after installation.
	 * 
	 * @param details -
	 *            Details of installation.
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
	 * 
	 * @param tab -
	 *            Active tab when clicked.
	 */
	chrome.browserAction.onClicked.addListener(function(tab) {
		chrome.tabs.executeScript({
			code : 'pluginQRCodes.switchDisplay();'
		}, function() {
			disableOnError(tab.id);
		});
	});
})();