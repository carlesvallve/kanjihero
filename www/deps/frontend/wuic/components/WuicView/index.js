var Sprite = require('WuicSprite');
var inherit = require('inherit');


/**
 * @class
 * @classDesc
 * @augments WuicSprite
 */
function View() {

	Sprite.call(this);

	this.data = {};
	this.name = 'default';
	this.zIndex = 0;
}

inherit(View, Sprite);
module.exports = View;


// overwrite these functions if you want to make custom transition.
// at the end of the transition, te view must emit 'opened' or 'closed' (used by NavTree)

// params are the data we want to send to the view. Sent by other views

// options is the way we open or close the view (if we have transition), sent by NavTree
// e.g. : we want to know if it's a forward or back transition.

/**
 * @param data
 * @param options
 */
View.prototype.open = function (data, options) {
	options = options || {};
	this.data = data || {};
	this.emit('opened');
};

/**
 * @param options
 */
View.prototype.close = function (options) {
	options = options || {};
	this.emit('closed');
};

/**
 * @param data
 * @param options
 */
View.prototype.refresh = function (data, options) {
	options = options || {};
	this.data = data || {};
	this.emit('refreshed');
};
