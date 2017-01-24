var inherit = require('inherit');
var WuiDom = require('WuiDom');

function WuiImageList() {
	WuiDom.call(this);

	this.images = [];
	this.loaded = [];
	this.errored = [];
	this.map = {};

	var that = this;

	this.on('destroy', function () {
		var images = that.getAll();

		for (var i = 0, len = images.length; i < len; i++) {
			images[i].destroy();
		}

		that.images = [];
		that.map = {};
	});
}

inherit(WuiImageList, WuiDom);
module.exports = WuiImageList;


WuiImageList.prototype.get = function (name) {
	return this.map[name] || null;
};


WuiImageList.prototype.getAll = function () {
	var list = [];

	for (var name in this.map) {
		list.push(this.map[name]);
	}

	return this.images.concat(list);
};


WuiImageList.prototype._parseLoading = function (img, hasSucceed) {

	var images = this.getAll();

	if (hasSucceed) {
		this.loaded.push(img);
	} else {
		this.errored.push(img);
	}

	var nbLoaded = this.loaded.length;
	var nbError = this.errored.length;
	var nbTotal = images.length;

	this.emit('loading', { current: img, parsed: nbLoaded + nbError, total: nbTotal });

	if (nbTotal === (nbLoaded + nbError)) {

		if (nbLoaded > 0) {
			this.emit('loaded', this.loaded);
		}

		if (nbError > 0) {
			this.emit('error', this.errored);
		}
	}
};

WuiImageList.prototype.appendChild = function (img, name) {
	var that = this;

	if (name) {
		this.map[name] = img;
	} else {
		this.images.push(img);
	}

	function onLoaded() {
		that._parseLoading(img, true);
		img.removeListener('error', onError);
	}

	function onError() {
		that._parseLoading(img, false);
		img.removeListener('loaded', onLoaded);
	}

	img.once('loaded', onLoaded);
	img.once('error', onError);
};


WuiImageList.prototype.load = function () {
	// load all images and when all are done, call cb

	var images = this.getAll();
	var i, len = images.length;

	for (i = 0; i < len; i++) {
		images[i].load();
	}

	return images;
};

