var inherit = require('inherit');
var Sprite = require('WuicSprite');
var sliderBehavior = require('wuicSliderBehavior');

/**
 * @class
 * @classDesc Slider with a button
 * @alias WuicSlider
 *
 * @augments WuicSprite
 *
 * @author Brice Chevalier <bchevalier@wizcorp.jp>
 *
 * @param {WuicSprite} registerTo       - Object from which slider get the touch events
 * @param {Number} min              - Minimum value of the slider
 * @param {Number} max              - Maximum value of the slider
 * @param {Number} step             - Minimum space between two possible values (if step === 0 then the slider can take any value within [min, max])
 *
 * @param {Object} barParams        - Parameters of the bar of the slider
 * @param {String} barParams.asset  - Name of the var asset
 * @param {Number} barParams.width  - Rendered width of the bar
 * @param {Number} barParams.height - Rendered height of the bar
 *
 * @param {Object} btnParams        - Parameters of the button of the slider
 * @param {String} btnParams.asset  - Name of the button asset
 * @param {Number} btnParams.width  - Rendered width of the button
 * @param {Number} btnParams.height - Rendered height of the button
 */

function SliderWithBtn(registerTo, min, max, step, barParams, btnParams) {

	Sprite.call(this);

	this.height = Math.max(btnParams.height, barParams.height);
	this.width = Math.max(btnParams.width, barParams.width);

	var barAsset = barParams.asset;
	var btnAsset = btnParams.asset;

	this.btn = new Sprite();
	this.btn.width = btnParams.width;
	this.btn.height = btnParams.height;
	this.btn.x = 0;
	this.btn.y = Math.max(0, (barParams.height - btnParams.height) / 2);
	this.btn.pivotX = this.btn.width / 2;
	this.btn.pivotY = this.btn.height / 2;
	this.btn.setRenderMethod(function (ctx) {
		ctx.drawImage(btnAsset, 0, 0, this.width, this.height);
	});

	this.bar = new Sprite();
	this.bar.width = barParams.width;
	this.bar.height = barParams.height;
	this.bar.x = 0;
	this.bar.y = Math.max(0, (btnParams.height - barParams.height) / 2);
	this.bar.pivotX = this.bar.width / 2;
	this.bar.pivotY = this.bar.height / 2;
	this.bar.setRenderMethod(function (ctx) {
		ctx.drawImage(barAsset, 0, 0, this.width, this.height);
	});

	this.appendChild(this.bar);
	this.appendChild(this.btn);

	var margin = btnParams.width / 2;

	sliderBehavior(this, registerTo, min, max, margin, step);

	this.on('update', function (value, min, max) {
		// Repositioning the button of the slider
		this.btn.x = (this.width - this.btn.width) * (value - min) / (max - min);
	});
}

inherit(SliderWithBtn, Sprite);
module.exports = SliderWithBtn;
