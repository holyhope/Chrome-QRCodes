var pluginQRCodes = {
	libraryArguments : false, // Used to create qrcodes.
	autoDisplay : false, // True if qrcode must be shown on print.
	style : false,
	padding : 8,

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
		var container = document.getElementById('extension-qrcodes-qrcode');
		if (container != null) {
			return container;
		}
		// Otherwise, create One
		container = document.createElement('div');
		container.id = 'extension-qrcodes-qrcode';
		container.style[this.style.position.vertical] = '0px';
		container.style[this.style.position.horizontal] = '0px';
		container.style.width = this.style.dimension.width;
		container.style.height = this.style.dimension.height;
		container.style.padding = this.padding + 'px';
		var bodies = document.getElementsByTagName('body');
		// Check if it is a well structured dom.
		if (bodies.length == 0) {
			return false;
		}
		// Put qrcode in the dom.
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(container);
		return container;
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

	getDimension : function() {
		var container = this.getContainer();
		var padding = this.padding * 2;

		return dimension = {
			width : parseInt(container.style.width) + padding,
			height : parseInt(container.style.height) + padding
		};
	},

	getPosition : function() {
		var container = this.getContainer();

		return {
			x : parseInt(container.style[pluginQRCodes.style.position.horizontal]),
			y : parseInt(container.style[pluginQRCodes.style.position.vertical])
		};
	},

	setPosition : function(position) {
		var dimension = this.getDimension();

		// Fix a bug
		dimension.height -= 2 * this.padding;

		var widthArea = window.innerWidth;
		if (position.x < 0) {
			position.x = 0;
		} else if (position.x + dimension.width >= widthArea) {
			position.x = widthArea - dimension.width - 1;
		}

		var heightArea = window.innerHeight;
		if (position.y < 0) {
			position.y = 0;
		} else if (position.y + dimension.height >= heightArea) {
			position.y = heightArea - dimension.height - 1;
		}

		var container = this.getContainer();

		container.style[pluginQRCodes.style.position.horizontal] = parseInt(position.x)
				+ 'px';
		container.style[pluginQRCodes.style.position.vertical] = parseInt(position.y)
				+ 'px';
	},

	moveContainer : function(event) {
		var container = pluginQRCodes.getContainer();

		var position = pluginQRCodes.getPosition();
		position.x -= event.movementX;
		position.y += event.movementY;
		pluginQRCodes.setPosition(position);
	},

	initMouseEvents : function() {
		var container = this.getContainer();

		function activeMotion(event) {
			// Check if it's left button
			if (0 != event.button) {
				return;
			}
			event.preventDefault();
			container.removeEventListener('mousedown', activeMotion);
			window.addEventListener('mousemove', pluginQRCodes.moveContainer);
			window.addEventListener('mouseup', deactiveMotion);
		}
		function deactiveMotion(event) {
			// Check if it's left button
			if (0 != event.button) {
				return;
			}
			window
					.removeEventListener('mousemove',
							pluginQRCodes.moveContainer);
			window.removeEventListener('mouseup', deactiveMotion);
			container.addEventListener('mousedown', activeMotion);
		}
		container.addEventListener('mousedown', activeMotion);
	},

	initWindowEvents : function(event) {
		var innerWidth = window.innerWidth;
		var innerHeight = window.innerHeight;

		var timeout;

		function fixPosition(event) {
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				var position = pluginQRCodes.getPosition();
				var dimension = pluginQRCodes.getDimension();
				var widthArea = window.innerWidth;
				var heightArea = window.innerHeight;

				var newInnerWidth = event.target.innerWidth;
				var newInnerHeight = event.target.innerHeight;
				position.x = (position.x * newInnerWidth) / innerWidth;
				position.y = (position.y * newInnerHeight) / innerHeight;
				innerWidth = newInnerWidth;
				innerHeight = newInnerHeight;

				pluginQRCodes.setPosition(position);
			}, 170);
		}
		window.addEventListener('resize', fixPosition);
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
			pluginQRCodes.initWindowEvents();
			pluginQRCodes.initMouseEvents();
		});
	}
};
(function() {
	pluginQRCodes.init();
})();