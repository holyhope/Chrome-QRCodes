/**
 * Display a confirm box during waitTime milliseconds. Call callbackTrue if user
 * click on Yes otherwise call callbackFalse at least waitTime after this
 * method.
 * 
 * @param waitTime -
 *            Time (milliseconds) before removing message.
 * @param message -
 *            Message to display in confirm box.
 * @param callbackTrue -
 *            Callback to call in case of yes.
 * @param callbackFalse
 *            (Optional) - Callback to call in case of no.
 */
function confirm(waitTime, message, callbackTrue, callbackFalse) {
	/**
	 * Sanitize arguments
	 */
	function sanitizeArgs() {
		if (typeof callbackFalse == 'undefined') {
			callbackFalse = function() {
			};
		}
		var oldCallbackFalse = callbackFalse;
		callbackFalse = function() {
			var container = box.parentNode;
			if (container != null) {
				container.removeChild(box);
				oldCallbackFalse();
			}
		}
		var oldCallbackTrue = callbackTrue;
		callbackTrue = function() {
			var container = box.parentNode;
			if (container != null) {
				container.removeChild(box);
				oldCallbackTrue();
			}
		}
	}
	sanitizeArgs();

	var updateTimeInterval;

	var box = document.createElement('div');
	box.className = 'alert alert-warning';
	box.textContent = message;
	
	var inputsContainer = document.createElement('div');
	inputsContainer.className = 'input-container';

	/**
	 * Create the <i>yes</i> input.
	 * 
	 * @return Input node.
	 */
	function createInputYes() {
		var inputYes = document.createElement('input');
		inputYes.type = 'button';
		inputYes.className = 'btn btn-primary';
		inputYes.value = chrome.i18n.getMessage('Yes');

		inputYes.addEventListener('click', function() {
			clearInterval(updateTimeInterval);
			callbackTrue();
		});

		return inputYes;
	}

	/**
	 * Create the <i>no</i> input.
	 * 
	 * @return Input node.
	 */
	function createInputNo() {
		var inputNo = document.createElement('input');
		inputNo.type = 'button';
		inputNo.className = 'btn btn-default';

		function updateTime() {
			var remaining = parseInt((end - new Date().getTime()) / 1000);
			if (remaining <= 0) {
				clearInterval(updateTimeInterval);
				callbackFalse();
			}
			inputNo.value = chrome.i18n.getMessage('No') + ' (' + remaining
					+ ')';
		}
		updateTimeInterval = setInterval(updateTime, 250);
		var end = new Date().getTime() + waitTime;
		updateTime();

		inputNo.addEventListener('click', function() {
			clearInterval(updateTimeInterval);
			callbackFalse();
		});

		return inputNo;
	}
	inputsContainer.appendChild(createInputNo());
	inputsContainer.appendChild(createInputYes());

	box.appendChild(inputsContainer);

	// Add div in the dom.
	var title = document.getElementById('title');
	var container = title.parentNode;
	container.insertBefore(box, title.nextSibling);
}

/**
 * Display an alert during waitTime milliseconds. Call callback on close.
 * 
 * @param waitTime -
 *            Time (milliseconds) before removing alert.
 * @param message -
 *            Message to display in alert box.
 * @param callback -
 *            Callback to call on close.
 */
function alert(waitTime, message, callback, updated) {
	/**
	 * Sanitize arguments
	 */
	function sanitizeArgs() {
		if (typeof callback == 'undefined') {
			callback = function() {
			};
		}
		var oldCallback = callback;
		callback = function() {
			var container = box.parentNode;
			if (container != null) {
				container.removeChild(box);
				oldCallback();
			}
		}
		if (typeof updated == 'undefined') {
			updated = false;
		}
	}
	sanitizeArgs();

	var updateTimeInterval;

	var box = document.createElement('div');
	box.className = 'alert alert-warning';
	box.textContent = message;

	var inputsContainer = document.createElement('div');
	inputsContainer.className = 'input-container';

	/**
	 * Create the <i>no</i> input.
	 * 
	 * @return Input node.
	 */
	function createInput() {
		var input = document.createElement('input');
		input.type = 'button';

		function updateTime() {
			var remaining = parseInt((end - new Date().getTime()) / 1000);
			if (remaining <= 0) {
				clearInterval(updateTimeInterval);
				callback();
			}
			input.value = chrome.i18n.getMessage('Ok') + ' (' + remaining + ')';
		}
		updateTimeInterval = setInterval(updateTime, 250);
		var end = new Date().getTime() + waitTime;
		updateTime();

		input.addEventListener('click', function() {
			clearInterval(updateTimeInterval);
			callback();
		});

		return input;
	}

	inputsContainer.appendChild(createInput());

	box.appendChild(inputsContainer);

	// Add div in the dom.
	var title = document.getElementById('title');
	var container = title.parentNode;
	container.insertBefore(box, title.nextSibling);
}

