var qrcode = document.getElementById('extension-qrcodes-qrcode');
if (typeof qrcode != 'undefined') {
    if (qrcode.style.display == 'block') {
	qrcode.style.display = 'none';
    } else {
	window.onbeforeprint();
	qrcode.style.display = 'block';
    }
}