var inherit = require('inherit');
var EventEmitter = require('EventEmitter');

/**
 * @alias WuicTweenSequence
 * @class
 * @param {WuicTween[]} tweens
 */
function TweenSequence(tweens) {
	EventEmitter.call(this);
	this._tweens = tweens;
	this._tweenLen = tweens.length;
	this._current = null;
}

inherit(TweenSequence, EventEmitter);
module.exports = TweenSequence;

/**
 * @desc Start tween sequence
 */
TweenSequence.prototype.start = function () {
	// stop any previously running tween
	if (this._current) {
		this._current.stop();
	}
	// reset sequence list
	this._seq = this._tweens.slice();
	// start sequence
	this._start();
	this.emit('start');
};

/**
 * @desc Reverse tween sequence
 */
TweenSequence.prototype.reverse = function () {
	// stop any previously running tween
	if (this._current) {
		this._current.stop();
	}
	// reset sequence list
	this._seq = this._tweens.slice();
	// start sequence in reverse order
	this._reverse();
	this.emit('reverse');
};

/**
 * @desc Update current state
 */
TweenSequence.prototype.update = function () {
	if (this._current) {
		var updates = this._current.update();
		this.emit('change', updates);
		return updates;
	}
	return null;
};

/**
 * @private
 */
TweenSequence.prototype._setup = function () {
	var that = this;

	// on change callback
	function onChange(values) {
		that.emit('change', values);
	}

	for (var i = 0; i < this._tweenLen; i++) {
		this._tweens[i].on('change', onChange);
	}
};

/**
 * @private
 */
TweenSequence.prototype._start = function () {
	var that = this;
	this._current = this._seq.shift();
	var onFinish = function () {
		if (that._seq.length > 0) {
			// next tween
			that._start();
		} else {
			// end of the last tween in our sequence list
			that._current = null;
			that.emit('finish');
		}
	};
	this._current.once('finish', onFinish);
	this._current.start();
};

/**
 * @private
 */
TweenSequence.prototype._reverse = function () {
	var that = this;
	this._current = this._seq.pop();
	var onFinish = function () {
		if (that._seq.length > 0) {
			// next tween
			that._reverse();
		} else {
			// end of the last tween in our sequence list
			that._current = null;
			that.emit('finish');
		}
	};
	this._current.once('finish', onFinish);
	this._current.reverse();
};