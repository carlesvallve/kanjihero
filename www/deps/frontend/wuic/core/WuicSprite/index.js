var inherit = require('inherit');
var EventEmitter = require('EventEmitter');

/**
 * @class
 * @classDesc - wrapper for renderable object in HTML5 canvas
 *
 * @extends EventEmiter
 */

function Sprite() {

	EventEmitter.call(this);

	//TODO: this looks dangerous, try an other implementation
	this.context = window.context || null;

	this.x = 0;
	this.y = 0;
	this.pivotX = 0;
	this.pivotY = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.width = 0;
	this.height = 0;
	this.skewX = 0;
	this.skewY = 0;
	this.alpha = 1;
	this.rotation = 0;

	this._visible = true;
	this.__enable = true;

	this._parent = null;
	this._children = [];
	this._draw = null;

	// getLocalCoordinate cache
	this._localCoordinate = {
		timeStamp: -1
	};

}

inherit(Sprite, EventEmitter);

module.exports = Sprite;

//███████████████████████████████████████████████████████▀██████████████████████████████████████████████
//███████████████████████████████████████████▀██████████▀▄██████████▄ █████████▄██████▄ ████████▄ ██████
//██▄ ▀▄▄▀██▀▄▄▄▄▀██▄ ▀▄▄▄██▀▄▄▄▄▀██▄ ▀▄▄▀██▄ ▄▄▄██████▀▄███▀▄▄▄▀ ███ ▀▄▄▀███▄▄ ███████ ████▀▄▄▄▀ ██████
//███ ███ ██▀▄▄▄▄ ███ ██████ ▄▄▄▄▄███ ███ ███ ████████▀▄████ ████████ ███ █████ ███████ ████ ████ ██████
//███ ▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀▀▀███▄▀▀▀▀▀██▀ ▀█▀ ▀██▄▀▀▀▄███▀▄█████▄▀▀▀▀▄██▀ ▀█▀ ▀██▀▀ ▀▀███▀▀ ▀▀██▄▀▀▀▄ ▀█████
//██▀ ▀██████████████████████████████████████████████▄██████████████████████████████████████████████████
//██████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @returns {Sprite}
 */
Sprite.prototype.getParent = function () {
	return this._parent;
};

/**
 * @param {Number} index
 * @returns {Sprite}
 */
Sprite.prototype.getChildByIndex = function (index) {
	if (index !== undefined && this._children[index]) {
		return this._children[index];
	}

	return null;
};

/**
 * @returns {Number}
 */
Sprite.prototype.getIndex = function () {
	if (this._parent) {
		return this._parent._children.indexOf(this);
	}
	// no parent
	return null;
};


//█████████████████████████████████████████████████████████████████
//███████████▄▄ ▄▄██████████████▄ █████████████████████████████████
//███ ▄▄ ▄█████ ████▄ ▀▄▄▀██▀▄▄▄▀ ██▀▄▄▄▄▀██▄ ██ ▄█████████████████
//████▀▄███████ █████ ███ ██ ████ ██ ▄▄▄▄▄████  ███████████████████
//███ ▀▀▀ ███▀▀ ▀▀██▀ ▀█▀ ▀█▄▀▀▀▄ ▀█▄▀▀▀▀▀██▀ ██ ▀█████████████████
//█████████████████████████████████████████████████████████████████


/**
 * @desc - Move itself to the bottom of index
 */
Sprite.prototype.moveToBottomIndex = function () {
	if (this._parent) {
		var siblings = this._parent._children;
		var myIndex = siblings.indexOf(this);
		siblings.splice(0, 0, siblings.splice(myIndex, 1)[0]);
	}
};

/**
 * @desc - Move itself to the top of index
 */
Sprite.prototype.moveToTopIndex = function () {
	if (this._parent) {
		var siblings = this._parent._children;
		var myIndex = siblings.indexOf(this);
		var me = siblings.splice(myIndex, 1)[0];
		siblings.push(me);
	}
};

/**
 * @desc - Rearange the order of the children (for painting)
 * @param {Function} sortFunc
 */
Sprite.prototype.sortChilden = function (sortFunc) {
	this._children.sort(sortFunc);
};


//████████████████████████████████████████████████████████████████████████████
//██████████▄ █████████▄██████▄ ████████▄ ████████████████████████████████████
//██▀▄▄▄▀ ███ ▀▄▄▀███▄▄ ███████ ████▀▄▄▄▀ ██████████▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▄ ████
//██ ████████ ███ █████ ███████ ████ ████ ██████████ ████ ███ ███ ███▄▄▄▄▀████
//██▄▀▀▀▀▄██▀ ▀█▀ ▀██▀▀ ▀▀███▀▀ ▀▀██▄▀▀▀▄ ▀█████████▄▀▀▀▀▄███ ▀▀▀▄██ ▀▀▀▀▄████
//██████████████████████████████████████████████████████████▀ ▀███████████████
//████████████████████████████████████████████████████████████████████████████

/**
 * @returns {Sprite}
 */
Sprite.prototype.createChild = function () {
	var sprite = new Sprite();
	this.appendChild(sprite);
	return sprite;
};

