//var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
//var Tween = require('wuicTween').Tween;


// -------------------------------------------------
// Console
// -------------------------------------------------

function Console(parent) {
	Sprite.call(this);
	this.parent = parent;
	//var self = this;

	// set position and dimensions
	this.x = 4;
	this.y = 46;
	this.width = parent.width - this.x;
	this.height = 42;

	this.maxLines = 3;

	
	this.init = function () {
		this.tweens = {};
		this.lines = [];

		this.setRenderMethod(function () { // context
			// update tweens
			for (var i in this.tweens) { this.tweens[i].update(); }
			// draw console box
			//utils.drawBox(context, 0, 0, 172, 38, 'rgba(100, 100, 100, 0.6)', 5);
		});
	};


	this.log = function (caption) {
		this.lines.push(this.createLine(caption));
		if (this.lines.length > this.maxLines) {
			this.lines[0].destroy();
			this.lines.shift();
		}

		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i].y = 9 + i * 12;
		}
	};


	this.clear = function () {
		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i].destroy();
		}
		this.lines = [];
	};


	this.createLine = function (caption) {
		var line = this.appendChild(new Sprite());
		line.x = 3;
		line.y = 9 + this.lines.length * 12;

		line.setRenderMethod(function (context) {
			context.font = 'normal 7pt Verdana';
			context.textAlign = 'left';
			context.fillStyle = '#ddd';
			context.fillText(caption, 0, 0);
		});

		return line;
	};


	/*var tween = item.tweens.move = new Tween(Tween.QuadInOut, { x: this.x, y: this.y }, { x: item.startX, y: item.startY }, 0, time);
	tween.on('change', function (v) {
		self.x = v.x;
		self.y = v.y;
	});
	tween.on('finish', function () {
		item.parent.zIndex = 0;
	});
	tween.start();*/

}

inherit(Console, Sprite);
module.exports = Console;
