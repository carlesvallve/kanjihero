var userAgent = navigator.userAgent.toLowerCase();

function versionCompare(a, b) {
	a = a.split('.');
	b = b.split('.');

	var minLength = Math.min(a.length, b.length);

	for (var i = 0; i < minLength; i += 1) {
		var va = a.shift();
		var vb = b.shift();

		if (va === vb) {
			continue;
		}

		while (va.length > 0 || vb.length > 0) {
			var na = va.match(/^0*([0-9]+)/);
			var nb = vb.match(/^0*([0-9]+)/);

			if (na) {
				va = va.substring(na[0].length);
			}
			if (nb) {
				vb = vb.substring(nb[0].length);
			}

			na = na ? parseInt(na[1], 10) : 0;
			nb = nb ? parseInt(nb[1], 10) : 0;

			if (na !== nb) {
				return (na < nb) ? -1 : 1;
			}

			// both numeric versions equal, check non-numeric part

			na = va.match(/^([^0-9]+?)/);
			nb = vb.match(/^([^0-9]+?)/);

			if (na) {
				va = va.substring(na[0].length);
			}
			if (nb) {
				vb = vb.substring(nb[0].length);
			}

			na = na ? na[1] : '';
			nb = nb ? nb[1] : '';

			if (na !== nb) {
				return (na < nb) ? -1 : 1;
			}
		}
	}

	if (a.length === b.length) {
		return 0;
	}

	return (a.length < b.length) ? -1 : 1;
}


exports.getWebKitVersion = function () {
	var m = userAgent.match(/(applewebkit\/)([0-9]+(?:\.[0-9]*)*)/);
	if (m) {
		return m[2];
	}

	return false;
};


exports.isIOS = function () {
	return userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipod') > -1 || userAgent.indexOf('ipad') > -1;
};


exports.isAndroid = function () {
	return userAgent.indexOf('android') > -1;
};


exports.isMinWebKitVersion = function (version) {
	return versionCompare(this.getWebKitVersion(), version) >= 0;
};


exports.getIOSVersion = function () {
	if (!this.isIOS()) {
		return false;
	}

	var m = userAgent.match(/os ([0-9]+(_[0-9]+)*)/);
	if (m) {
		return m[1].replace(/_/g, '.');
	}

	return false;
};


exports.getAndroidVersion = function () {
	var m = userAgent.match(/android ([0-9]+(\.[0-9]+)?)/);
	if (m) {
		return m[1];
	}

	return false;
};