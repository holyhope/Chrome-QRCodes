var pluginQRCodes = {
	libraryArguments : false, // Used to create qrcodes.
	autoDisplay : false, // True if qrcode must be shown on print.
	maxDimension : {
		width : 400,
		height : 400
	},
	minDimension : {
		width : 100,
		height : 100
	},
	defaultStyleData : {
		padding : 8,
	}, // Object containing style

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

		// Add styles
		container.style[this.defaultStyleData.position.vertical] = '0px';
		container.style[this.defaultStyleData.position.horizontal] = '0px';
		container.style.width = this.defaultStyleData.dimension.width + 'px';
		container.style.height = this.defaultStyleData.dimension.height + 'px';
		container.style.padding = this.defaultStyleData.padding + 'px';

		var step = 30;

		// WHere buttons will be inserted.
		var buttonsContainer = document.createElement('div');
		buttonsContainer.id = 'buttons-container';
		buttonsContainer.className = 'btn-group-vertical';
		buttonsContainer.style[this.defaultStyleData.position.vertical] = this.defaultStyleData.padding
				+ 'px';
		buttonsContainer.style[this.defaultStyleData.position.horizontal] = this.defaultStyleData.padding
				+ 'px';
		container.appendChild(buttonsContainer);
		// Disable container motion with buttons.
		buttonsContainer.addEventListener('mousedown', function(event) {
			event.stopPropagation();
		});

		// Add buttons
		var zoomOut = document.createElement('button');
		zoomOut.type = 'button';
		zoomOut.className = 'btn btn-default';
		var zoomContent = document.createElement('span');
		zoomContent.className = 'glyphicon';
		zoomOut.appendChild(zoomContent);

		var zoomIn = zoomOut.cloneNode(true);
		zoomIn.id = 'zoom-in';
		zoomOut.id = 'zoom-out';
		zoomIn.lastChild.className += ' glyphicon-plus';
		zoomOut.lastChild.className += ' glyphicon-minus';

		zoomIn.addEventListener('click', function() {
			var dimension = pluginQRCodes.getDimension();
			dimension.width += step;
			dimension.height += step;

			// Keep qrcode centered at its position.
			/*
			 * var dimensionOld = this.getDimension(); var position =
			 * this.getPosition(); position.x += (dimensionOld.width -
			 * dimension.width) / 2; position.y += (dimensionOld.width -
			 * dimension.width) / 2; this.setPosition(position);
			 */

			pluginQRCodes.setDimension(dimension);
		});
		zoomOut.addEventListener('click', function() {
			var dimension = pluginQRCodes.getDimension();
			dimension.width -= step;
			dimension.height -= step;

			// Keep qrcode centered at its position.
			/*
			 * var dimensionOld = this.getDimension(); var position =
			 * this.getPosition(); position.x += (dimensionOld.width -
			 * dimension.width) / 2; position.y += (dimensionOld.width -
			 * dimension.width) / 2; this.setPosition(position);
			 */

			pluginQRCodes.setDimension(dimension);
		});
		buttonsContainer.appendChild(zoomIn);
		buttonsContainer.appendChild(zoomOut);

		// Put qrcode in the dom.
		document.body.appendChild(container);

		return container;
	},

	/**
	 * Display qrcode if hidden, else hide it.
	 */
	switchDisplay : function() {
		var container = this.getContainer();
		if (!container) {
			return;
		}
		if (container.style.display == 'block') {
			container.style.display = 'none';
			pluginQRCodes
					.setDimension(pluginQRCodes.defaultStyleData.dimension);
		} else {
			window.onbeforeprint();
			container.style.display = 'block';
		}
	},

	/**
	 * Get current dimension of the qrcode.
	 * 
	 * @returns {(int) width, (int) height}
	 */
	getDimension : function() {
		var container = this.getContainer();
		var padding = this.defaultStyleData.padding * 2;

		return dimension = {
			width : parseInt(container.style.width) + padding,
			height : parseInt(container.style.height) + padding
		};
	},

	/**
	 * Set dimension for the qrcode.
	 * 
	 * @params {(int) width, (int) height}
	 */
	setDimension : function(dimension) {
		var container = this.getContainer();
		var padding = this.defaultStyleData.padding * 2;

		if (dimension.width > this.maxDimension.width) {
			dimension.width = this.maxDimension.width;
		} else if (dimension.width < this.minDimension.width) {
			dimension.width = this.minDimension.width;
		}

		if (dimension.height > this.maxDimension.height) {
			dimension.height = this.maxDimension.height;
		} else if (dimension.height < this.minDimension.height) {
			dimension.height = this.minDimension.height;
		}

		var innerWidth = window.innerWidth;
		if (dimension.width > innerWidth) {
			dimension.width = innerWidth - 1;
		}

		var innerHeight = window.innerHeight;
		if (dimension.height > innerHeight) {
			dimension.height = innerHeight - 1;
		}

		this.setPosition(this.getPosition());

		container.style.width = parseInt(dimension.width - padding) + 'px';
		container.style.height = parseInt(dimension.height - padding) + 'px';
	},

	/**
	 * Get current position of the qrcode.
	 * 
	 * @returns {(int) x, (int) y}
	 */
	getPosition : function() {
		var container = this.getContainer();

		return {
			x : parseInt(container.style[pluginQRCodes.defaultStyleData.position.horizontal]),
			y : parseInt(container.style[pluginQRCodes.defaultStyleData.position.vertical])
		};
	},

	/**
	 * Define a position for the qrcode and fix them to fit in current window.
	 * 
	 * @param position -
	 *            new position of the qrcode.
	 */
	setPosition : function(position) {
		var dimension = this.getDimension();

		// use clientWidth instead of innerWidth to remove scroll bar from
		// calculus.
		if (position.x < 0) {
			position.x = 0;
		} else {
			var maxWidthArea = document.body.clientWidth - dimension.width;
			if (position.x > maxWidthArea) {
				position.x = maxWidthArea - 1;
			}
		}

		// clientHeight does not work here because, page is taller than windows
		if (position.y < 0) {
			position.y = 0;
		} else {
			var maxHeightArea = window.innerHeight - dimension.height;
			if (position.y > maxHeightArea) {
				position.y = maxHeightArea - 1;
			}
		}

		var container = this.getContainer();

		container.style[pluginQRCodes.defaultStyleData.position.horizontal] = parseInt(position.x)
				+ 'px';
		container.style[pluginQRCodes.defaultStyleData.position.vertical] = parseInt(position.y)
				+ 'px';
	},

	/**
	 * Move the qrcode thanks to event.movementX and event.movementY.
	 * 
	 * @param event -
	 *            Object containing movement.
	 */
	move : function(event) {
		var container = pluginQRCodes.getContainer();

		var position = pluginQRCodes.getPosition();
		var moveX = event.movementX;
		if (pluginQRCodes.defaultStyleData.position.horizontal == 'right') {
			moveX *= -1;
		}
		position.x += moveX;
		var moveY = event.movementY;
		if (pluginQRCodes.defaultStyleData.position.vertical == 'bottom') {
			moveY *= -1;
		}
		position.y += moveY;
		pluginQRCodes.setPosition(position);
	},

	createQrcode : function() {
		var container = pluginQRCodes.getContainer();

		this.libraryArguments.text = window.location.href;
		try {
			new QRCode(container, this.libraryArguments);
		} catch (e) {
			console.log(e);
			// Empty container
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			// Add error message
			var errorMessage = chrome.i18n.getMessage('tooLongURL');
			var errorNode = document.createTextNode(errorMessage);
			container.className = 'error';
			container.appendChild(errorNode);
			setTimeout(function() {
				container.style.display = 'none';
			}, 5000);
			chrome.runtime.sendMessage({
				log : {
					level : 'notice',
					message : errorMessage
				},
				disable : true
			}, function(response) {
				if (chrome.runtime.lastError) {
					console.log('[error]' + chrome.runtime.lastError.message);
				}
			});
		}
	},

	/**
	 * Set print event.
	 */
	initPrintEvents : function() {
		var beforePrint = function() {
			/**
			 * Display qrcode if autoDisplay is true.
			 */
			function displayIfAuto() {
				if (this.autoDisplay && container.style.display != 'block') {
					container.style.display = 'block';
				}
			}
			window.onbeforeprint = displayIfAuto;

			pluginQRCodes.createQrcode();

			window.onbeforeprint();
		};
		window.onbeforeprint = beforePrint;

		var afterPrint = function() {
			if (!container) {
				return;
			}
			container.style.display = 'none';
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

	/**
	 * Initialize event of mouse.
	 */
	initMouseEvents : function() {
		var container = this.getContainer();

		function activeMotion(event) {
			// Check if it's left button
			if (0 != event.button) {
				return;
			}
			event.preventDefault();
			container.removeEventListener('mousedown', activeMotion);
			window.addEventListener('mousemove', pluginQRCodes.move);
			window.addEventListener('mouseup', deactiveMotion);
			container.style.cursor = 'move';
		}
		function deactiveMotion(event) {
			// Check if it's left button
			if (0 != event.button) {
				return;
			}
			window.removeEventListener('mousemove', pluginQRCodes.move);
			window.removeEventListener('mouseup', deactiveMotion);
			container.addEventListener('mousedown', activeMotion);
			container.style.cursor = 'pointer';
		}
		container.addEventListener('mousedown', activeMotion);

		var step = 15;
		function deactiveWheel(event) {
			if (event.movementX != 0 || event.movementY != 0) {
				window.removeEventListener('mousemove', deactiveWheel);
				document.body
						.removeEventListener('mousewheel', changeDimension);
			}
		}

		function changeDimension(event) {
			event.preventDefault();
			var dimension = pluginQRCodes.getDimension();
			if (event.wheelDelta > 0) {
				dimension.width += step;
				dimension.height += step;
			} else if (event.wheelDelta < 0) {
				dimension.width -= step;
				dimension.height -= step;
			}

			// Keep qrcode centered at its position.
			/*
			 * var dimensionOld = this.getDimension(); var position =
			 * this.getPosition(); position.x += (dimensionOld.width -
			 * dimension.width) / 2; position.y += (dimensionOld.width -
			 * dimension.width) / 2; this.setPosition(position);
			 */

			pluginQRCodes.setDimension(dimension);
			document.body.addEventListener('mousewheel', changeDimension);
			window.addEventListener('mousemove', deactiveWheel);
		}
		container.addEventListener('mousewheel', changeDimension);
	},

	/**
	 * Initialize event of window object.
	 */
	initWindowEvents : function() {
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
				pluginQRCodes.setDimension(dimension);
			}, 170);
		}
		window.addEventListener('resize', fixPosition);

		function resetQrcode() {
			var container = pluginQRCodes.getContainer();
			while (container.lastChild) {
				container.removeChild(container.lastChild);
			}
			pluginQRCodes.createQrcode();
		}
		window.addEventListener('hashchange', resetQrcode, false);
	},

	/**
	 * Initialize plugin.
	 */
	init : function() {
		chrome.storage.sync.get(pluginQRCodesgetDefaultOptions(), function(
				items) {
			// Set variables thanks to stored settings.
			pluginQRCodes.autoDisplay = items.autoDisplay;

			pluginQRCodes.libraryArguments = {
				width : pluginQRCodes.maxDimension.width,
				height : pluginQRCodes.maxDimension.height,
				useSVG : true,
				colorDark : items.color,
				colorLight : '#ffffff',
				correctLevel : QRCode.CorrectLevel.H
			};

			pluginQRCodes.defaultStyleData.position = {
				vertical : items.verticalPosition,
				horizontal : items.horizontalPosition
			};

			var size = parseInt(items.size)
					+ pluginQRCodes.defaultStyleData.padding * 2;
			pluginQRCodes.defaultStyleData.dimension = {
				width : size,
				height : size
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