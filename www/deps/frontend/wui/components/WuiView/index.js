var inherit = require('inherit');
var WuiDom = require('WuiDom');

/**
 * @class
 * @classDesc
 * @augments WuiDom
 */
function WuiView() {
	WuiDom.call(this);
	this.assign('div', { className: 'WuiView' });
	this.hideMethod();
}

inherit(WuiView, WuiDom);
module.exports = WuiView;

/**
 * @param options
 * @param itemName
 */
WuiView.prototype.create = function (options, itemName) {

	options.parentElement.appendChild(this.rootElement);
	this.emit('created', options, itemName);
};

/**
 * @param params
 */
WuiView.prototype.open = function () {
	window.document.documentElement.scrollIntoView(true);
	this.show();
};

/**
 * close
 */
WuiView.prototype.close = function () {
	this.hide();
};

/**
 * disableScrolling
 */
WuiView.prototype.disableScrolling = function () {
	this.allowDomEvents();

	this.scrollingDisabled = true;
	var that = this;

	this.on('dom.touchmove', function (e) {
		// note: this does not work on a desktop

		if (that.scrollingDisabled) {
			e.preventDefault();
		}
	});
};

/**
 * enableScrolling
 */
WuiView.prototype.enableScrolling = function () {
	this.scrollingDisabled = false;
};