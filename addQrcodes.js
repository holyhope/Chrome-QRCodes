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

function init() {
	var qrcode = document.createElement('div');
	qrcode.id = 'extension-qrcodes-qrcode';
	document.getElementsByTagName('body')[0].appendChild(qrcode);

	var $args;
	var autoDisplay;

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

	var beforePrint = function() {
		args.text = window.location.href;
		new QRCode(qrcode, args);
		window.onbeforeprint = beforePrint = function() {
			if (autoDisplay && qrcode.style.display != 'block') {
				qrcode.style.display = 'block';
			}
		};
		beforePrint();
	};

	var afterPrint = function() {
		qrcode.style.display = 'none';
	}

	if (window.matchMedia) {
		var mediaQueryList = window.matchMedia('print');
		mediaQueryList.addListener(function(mql) {
			if (mql.matches) {
				beforePrint();
			} else {
				afterPrint();
			}
		});
	}
	window.onbeforeprint = beforePrint;
	window.onafterprint = afterPrint;
}
init();