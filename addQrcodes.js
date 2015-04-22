/**
 * get default values.
 * 
 * @returns Initial values.
 */
function getDefaultOptions() {
	return {
		size : '120',
		color : false,
		pageFooter : false,
		autoDisplay : true,
		verticalPosition : 'top',
		horizontalPosition : 'right'
	};
}

/**
 * Create container for qrcode in the dom.
 */
function createQrcodeContainer() {
	var qrcode = document.createElement('div');
	qrcode.id = 'extension-qrcodes-qrcode';
	var body = document.getElementsByTagName('body')[0];
	body.insertBefore(qrcode, body.childNodes[0]);
}
createQrcodeContainer();

/**
 * Set global variables thanks to stored settings.
 */
var $args;
var autoDisplay;
function initSettings() {
	var qrcode = document.getElementById('extension-qrcodes-qrcode');
	chrome.storage.sync.get(getDefaultOptions(), function(items) {
		autoDisplay = items.autoDisplay;

		args = {
			width : items.size,
			height : items.size,
			colorDark : '#' + items.color,
			colorLight : '#ffffff',
			correctLevel : QRCode.CorrectLevel.H
		};
		if (!items.color) {
			var metas = document.getElementsByTagName('meta');
			for (var i = 0; i < metas.length; i++) {
				if (metas[i].name == 'theme-color') {
					args.colorDark = items.color = metas[i].content;
				}
			}
			if (!items.color) {
				args.colorDark = items.color = '#000000';
			}
		}
		qrcode.style[items.verticalPosition] = '0px';
		qrcode.style[items.horizontalPosition] = '0px';
	});
}
initSettings();

/**
 * Display qrcode if autoDisplay is true.
 */
function displayIfAuto() {
	var qrcode = document.getElementById('extension-qrcodes-qrcode');
	if (autoDisplay && qrcode.style.display != 'block') {
		qrcode.style.display = 'block';
	}
}

/**
 * Set print event.
 */
function initPrintEvents() {
	var beforePrint = function() {
		var qrcode = document.getElementById('extension-qrcodes-qrcode');
		args.text = window.location.href;
		new QRCode(qrcode, args);
		window.onbeforeprint = displayIfAuto;
		window.onbeforeprint();
	};
	window.onbeforeprint = beforePrint;

	var afterPrint = function() {
		var qrcode = document.getElementById('extension-qrcodes-qrcode');
		qrcode.style.display = 'none';
	}
	window.onafterprint = afterPrint;

	if (window.matchMedia) {
		var mediaQueryList = window.matchMedia('print');
		mediaQueryList.addListener(function(mql) {
			if (mql.matches) {
				window.onbeforeprint();
			} else {
				window.onafterprint();
			}
		});
	}
}
initPrintEvents();