/**
 * Check color on input changes.
 */
function checkColor() {
	if (this.value == chrome.i18n.getMessage('optionColorDefaultValue')) {
		return;
	}
	var average = this.color.rgb.reduce(function(a, b) {
		return a + b;
	}) / 3;
	var error = this.parentNode.getElementsByClassName('error')[0];
	if (typeof error == 'undefined') {
		error = document.createElement('div');
		error.className = 'error';
		this.parentNode.appendChild(error);
	}
	if (average > 0.75) {
		error.textContent = chrome.i18n.getMessage('optionColorTooLightAlert');
	} else {
		error.textContent = '';
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
 * Display pageFooter option on bottom vertical position selection.
 */
function checkBottomVerticalPosition() {
	if (this.value == 'bottom') {
		document.getElementById('page-footer').parentNode.style.display = 'block';
	} else {
		document.getElementById('page-footer').parentNode.style.display = 'none';
	}
}
document.getElementById('vertical-position').addEventListener('change',
		checkBottomVerticalPosition);

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
	console.log(color);
	if (!/^[0-9A-F]{6}$/i.test(color)) {
		color = false;
	}
	console.log(color);
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
 * get default values.
 * 
 * @returns Initial values.
 */
function getDefaultOptions() {
	return {
		size : '120',
		color : false,
		autoDisplay : true,
		verticalPosition : 'top',
		horizontalPosition : 'right'
	};
}

/**
 * Reset color field.
 */
function setAutomaticColor() {
	var color = document.getElementById('color');
	color.className = null;
	color.value = chrome.i18n.getMessage('optionColorDefaultValue');
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
	document.getElementById('save').value = chrome.i18n
			.getMessage('saveButton');
}
document.addEventListener('DOMContentLoaded', initI18nPage);

/**
 * Internationalize options page.
 */
function initDomPage() {
	// Color input
	var resetColorLink = document.createElement('a');
	resetColorLink.className = 'button';
	resetColorLink.textContent = chrome.i18n
			.getMessage('optionColorAutomaticLabel');
	resetColorLink.addEventListener('click', setAutomaticColor);
	document.getElementById('color').addEventListener('click', function() {
		this.className = 'color';
	});
	document.getElementById('color').parentNode.appendChild(resetColorLink);

	// Save input
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
					getDefaultOptions(),
					function(items) {
						// Set values.
						document.getElementById('size').value = items.size;
						if (items.color) {
							document.getElementById('color').className = 'color';
							document.getElementById('color').color
									.fromString(items.color);
						} else {
							setAutomaticColor();
						}
						document.getElementById('color').color.minS = 0.5;
						document.getElementById('color').color.required = false;
						console.log(document.getElementById('color').color);
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
 * Save settings using dom elements in chrome.storage.
 */
function saveOptions() {
	// Get new settings values
	var size = getSizeValue();
	var color = getColorValue();
	var autoDisplay = getAutoDisplayValue();
	var verticalPosition = getVerticalPositionValue();
	var horizontalPosition = getHorizontalPositionValue();

	// Save it
	chrome.storage.sync.set({
		size : size,
		color : color,
		autoDisplay : autoDisplay,
		verticalPosition : verticalPosition,
		horizontalPosition : horizontalPosition
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		if (!status) {
			status = document.createElement('div');
			var container = document.getElementById('option-title').parentNode;
			container.insertBefore(status, container
					.getElementsByClassName('block')[0]);
		}
		status.className = 'updated';
		status.textContent = chrome.i18n.getMessage('optionsSaved');
		status.style.display = 'block';
		setTimeout(function() {
			status.style.display = 'none';
		}, 850);

		// Display saved options
		restoreOptions();
	});
}