var inherit = require('inherit');
var EventEmitter = require('EventEmitter');

/**
 * @class
 * @param {HTMLCanvasElement} canvas
 */
function Canvas(canvas) {

	EventEmitter.call(this);

	this._frameUpdater = null;
	this._minFrameRate = 1;
	this._framePerSecond = 0;
	this._frameRate = 100;
	this._canvas = canvas || document.createElement('canvas');
	this._size = {
		w: 100,
		h: 100
	};

	window.context = this.getContext();
}

inherit(Canvas, EventEmitter);
module.exports = Canvas;

/**
 * @param {Number} framePerSecond
 */
Canvas.prototype.setFrameRate = function (framePerSecond) {
	this._framePerSecond = framePerSecond;
	this._frameRate = Math.max(this._minFrameRate, Math.floor(1000 / framePerSecond));
	if (!this._frameUpdater) {
		var lastUpdate = Date.now();
		var that = this;
		this._frameUpdater = window.setInterval(function () {
			var now = Date.now();
			var updateInterval = now - lastUpdate;
			if (updateInterval >= that._frameRate) {
				var currentFps = Math.floor(1000 / updateInterval);
				lastUpdate = now;
				that.emit('frameUpdate', currentFps);
			}
		}, 0);
	}
	this.emit('setFrameRate', framePerSecond);
};

/**
 * @desc - Pause the display update
 */
Canvas.prototype.pause = function () {
	if (this._frameUpdater) {
		window.clearInterval(this._frameUpdater);
		this._frameUpdater = null;
	}
};

/**
 * @desc - Resume the display update
 */
Canvas.prototype.resume = function () {
	if (!this._frameUpdater) {
		this.setFrameRate(this._framePerSecond);
	}
};

/**
 * @param parentElement
 */
Canvas.prototype.appendTo = function (parentElement) {
	parentElement.appendChild(this._canvas);
};

/**
 * @param {String} eventName
 * @param {String} eventLabel
 */
Canvas.prototype.addEvent = function (eventName, eventLabel) {
	var that = this;
	this._canvas.addEventListener(eventName, function (event) {
		eventName = eventLabel || eventName;
		that.emit(eventName, event);
	}, false);
};

/**
 * @param {Number} w - Width of the canvas
 * @param {Number} h - Height of the canvas
 */
Canvas.prototype.setSize = function (w, h) {
	this._size.w = w;
	this._size.h = h;
	this._canvas.width = w;
	this._canvas.height = h;
	this.emit('resize', this._size);
};

/**
 * @returns {Object} - {width: number, height: number}
 */
Canvas.prototype.getSize = function () {
	return { width: this._size.w, height: this._size.h };
};

/**
 * @param {String} type
 * @returns {CanvasRenderingContext2D}
 */
Canvas.prototype.getContext = function (type) {
	return this._canvas.getContext(type || '2d');
};

/**
 * @private
 */
Canvas.prototype._clear = function () {
	for (var i = 0; i < this._clearContextLength; i++) {
		this._clearContexts[i].clearRect(0, 0, this._size.w, this._size.h);
	}
};
