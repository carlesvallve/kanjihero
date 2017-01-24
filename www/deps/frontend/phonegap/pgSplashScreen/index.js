var doc = window.document;
var cordova = window.cordova || null;
var navSplash = window.navigator.splashscreen || null;
var pgCore = require('pgCore');
var div;

exports.show = function () {
	if (cordova) {
		cordova.exec(null, null, 'SplashScreen', 'show', []);
	} else if (navSplash) {
		navSplash.show();
	} else {
		div = doc.createElement('div');
		div.style.position = 'absolute';
		div.style.zIndex = 9000;
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.left = '0';
		div.style.top = '0';
		div.style.textAlign = 'center';
		div.style['-webkit-box-sizing'] = 'border-box';
		div.style.paddingTop = '50%';
		div.style.fontFamily = 'Helvetica';
		div.style.background = '#888';
		div.innerText = 'SPLASH SCREEN';
		doc.documentElement.appendChild(div);
	}
};


exports.hide = function () {
	if (cordova) {
		cordova.exec(null, null, 'SplashScreen', 'hide', []);
	} else if (navSplash) {
		navSplash.hide();
	} else if (div) {
		div.parentElement.removeChild(div);
		div = null;
	}
};

if (!cordova && !navSplash) {
	// on start, the splash is automatically visible

	exports.show();
}


exports.showOnPause = function () {
	if (window.wizSplash) {
		window.wizSplash.setSplashInBackground(true);
	} else {
		pgCore.onpause(function () {
			exports.show();
		});
	}
};


exports.hideOnResume = function () {
	pgCore.onresume(function () {
		exports.hide();
	});
};