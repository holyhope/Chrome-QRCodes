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
	box.className = 'warning notices';
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
	var container = document.getElementById('option-title').parentNode;
	container.insertBefore(box, container.getElementsByClassName('block')[0]);
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
	box.className = 'alert notices';
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
	var container = document.getElementById('option-title').parentNode;
	container.insertBefore(box, container.getElementsByClassName('block')[0]);
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
	box.className = 'updated notices';
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
	var container = document.getElementById('option-title').parentNode;
	container.insertBefore(box, container.getElementsByClassName('block')[0]);
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
 * @param colorField -
 *            JSColor input.
 * @returns Number between 0 and 1.
 */
function calculateAverageJSColor(colorField) {
	var average = colorField.color.rgb.reduce(function(a, b) {
		return a + b;
	}) / 3;
	return average;
}

/**
 * Check color on input changes.
 */
function checkColor() {
	var colorField = document.getElementById('color');

	function getErrorNodes() {
		var errors = [];

		if (isValidHexColor(colorField.value)
				&& calculateAverageJSColor(colorField) > 0.75) {
			errors.push(document.getElementById('color-error-too-light'));
		}

		return errors;
	}

	var errors = getErrorNodes();
	var errorsOld = colorField.parentNode.getElementsByClassName('error');
	for (var i = 0; i < errorsOld.length; i++) {
		var error = errorsOld[i];
		console.log(error);
		if (-1 == errors.indexOf(error)) {
			error.style.display = 'none';
		}
	}
	for (i in errors) {
		var error = errors[i];
		error.style.display = 'block';
	}
}
document.getElementById('color').addEventListener('change', checkColor);

/**
 * Check size on input changes.
 */
function checkSize() {
	var error = this.parentNode.getElementsByClassName('error')[0];
	if (typeof error == 'undefined') {
		error = document.createElement('div');
		error.className = 'error';
		this.parentNode.appendChild(error);
	}
	if (this.value < 80) {
		error.textContent = chrome.i18n.getMessage('optionSizeTooSmallAlert');
	} else {
		error.textContent = '';
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
	var color = document.getElementById('color').value;
	if (!isValidHexColor(color)) {
		color = false;
	}
	return color;
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
 * Reset color field.
 */
function setAutomaticColor() {
	var colorField = document.getElementById('color');
	colorField.color.fromRGB(0, 0, 0);
	colorField.value = chrome.i18n.getMessage('optionColorDefaultValue');
	checkColor();
}

/**
 * Internationalize options page.
 */
function initI18nPage() {
	// Header
	document.getElementsByTagName('title')[0].textContent = chrome.i18n
			.getMessage('optionTitle');
	document.getElementById('option-title').textContent = chrome.i18n
			.getMessage('optionTitle');

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
document.addEventListener('DOMContentLoaded', initI18nPage);

/**
 * Internationalize options page.
 */
function initDomPage() {
	// Color input
	var colorField = document.getElementById('color');
	var resetColorLink = document.createElement('a');
	resetColorLink.className = 'button';
	resetColorLink.textContent = chrome.i18n
			.getMessage('optionColorAutomaticLabel');
	resetColorLink.addEventListener('click', setAutomaticColor);
	colorField.addEventListener('click', function() {
		this.className = 'color';
	});
	colorField.parentNode.appendChild(resetColorLink);

	function initColor() {
		colorField.removeEventListener('focus', initColor);
		colorField.className = 'color';
		colorField.color.minS = 0.5;
		colorField.color.adjust = false;
		colorField.color.required = false;
		colorField.color.onImmediateChange = checkColor;
	}
	colorField.addEventListener('focus', initColor);

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
		error.className = 'error';
		error.textContent = message;
		container.appendChild(error);
	}
	// Color errors
	var container = document.getElementById('color').parentNode;
	addErrorNode(container, 'color-error-too-light', chrome.i18n
			.getMessage('optionColorTooLightAlert'));

	// Control buttons
	document.getElementById('reset').addEventListener('click', resetOptions);
	document.getElementById('save').addEventListener('click', saveOptions);
}
document.addEventListener('DOMContentLoaded', initDomPage);

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
						if (items.color) {
							document.getElementById('color').color
									.fromString(items.color);
						} else {
							setAutomaticColor();
						}
						document.getElementById('auto-display').checked = items.autoDisplay;
						document.getElementById('vertical-position').value = items.verticalPosition;
						document.getElementById('horizontal-position').value = items.horizontalPosition;

						// Trigger some events
						document.getElementById('size').dispatchEvent(
								new Event('change'));
						document.getElementById('color').dispatchEvent(
								new Event('change'));
						document.getElementById('vertical-position')
								.dispatchEvent(new Event('change'));
					});
}
document.addEventListener('DOMContentLoaded', restoreOptions);

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