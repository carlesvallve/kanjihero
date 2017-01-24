//var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var Tween = require('wuicTween').Tween;


var twTime = 0.2;
window.zoom = 1;


function Visor(parent) {
	Sprite.call(this);
	this.parent = parent;
	var self = this;

	// init sprite
	var canvasWidth = window.canvasWidth;
	var canvasHeight = window.canvasHeight;
	this.width = canvasWidth;
	this.height = canvasHeight;
	this.zIndex = 1;

	this.init = function (zoom) {
		// init vars
		this.tweens = {};

		this.scaleX = 0.5;
		this.scaleY = 0.5;
		this.setZoom(zoom);

		// render view
		this.setRenderMethod(function () {
			// update tweens
			for (var i in this.tweens) {
				this.tweens[i].update();
			}

			// draw visor outline
			//context.strokeStyle = '#f00';
			//context.lineWidth = 1;
			//context.strokeRect(0, 0, this.width, this.height);
		});
	};

	


	// -------------------------------------------------
	// Zoom
	// -------------------------------------------------

	this.setZoom = function (zoom) {
		// record zoom
		if (!zoom) { zoom = this.scaleX === 1 ? 0.5: 1; }
		window.zoom = zoom;

		// tween dungeon scale and position to zoom factor
		this.tweens.zoom = new Tween(Tween.QuadInOut, { zoom: this.scaleX }, { zoom: zoom }, 0, twTime);

		this.tweens.zoom.on('change', function (v) {
			self.scaleX = v.zoom;
			self.scaleY = v.zoom;
			self.x = (canvasWidth - self.width * v.zoom) / 2;
			self.y = (canvasHeight - self.height * v.zoom) / 2;
		});

		this.tweens.zoom.start();
	};

}

inherit(Visor, Sprite);
module.exports = Visor;