/**
 * Display an update notice during waitTime milliseconds.
 * 
 * @param waitTime -
 *            Time (milliseconds) before removing message.
 * @param message -
 *            Message to display in notice.
 */
function updated(waitTime, message) {
	var updateTimeInterval;

	var box = document.createElement('div');
	box.className = 'alert alert-success';
	box.textContent = message;

	var timer = document.createElement('div');
	timer.className = 'timer';

	function updateTime() {
		var remaining = parseInt((end - new Date().getTime()) / 1000);
		if (remaining <= 0) {
			clearInterval(updateTimeInterval);
			box.parentNode.removeChild(box);
		}
		timer.textContent = '(' + remaining + ')';
	}
	updateTimeInterval = setInterval(updateTime, 250);
	var end = new Date().getTime() + waitTime;
	updateTime();

	box.appendChild(timer);

	// Add div in the dom.
	var title = document.getElementById('title');
	var container = title.parentNode;
	container.insertBefore(box, title.nextSibling);
}

/**
 * Check if color is a valid hexadecimal color value.
 * 
 * @param color -
 *            color to check.
 * @returns True if color is valid.
 */
function isValidHexColor(color) {
	return new RegExp('^#?([a-zA-Z0-9]{3}){2}$', 'g').test(color);
}

/**
 * Calculate the average of red, green and blue in a JSColor input.
 * 
 * @param string
 *            HexaColor - Color.
 * @returns Number between 0 and 1.
 */
