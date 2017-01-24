var inherit = require('inherit');
var Dom = require('WuiDom');
var buttonBehavior = require('wuiButtonBehavior');

/**
 * @param {String} caption
 * @class
 * @classDesc Generic button for Wui
 * @augments WuiDom
 */
function WuiButton(caption) {
	Dom.call(this);
	this.assign('div', { className: 'WuiButton', text: caption });
	buttonBehavior(this);
}

inherit(WuiButton, Dom);
module.exports = WuiButton;
