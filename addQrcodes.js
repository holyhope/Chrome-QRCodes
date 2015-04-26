/**
 * Used to create qrcodes.
 */
var qrcodeArguments;
/**
 * True if qrcode must be shown on print.
 */
var autoDisplayQrcode;
var styleQrcode;

/**
 * Set global variables thanks to stored settings.
 */
function initSettings() {
	/**
	 * Get color from meta node in dom.
	 * 
	 * @returns color or false if not exists.
	 */
	function getMetaColor() {
		var metas = document.getElementsByTagName('meta');
		for (var i = 0; i < metas.length; i++) {
			if (metas[i].name == 'theme-color') {
				return metas[i].content;
			}
		}
		return false;
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

	chrome.storage.sync.get(getDefaultOptions(), function(items) {
		autoDisplayQrcode = items.autoDisplay;

		qrcodeArguments = {
			width : items.size,
			height : items.size,
			useSVG : true,
			colorDark : '#' + items.color,
			colorLight : '#ffffff',
			correctLevel : QRCode.CorrectLevel.H
		};
		if (!items.color) {
			var color = getMetaColor();
			if (!items.color) {
				color = '#000000';
			}
			qrcodeArguments.colorDark = color;
		}

		var size = (parseInt(items.size)) + 'px';
		styleQrcode = {
			position : {
				vertical : items.verticalPosition,
				horizontal : items.horizontalPosition
			},
			dimension : {
				width : size,
				height : size
			}
		};
	});
}
initSettings();

/**
 * Get qrcode container in the dom. Or create one if does not exists.
 * 
 * @returns valid qrcode container.
 */
function getQrcodeContainer() {
	// Check if container already exists
	var qrcodeContainer = document.getElementById('extension-qrcodes-qrcode');
	if (qrcodeContainer != null) {
		return qrcodeContainer;
	}
	// Otherwise, create One
	console.log(styleQrcode);
	qrcodeContainer = document.createElement('div');
	qrcodeContainer.id = 'extension-qrcodes-qrcode';
	qrcodeContainer.style[styleQrcode.position.vertical] = '0px';
	qrcodeContainer.style[styleQrcode.position.horizontal] = '0px';
	qrcodeContainer.style.width = styleQrcode.dimension.width;
	qrcodeContainer.style.height = styleQrcode.dimension.height;
	var bodies = document.getElementsByTagName('body');
	// Check if it is a well structured dom.
	if (bodies.length == 0) {
		return false;
	}
	// Put qrcode in the dom.
	var body = document.getElementsByTagName('body')[0];
	body.appendChild(qrcodeContainer);
	return qrcodeContainer;
}

/**
 * Display qrcode if hidden, else hide it.
 */
function switchDisplay() {
	var qrcode = getQrcodeContainer();
	if (!qrcode) {
		return;
	}
	if (qrcode.style.display == 'block') {
		qrcode.style.display = 'none';
	} else {
		window.onbeforeprint();
		qrcode.style.display = 'block';
	}
}

/**
 * Set print event.
 */
function initPrintEvents() {
	var beforePrint = function() {
		var qrcodeContainer = getQrcodeContainer();
		if (!qrcodeContainer) {
			return;
		}
		qrcodeArguments.text = window.location.href;
		try {
			new QRCode(qrcodeContainer, qrcodeArguments);
		} catch (e) {
			// Empty container
			while (qrcodeContainer.firstChild) {
				qrcodeContainer.removeChild(qrcodeContainer.firstChild);
			}
			// Add error message
			var errorMessage = document.createTextNode(chrome.i18n
					.getMessage('tooLongURL'));
			qrcodeContainer.appendChild(errorMessage);
			return;
		}

		/**
		 * Display qrcode if autoDisplay is true.
		 */
		function displayIfAuto() {
			var qrcode = getQrcodeContainer();
			if (!qrcode) {
				return;
			}
			if (autoDisplayQrcode && qrcode.style.display != 'block') {
				qrcode.style.display = 'block';
			}
		}

		window.onbeforeprint = displayIfAuto;
		window.onbeforeprint();
	};
	window.onbeforeprint = beforePrint;

	var afterPrint = function() {
		var qrcodeContainer = getQrcodeContainer();
		if (!qrcodeContainer) {
			return;
		}
		qrcodeContainer.style.display = 'none';
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
