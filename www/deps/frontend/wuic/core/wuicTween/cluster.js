var inherit = require('inherit');
var EventEmitter = require('EventEmitter');

/**
 * @alias WuicTweenCluster
 * @class
 * @param {Object} config
 *
 */
function TweenCluster(config) {
	EventEmitter.call(this);
	this._finished = true;
	this._tweens = [];
	this._tweenNames = [];
	this._tweenLen = 0;
	this._isPlaying = false;
	this._config = config;
}

inherit(TweenCluster, EventEmitter);
module.exports = TweenCluster;

/**
 * @param {String} name
 * @param {WuicTween} tween
 */
TweenCluster.prototype.addTween = function (name, tween) {
	this._tweens.push(tween);
	this._tweenNames.push(name);
	this._tweenLen += 1;
};

/**
 * @param {WuicTween} tween
 */
TweenCluster.prototype.removeTween = function (tween) {
	var index = this._tweens.indexOf(tween);
	this._removeTweenByIndex(index);
};

/**
 * @param {String} name
 */
TweenCluster.prototype.removeTweenByName = function (name) {
	var index = this._tweenNames.indexOf(name);
	this._removeTweenByIndex(index);
};

/**
 * @desc Update all tweens
 */
TweenCluster.prototype.update = function () {
	if (this._finished || !this._isPlaying) {
		return;
	}

	var tweens = this._tweens.concat();
	var tweenLen = this._tweenLen;
	// calculate updates
	var updates = {};
	for (var i = 0; i < tweenLen; i++) {
		var tween = tweens[i];
		var values = tween.update();
		for (var key in values) {
			if (!updates[key]) {
				updates[key] = this._config[key] || 0;
			}
			updates[key] += values[key];
		}
	}


	// emit
	this.emit('change', updates);
};

/**
 * @desc Start all tweens
 */
TweenCluster.prototype.start = function () {


	this._isPlaying = true;
	var finished = 0;
	var that = this;
	this._finished = false;

	function handleTweenFinish() {
		finished += 1;
		if (finished === that._tweenLen) {
			// all tween finished
			that.emit('finish');
		}
	}

	// setup listeners
	this.once('finish', function () {
		that._finished = true;
		that._isPlaying = false;
	});
	// start all tweens
	var tweens = this._tweens.concat();
	for (var i = 0, len = this._tweenLen; i < len; i += 1) {
		var tween = tweens[i];
		// set up event listener
		tween.once('finish', handleTweenFinish);
		// start tween
		tween.start();
	}


	this.emit('start');
};

/**
 * @desc Reverse all tweens
 */
TweenCluster.prototype.reverse = function () {

	this._isPlaying = true;
	var finished = 0;
	var that = this;
	this._finished = false;

	function handleTweenFinish() {
		finished += 1;
		if (finished === that._tweenLen) {
			// all tween finished
			that.emit('finish');
		}
	}

	// setup listeners
	this.once('finish', function () {
		that._finished = true;
		that._isPlaying = false;
	});

	// start all tweens
	var tweens = this._tweens.concat();
	for (var i = 0, len = this._tweenLen; i < len; i += 1) {
		var tween = tweens[i];
		// set up event listener
		tween.once('finish', handleTweenFinish);
		// start tween in reverse order
		tween.reverse();
	}


	this.emit('reverse');
};

/**
 * @param {Number} index
 * @private
 */
TweenCluster.prototype._removeTweenByIndex = function (index) {
	if (index !== -1) {
		this._tweens.splice(index, 1);
		this._tweenNames.splice(index, 1);
		this._tweenLen -= 1;
	} else {
		console.warn('TweenCluster._removeTweenByIndex: failed to remove tween > ' + index);
	}
};