/**
 * @param {Sprite} sprite
 * @returns {Sprite}
 */
Sprite.prototype.appendChild = function (sprite) {
	if (sprite._parent && this !== sprite._parent) {
		console.warn('Sprite.appendChild: given sprite is a child of another parent');
		sprite._parent.removeChild(sprite);
	}
	if (this === sprite._parent) {
		return sprite;
	}
	// inherit canvas context from parent sprite
	sprite.context = this.context;
	this._children.push(sprite);
	sprite._parent = this;

	return sprite;
};

/**
 * @param {Sprite} sprite
 */
Sprite.prototype.removeChild = function (sprite) {
	var index = this._children.indexOf(sprite);
	if (index === -1) {
		return console.warn('Sprite.removeChild: Given sprite is not a child.');
	}
	this._children.splice(index, 1);
	sprite.context = null;
	sprite._parent = null;
};

/**
 * @desc - Destroy all Sprite children
 */
Sprite.prototype.destroyChildren = function () {
	var children = this._children.slice();
	while (children.length > 0) {
		var child = children.pop();
		child.destroy();
	}
	this._children = [];
};

/**
 * @dec - Remove itself from its parent, and destroy itself
 */
Sprite.prototype.destroy = function () {
	this.emit('destroy');

	if (this._parent) {
		this._parent.removeChild(this);
	}
	this.context = null;
	this.destroyChildren();
	this.removeAllListeners();
};

/**
 * @desc - Detach itself from its parent without destroying the object
 */
Sprite.prototype.detach = function () {
	this._parent.removeChild(this);
};


//█████████████████████████████████████████████████████████████████
//██████▄ █████████████████████████████▄███████████████████████████
//██▀▄▄▄▀ ██▄ ▀▄▄▄██▀▄▄▄▄▀██▄ ▄█▄ ▄██▄▄ ████▄ ▀▄▄▀██▀▄▄▄▀ ▄████████
//██ ████ ███ ██████▀▄▄▄▄ ███ █ █ █████ █████ ███ ██ ████ █████████
//██▄▀▀▀▄ ▀█▀ ▀▀▀███▄▀▀▀▄ ▀██▄▀▄▀▄███▀▀ ▀▀██▀ ▀█▀ ▀█▄▀▀▀▄ █████████
//███████████████████████████████████████████████████▀▀▀▀▄█████████
//█████████████████████████████████████████████████████████████████

/**
 * @desc - Paint the Sprite on the canvas
 */
Sprite.prototype.render = function () {
	if (this._visible) {

		var context = this.context;

		context.save();

		context.globalAlpha = context.globalAlpha * this.alpha;
		context.translate(this.x + this.pivotX, this.y + this.pivotY);
		context.rotate(this.rotation);
		context.transform(1, Math.tan(this.skewY), Math.tan(this.skewX), 1, 0, 0); //skew
		context.scale(this.scaleX, this.scaleY);
		// offset the center of the Sprite object after scale and rotation
		context.translate(-this.pivotX, -this.pivotY);

		// render myself
		if (this._draw) {
			this._draw(context);
		}

		// render children
		for (var i = 0; i < this._children.length; i++) {
			var child = this._children[i];
			if (child) {
				child.render();
			}
		}

		context.restore();
	}
};

/**
 * @desc - Extra logic for painting
 * @param {Function} drawingFunc
 */
Sprite.prototype.setRenderMethod = function (drawingFunc) {
	if (typeof drawingFunc !== 'function') {
		return console.warn('Sprite.setRenderMethod: Expecting the argument to be a function.');
	}
	this._draw = drawingFunc;
};

/**
 * @param context
 */
Sprite.prototype.setContext = function (context) {
	// TODO: check if this is still useful
	this.context = context;
};


// Default show/hide implementation
/**
 * @param {Object} [data]
 */
Sprite.prototype.show = function (data) {
	if (this._visible) {
		return;
	}
	this._visible = true;
	this.emit('show', data);
};

/**
 * @param {Object} [data]
 */
Sprite.prototype.hide = function (data) {
	if (this._visible) {
		this._visible = false;
		this.emit('hide', data);
	}
};


//████████████████████████████████████████████████████████████████████
//███████████████████▀██████▄ ▄███████████████████████████████▄ ██████
//██▀▄▄▄▀ ▄█▀▄▄▄▄▀██▄ ▄▄▄████ ██████▀▄▄▄▄▀██▀▄▄▄▀ ██▀▄▄▄▄▀█████ ██████
//██ ████ ██ ▄▄▄▄▄███ ███████ ███▀██ ████ ██ ███████▀▄▄▄▄ █████ ██████
//██▄▀▀▀▄ ██▄▀▀▀▀▀███▄▀▀▀▄██▀ ▀▀▀ ██▄▀▀▀▀▄██▄▀▀▀▀▄██▄▀▀▀▄ ▀██▀▀ ▀▀████
//███▀▀▀▀▄████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████

