var mage = require('mage');

var ImgLoader = function (fileList, cb, assets) {
	this.list  = [];
	this.total = null;
	this.cb    = typeof cb === 'function' ? cb : null;
	this.onFileLoad = null;


	var keys = Object.keys(fileList);
	var i;

	for (i = 0; i < keys.length; i++) {
		assets[keys[i]] = new Image();
		this.add(assets[keys[i]], fileList[keys[i]]);
	}

	this.setOnFileLoad(function (src, loaded, total) {
		if (window.cordova) {
			window.cordova.sendMsg({ message: 'loadingUpdate', value: ('assets (' + loaded + '/' + total + ')') });
		}
	});

	// start img asset loader
	//this.start();
};

module.exports = ImgLoader;



ImgLoader.prototype.add = function (img, src) {
	this.list.push({img: img, src: src});
};

// function used to display a progress bar.
// the function will receive 2 parameters: the current number of files loaded and the total number
ImgLoader.prototype.setOnFileLoad = function (fn) {
	if (typeof fn === 'function') {
		this.onFileLoad = fn;
	}
};

ImgLoader.prototype.start = function () {

	var that = this;

	this.total = this.list.length;

	var imgOnLoadFunction = function () {
		that.total--;
		if (that.total === 0) {
			// All assets are loaded
			if (typeof that.cb === 'function') {
				that.cb();
			}
		} else {
			if (that.onFileLoad) {
				var num = that.list.length - that.total;
				that.onFileLoad(that.list[num].src, num, that.list.length);
			}
		}
	};

	for (var i = 0; i < this.list.length; i++) {
		this.list[i].img.onload = imgOnLoadFunction;
		this.list[i].img.src = mage.assets.get('img/' + this.list[i].src);
	}
};