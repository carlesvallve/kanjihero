var inherit = require('inherit');
var WuiDom = require('WuiDom');

function WuiImage(asset) {
	WuiDom.call(this);

	if (asset.getUrl) {
		this.setAsset(asset);
	} else if (typeof asset === 'string') {
		this.setUrl(asset);
	}
}

inherit(WuiImage, WuiDom);
module.exports = WuiImage;


WuiImage.prototype.setAsset = function (asset) {
	this.asset = asset;
	this.url = null;
	this.loaded = false;
};


WuiImage.prototype.setUrl = function (url) {
	this.asset = null;
	this.url = url;
	this.loaded = false;
};


WuiImage.prototype.getUrl = function () {
	return this.url || this.asset.getUrl();
};


WuiImage.prototype.load = function () {
	var that = this;

	if (this.loaded) {
		this.emit('loaded', that);
	}

	if (!this.rootElement) {
		this.assign(new window.Image());
	}

	var img = this.rootElement;

	img.onload = function () {
		that.loaded = true;
		img.onload = null;
		img.onerror = null;

		that.emit('loaded', img.src);
	};

	img.onerror = function (domEvent) {
		that.loaded = false;
		img.onload = null;
		img.onerror = null;

		that.emit('error', img.src, domEvent);
	};

	img.src = this.getUrl();
};