/**
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 * @desc - given a point coordinate, this function will go thru all the
 *         parents of the Sprite, revert back the applied transformations
 *         and return the local coordinate of this point relatively to the Sprite
 *         with some other informations such as visibility and enability
 *
 * @param {Number} x - point absolute coordinate (x-axis)
 * @param {Number} y - point absolute coordinate (y-axis)
 * @param {Number} timeStamp - point absolute coordinate (y-axis)
 *
 * @return {Object} - {
 *    x : point absolute coordinate (unchanged)
 *    y : point absolute coordinate (unchanged)
 *    localX : point coordinate relative to the sprite
 *    localY : point coordinate relative to the sprite
 *    parentX : point coordinate relative to Sprite direct parent
 *    parentY : point coordinate relative to Sprite direct parent
 *    enabled : true if self and all parents are enabled
 *    visible : true if self and all parents are visible
 * }
 */

Sprite.prototype.getLocalCoordinate = function (x, y, timeStamp) {

	/**
	 * getLocalCoordinate cache :
	 *
	 * if it's the same touchevent that trigger this function,
	 * then return the previously calculated values
	 * --------------------------------------------------------------------
	 * BENCHMARK : average time for all button to get local coordinate
	 *             when a touchevent is fired.
	 *             12 buttons of depth 3, with same parent.
	 *
	 *                  +----------------+-------------+------------------+
	 *                  | without cache  | with cache  |       gain       |
	 * +----------------+----------------+-------------+------------------+
	 * | chrome         | 0.0159 ms      | 0.0038 ms   | 4.2 times faster |
	 * | iPod4 (safari) | 2.2582 ms      | 0.6229 ms   | 3.6 times faster |
	 * +----------------+----------------+--------------------------------+
	 */

	if (this._localCoordinate.timeStamp === timeStamp && this._localCoordinate.x === x && this._localCoordinate.y === y) {
		return {
			x: x,
			y: y,
			localX: this._localCoordinate.localX,
			localY: this._localCoordinate.localY,
			parentX: this._localCoordinate.parentX,
			parentY: this._localCoordinate.parentY,
			visible: this._localCoordinate.visible,
			enabled: this._localCoordinate.enabled
		};
	}

	var result = {
		x: x,
		y: y,
		localX: x,
		localY: y,
		parentX: x,
		parentY: y,
		visible: true,
		enabled: true
	};

	// revert the parent transformation
	if (this._parent) {
		result = this._parent.getLocalCoordinate(result.localX, result.localY, timeStamp);
		result.parentX = result.localX;
		result.parentY = result.localY;
	}

	// revert first translation
	result.localX = result.localX - this.x - this.pivotX;
	result.localY = result.localY - this.y - this.pivotY;

	// revert rotation
	var cosR = Math.cos(this.rotation);
	var sinR = Math.sin(this.rotation);
	var rotX = (cosR * result.localX) + (sinR * result.localY);
	result.localY = (-sinR * result.localX) + (cosR * result.localY);
	result.localX = rotX;

	// revert skew
	var skew = result.localX + result.localY * Math.tan(-this.skewX);
	result.localY = result.localY + result.localX * Math.tan(-this.skewY);
	result.localX = skew;

	// revert scale
	result.localX = result.localX / this.scaleX;
	result.localY = result.localY / this.scaleY;

	// revert pivot translation
	result.localX = result.localX + this.pivotX;
	result.localY = result.localY + this.pivotY;

	// compute visibility and enabled
	result.visible = result.visible && this._visible;
	result.enabled = result.enabled && this.__enable;

	// store localCoordinate
	if (timeStamp) {
		this._localCoordinate = {
			x: x,
			y: y,
			localX: result.localX,
			localY: result.localY,
			parentX: result.parentX,
			parentY: result.parentY,
			visible: result.visible,
			enabled: result.enabled,
			timeStamp: timeStamp
		};
	}

	return result;
};


//███████████████████████▀████████████████████████████████████████████████████████████
//██████████████████████▀▄██████▄ █████▄███████████████████▄ █████████▄ ██████████████
//██▀▄▄▄▄▀██▄ ▀▄▄▀█████▀▄███▀▄▄▄▀ ███▄▄ ████▀▄▄▄▄ ██▀▄▄▄▄▀██ ▀▄▄▄▀█████ ████▀▄▄▄▄▀████
//██ ▄▄▄▄▄███ ███ ████▀▄████ ████ █████ █████▄▄▄▄▀██▀▄▄▄▄ ██ ████ █████ ████ ▄▄▄▄▄████
//██▄▀▀▀▀▀██▀ ▀█▀ ▀██▀▄█████▄▀▀▀▄ ▀██▀▀ ▀▀██ ▀▀▀▀▄██▄▀▀▀▄ ▀▀ ▄▀▀▀▄███▀▀ ▀▀██▄▀▀▀▀▀████
//███████████████████▄████████████████████████████████████████████████████████████████

/**
 * @desc - Enable the Sprite for touch events
 */
Sprite.prototype.enable = function () {
	this.__enable = true;
};

/**
 * @desc - Disable the Sprite for touch events
 */
Sprite.prototype.disable = function () {
	this.__enable = false;
};