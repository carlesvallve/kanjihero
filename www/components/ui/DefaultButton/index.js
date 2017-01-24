var inherit = require('inherit');
var WuiDom = require('WuiDom');
var buttonBehavior = require('wuiButtonBehavior');

/**
 * @class
 * @classdesc Default button of the game
 * @extends WuiDom
 * @param {String} caption
 * @param {Object} [options] - (className, color)
 */
function DefaultButton(caption, options) {
	WuiDom.call(this);

	var self = this;
	options = options || {};
	this.assign('button', { className: 'DefaultButton' });

	if (options.className) { this.addClassNames(options.className); }

	this.label = this.createChild('div', { className: 'label', text: caption });

	buttonBehavior(this, { tapDelay: 250, maxDeviation: 10, repeatDelay: 500 });

	this.on('tapstart', function () {
		this.addClassNames('pressed');
	});

	this.on('tapend', function () {
		this.delClassNames('pressed');
	});

	this.on('disabled', function () {
		self._isDisabled = true;
		self.addClassNames('disabled');
	});

	this.on('enabled', function () {
		self._isDisabled = false;
		self.delClassNames('disabled');
	});

	this.update = function (caption) {
		this.label.setText(caption);
	};

	this.isDisabled = function () {
		return this._isDisabled || false;
	};
}

inherit(DefaultButton, WuiDom);
module.exports = DefaultButton;

