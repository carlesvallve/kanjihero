var inherit = require('inherit');
var Sprite = require('WuicSprite');
var sliderBehavior = require('wuicSliderBehavior');

/**
 * @class
 * @alias WuicSliderGauge
 * @classDesc Slider with a gauge
 *
 * @augments WuicSprite
 *
 * @author Brice Chevalier <bchevalier@wizcorp.jp>
 *
 * @param {WuicSprite} registerTo - Object from which slider get the touch events
 * @param {Number} min - Minimum value of the slider
 * @param {Number} max - Maximum value of the slider
 * @param {Number} step - Minimum space between two possible values (if step === 0 then the slider can take any value within [min, max])
 *
 * @param {Object} barParams - Parameters of the bar of the slider
 * @param {String} barParams.asset - Name of the var asset
 * @param {Number} barParams.width - Rendered width of the bar
 * @param {Number} barParams.height - Rendered height of the bar
 *
 * @param {Object} gaugeParams - Parameters of the gauge of the slider
 * @param {String} gaugeParams.asset - Name of the gauge asset
 * @param {Number} gaugeParams.width - Rendered width of the gauge
 * @param {Number} gaugeParams.height - Rendered height of the gauge
 */

function SliderGauge(registerTo, min, max, step, barParams, gaugeParams) {

	Sprite.call(this);

	this.height = Math.max(gaugeParams.height, barParams.height);
	this.width = Math.max(gaugeParams.width, barParams.width);

	var barAsset = barParams.asset;
	var gaugeAsset = gaugeParams.asset;

	var fillRatio = 0;

	var margin = (this.width - Math.min(gaugeParams.width, barParams.width)) / 2;

	this.gauge = new Sprite();
	this.gauge.width = gaugeParams.width;
	this.gauge.height = gaugeParams.height;
	this.gauge.x = 0;
	this.gauge.y = Math.max(0, (barParams.height - gaugeParams.height) / 2);
	this.gauge.pivotX = this.gauge.width / 2;
	this.gauge.pivotY = this.gauge.height / 2;
	this.gauge.setRenderMethod(function (ctx) {
		ctx.drawImage(gaugeAsset, 0, 0, 1 + fillRatio * (gaugeAsset.width - 1), gaugeAsset.height, margin, 0, 1 + fillRatio * (this.width - 1), this.height);
	});

	this.bar = new Sprite();
	this.bar.width = barParams.width;
	this.bar.height = barParams.height;
	this.bar.x = 0;
	this.bar.y = Math.max(0, (gaugeParams.height - barParams.height) / 2);
	this.bar.pivotX = this.bar.width / 2;
	this.bar.pivotY = this.bar.height / 2;
	this.bar.setRenderMethod(function (ctx) {
		ctx.drawImage(barAsset, 0, 0, this.width, this.height);
	});

	this.appendChild(this.bar);
	this.appendChild(this.gauge);

	sliderBehavior(this, registerTo, min, max, margin, step);

	this.on('update', function (value, min, max) {
		// Computing the fill ratio of the gauge
		fillRatio = (value - min) / (max - min);
	});
}

inherit(SliderGauge, Sprite);
module.exports = SliderGauge;