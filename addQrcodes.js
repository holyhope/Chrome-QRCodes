var pluginQRCodes = {
	libraryArguments : false, // Used to create qrcodes.
	autoDisplay : false, // True if qrcode must be shown on print.
	style : false,

	/**
	 * Get color from meta node in dom.
	 * 
	 * @returns color or false if not exists.
	 */
	getMetaColor : function() {
		var metas = document.getElementsByTagName('meta');
		for (var i = 0; i < metas.length; i++) {
			if (metas[i].name == 'theme-color') {
				return metas[i].content;
			}
		}
		return false;
	},

	/**
	 * Get qrcode container in the dom. Or create one if does not exists.
	 * 
	 * @returns valid qrcode container.
	 */
	getContainer : function() {
		// Check if container already exists
		var qrcodeContainer = document
				.getElementById('extension-qrcodes-qrcode');
		if (qrcodeContainer != null) {
			return qrcodeContainer;
		}
		// Otherwise, create One
		qrcodeContainer = document.createElement('div');
		qrcodeContainer.id = 'extension-qrcodes-qrcode';
		qrcodeContainer.style[this.style.position.vertical] = '0px';
		qrcodeContainer.style[this.style.position.horizontal] = '0px';
		qrcodeContainer.style.width = this.style.dimension.width;
		qrcodeContainer.style.height = this.style.dimension.height;
		var bodies = document.getElementsByTagName('body');
		// Check if it is a well structured dom.
		if (bodies.length == 0) {
			return false;
		}
		// Put qrcode in the dom.
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(qrcodeContainer);
		return qrcodeContainer;
	},

	/**
	 * Display qrcode if hidden, else hide it.
	 */
	switchDisplay : function() {
		var qrcode = this.getContainer();
		if (!qrcode) {
			return;
		}
		if (qrcode.style.display == 'block') {
			qrcode.style.display = 'none';
		} else {
			window.onbeforeprint();
			qrcode.style.display = 'block';
		}
	},

	/**
	 * Set print event.
	 */
	initPrintEvents : function() {
		var qrcodeContainer = this.getContainer();
		var beforePrint = function() {
			if (!qrcodeContainer) {
				return;
			}
			pluginQRCodes.libraryArguments.text = window.location.href;
			try {
				new QRCode(qrcodeContainer, pluginQRCodes.libraryArguments);
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
				if (!qrcodeContainer) {
					return;
				}
				if (this.autoDisplay
						&& qrcodeContainer.style.display != 'block') {
					qrcodeContainer.style.display = 'block';
				}
			}

			window.onbeforeprint = displayIfAuto;
			window.onbeforeprint();
		};
		window.onbeforeprint = beforePrint;

		var afterPrint = function() {
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
	},

	moveContainer : function(event) {
		var container = pluginQRCodes.getContainer();

		var position = {
			x : parseInt(container.style[pluginQRCodes.style.position.horizontal])
					- event.movementX,
			y : parseInt(container.style[pluginQRCodes.style.position.vertical])
					+ event.movementY
		};
		if (position.x < 0) {
			position.x = 0;
		}
		if (position.y < 0) {
			position.y = 0;
		}
		container.style[pluginQRCodes.style.position.vertical] = position.y
				+ 'px';
		container.style[pluginQRCodes.style.position.horizontal] = position.x
				+ 'px';
	},

	initMouseEvents : function() {
		var container = this.getContainer();

		function activeMotion(event) {
			// Check if it's left button
			if (0 != event.button) {
				return;
			}
			console.log('Motion !');
			container.removeEventListener('click', activeMotion);
			window.addEventListener('mousemove', pluginQRCodes.moveContainer);
			container.style.cursor = 'move';
			setTimeout(function() {
				window.addEventListener('click', deactiveMotion);
			}, 10);
		}
		function deactiveMotion(event) {
			// Check if it's left button
			if (0 != event.button) {
				return;
			}
			console.log('Stop !');
			window
					.removeEventListener('mousemove',
							pluginQRCodes.moveContainer);
			window.removeEventListener('click', deactiveMotion);
			container.style.cursor = 'auto';
			setTimeout(function() {
				container.addEventListener('click', activeMotion);
				container.style.cursor = 'pointer';
			}, 10);
		}
		container.addEventListener('click', activeMotion);
		container.style.cursor = 'pointer';
	},

	init : function() {
		chrome.storage.sync.get(pluginQRCodesgetDefaultOptions(), function(
				items) {
			// Set variables thanks to stored settings.
			pluginQRCodes.autoDisplay = items.autoDisplay;

			pluginQRCodes.libraryArguments = {
				width : items.size,
				height : items.size,
				useSVG : true,
				colorDark : '#' + items.color,
				colorLight : '#ffffff',
				correctLevel : QRCode.CorrectLevel.H
			};
			if (!items.color) {
				var color = pluginQRCodes.getMetaColor();
				if (!color) {
					color = '#000000';
				}
				pluginQRCodes.libraryArguments.colorDark = color;
			}

			var size = (parseInt(items.size) + 16) + 'px';
			pluginQRCodes.style = {
				position : {
					vertical : items.verticalPosition,
					horizontal : items.horizontalPosition
				},
				dimension : {
					width : size,
					height : size
				}
			};

			// Inits events listeners
			pluginQRCodes.initPrintEvents();
			pluginQRCodes.initMouseEvents();
		});
	}
};
(function() {
	pluginQRCodes.init();
})();