function calculateAverageJSColor(HexaColor) {
	console.log(HexaColor);
	var bigint = parseInt(HexaColor.substring(1, 7), 16);
	var comp = [ (bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255 ];
	var average = comp.reduce(function(a, b) {
		return a + b;
	}) / 3;
	return average / 255;
}

/**
 * Check color on input changes.
 */
function checkColor() {
	var field = document.getElementById('color');

	function getErrorNodes() {
		var errors = [];

		if (calculateAverageJSColor(field.value) > 0.75) {
			errors.push(document.getElementById('color-error-too-light'));
		}

		return errors;
	}

	var errors = getErrorNodes();
	var errorsOld = field.parentNode.getElementsByClassName('label');
	for (var i = 0; i < errorsOld.length; i++) {
		var error = errorsOld[i];
		if (-1 == errors.indexOf(error)) {
			error.style.display = 'none';
		}
	}
	for (i in errors) {
		var error = errors[i];
		error.style.display = 'block';
	}
}
document.getElementById('color').addEventListener('input', checkColor);

/**
 * Check size on input changes.
 */
function checkSize() {
	var field = document.getElementById('size');

	function getErrorNodes() {
		var errors = [];

		if (field.value < 80) {
			errors.push(document.getElementById('size-error-too-small'));
		}

		return errors;
	}

	var errors = getErrorNodes();
	var errorsOld = field.parentNode.getElementsByClassName('label');
	for (var i = 0; i < errorsOld.length; i++) {
		var error = errorsOld[i];
		if (-1 == errors.indexOf(error)) {
			error.style.display = 'none';
		}
	}
	for (i in errors) {
		var error = errors[i];
		error.style.display = 'block';
	}
}
document.getElementById('size').addEventListener('change', checkSize);

/**
 * get sanitized horizontal position value from the dom element.
 * 
 * @returns sanitized value.
 */
function getHorizontalPositionValue() {
	var position = document.getElementById('horizontal-position').value;
	switch (position) {
	case 'left':
		return 'left';
	default:
	case 'right':
		return 'right';
	}
}

/**
 * get sanitized vertical position value from the dom element.
 * 
 * @returns sanitized value.
 */
function getVerticalPositionValue() {
	var position = document.getElementById('vertical-position').value;
	switch (position) {
	case 'bottom':
		return 'bottom';
	default:
	case 'top':
		return 'top';
	}
}

/**
 * get sanitized page footer value from the dom element.
 * 
 * @returns sanitized value.
 */
function getPageFooterValue() {
	return document.getElementById('page-footer').checked == true;
}

/**
 * get sanitized size value from the dom element.
 * 
 * @returns sanitized value.
 */
function getSizeValue() {
	var size = document.getElementById('size').value;
	return Math.abs(parseInt(size)) + '';
}

/**
 * get sanitized color value from the dom element.
 * 
 * @returns sanitized value.
 */
function getColorValue() {
	return document.getElementById('color').value;
}

/**
 * get sanitized auto display value from the dom element.
 * 
 * @returns sanitized value.
 */
function getAutoDisplayValue() {
	return document.getElementById('auto-display').checked == true;
}

/**
 * Internationalize options page.
 */
function initI18nPage() {
	// Header
	document.getElementsByTagName('title')[0].textContent = chrome.i18n
			.getMessage('optionTitle');
	document.getElementById('title-name').textContent = chrome.i18n
			.getMessage('optionTitle');
	document.getElementById('title-desc').textContent = chrome.i18n
			.getMessage('optionTitleDesc');

	// Settings
	document.getElementById('size-label').textContent = chrome.i18n
			.getMessage('optionSizeLabel');
	document.getElementById('color-label').textContent = chrome.i18n
			.getMessage('optionColorLabel');
	document.getElementById('auto-display-label').textContent = chrome.i18n
			.getMessage('optionAutoDisplayLabel');
	document.getElementById('vertical-position-label').textContent = chrome.i18n
			.getMessage('optionVerticalPositionLabel');
	document.getElementById('vertical-position-top').textContent = chrome.i18n
			.getMessage('optionVerticalPositionTopValue');
	document.getElementById('vertical-position-bottom').textContent = chrome.i18n
			.getMessage('optionVerticalPositionBottomValue');
	document.getElementById('horizontal-position-label').textContent = chrome.i18n
			.getMessage('optionHorizontalPositionLabel');
	document.getElementById('horizontal-position-left').textContent = chrome.i18n
			.getMessage('optionHorizontalPositionLeftValue');
	document.getElementById('horizontal-position-right').textContent = chrome.i18n
			.getMessage('optionHorizontalPositionRightValue');

	// Control buttons
	document.getElementById('reset').value = chrome.i18n
			.getMessage('resetButton');
	document.getElementById('save').value = chrome.i18n
			.getMessage('saveButton');
}

/**
 * Internationalize options page.
 */
function initDomPage() {
	// Error messages
	/**
	 * Create a error box and append it in container.
	 * 
	 * @param container -
	 *            Where to insert error.
	 * @param id -
	 *            Identifier of error node.
	 * @param message -
	 *            Error message.
	 */
	function addErrorNode(container, id, message) {
		var error = document.createElement('div');
		error.id = id;
		error.className = 'label label-danger';
		error.textContent = message;
		container.appendChild(error);
	}
	// Color errors
	addErrorNode(document.getElementById('color').parentNode,
			'color-error-too-light', chrome.i18n
					.getMessage('optionColorTooLightAlert'));
	// Size errors
	addErrorNode(document.getElementById('size').parentNode,
			'size-error-too-small', chrome.i18n
					.getMessage('optionSizeTooSmallAlert'));

	// Control buttons
	document.getElementById('reset').addEventListener('click', resetOptions);
	document.getElementById('save').addEventListener('click', saveOptions);
}

/**
 * Restores html elements using preferences stored in chrome.storage.
 */
function restoreOptions() {
	chrome.storage.sync
			.get(
					// Use default values
					pluginQRCodesgetDefaultOptions(),
					function(items) {
						// Set values.
						document.getElementById('size').value = items.size;
						document.getElementById('color').value = items.color;
						document.getElementById('auto-display').checked = items.autoDisplay;
						document.getElementById('vertical-position').value = items.verticalPosition;
						document.getElementById('horizontal-position').value = items.horizontalPosition;

						// Trigger some events
						document.getElementById('size').dispatchEvent(
								new Event('change'));
						document.getElementById('color').dispatchEvent(
								new Event('input'));
						document.getElementById('vertical-position')
								.dispatchEvent(new Event('change'));
					});
}

function init() {
	initDomPage();
	initI18nPage();
	restoreOptions();
}
document.addEventListener('DOMContentLoaded', init);

/**
 * Save settings in chrome then dispaly a notice to user.
 * 
 * @param options -
 *            Settings to save
 */
function saveAndNotice(options) {
	chrome.storage.sync.set(options, function() {
		updated(3000, chrome.i18n.getMessage('optionsSaved'));
		restoreOptions();
	});
}

/**
 * Save settings using dom elements in chrome.storage.
 */
function saveOptions() {
	// Get new settings values
	var size = getSizeValue();
	var color = getColorValue();
	var autoDisplay = getAutoDisplayValue();
	var verticalPosition = getVerticalPositionValue();
	var horizontalPosition = getHorizontalPositionValue();

	saveAndNotice({
		size : size,
		color : color,
		autoDisplay : autoDisplay,
		verticalPosition : verticalPosition,
		horizontalPosition : horizontalPosition
	});
}

/**
 * Reset settings using getDefaultOptions in chrome.storage.
 */
function resetOptions() {
	confirm(7500, chrome.i18n.getMessage('confirmReset'), function() {
		saveAndNotice(pluginQRCodesgetDefaultOptions());
	});
}