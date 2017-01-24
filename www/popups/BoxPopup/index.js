var inherit = require('inherit');
var View = require('WuicView');
//var Sprite = require('WuicSprite');
var Tween = require('wuicTween').Tween;
var Button = require('Button');

function BoxPopup() { // params
	View.call(this);
	var self = this;

	// init popup
	this.width = window.canvasWidth - 40;
	this.height = 280;
	this.x = (window.canvasWidth - this.width) / 2;
	this.y = (window.canvasHeight - this.height) / 2;
	this.pivotX = this.width / 2;
	this.pivotY = this.height / 2;
	this.alpha = 0;

	var btn = this.appendChild(new Button(this, 'Close', {}, function () {
		console.log('YAY!');
	}));

	btn.on('tapstart', function () {
		console.log('btn tapstart!');
	});

	btn.on('tapend', function () {
		console.log('btn tapend!');
		//that.close(); 
	});

	this.on('tapstart', function () {
		console.log('view tapstart!');
	});

	this.on('tapend', function () {
		console.log('view tapend!');
		//that.close(); 
	});

	// tween popup
	this.tweens = { alpha: new Tween(Tween.StrongOut, { a: 1 }, { a: 1 }, 0, 0.5) };
	this.tweens.alpha.on('change', function (v) {
		self.alpha = v.a;
		var s = (1 - v.a) * 0.8;
		self.scaleX = 1 + s;
		self.scaleY = 1 - s;
	});

	// render popup
	this.setRenderMethod(function (ctx) {
		this.tweens.alpha.update();

		// clip
		ctx.strokeStyle = '#333';
		ctx.fillStyle = '#eee';
		ctx.roundRect(0, 0, this.width, this.height, 5).fill();
		ctx.roundRect(0, 0, this.width, this.height, 5).stroke();
	});
}

inherit(BoxPopup, View);
module.exports = BoxPopup;


BoxPopup.prototype.open = function (data, options) {
	options = options || {};
	this.data = data || {};
	//this.onFinish = 'opened';
	/*if (!this.originalScale) {
		this.originalScale = this.scaleX;
	}*/
	this.tweens.alpha.reset({ a: 0 }, { a: 1 });
	this.tweens.alpha.start();
};


BoxPopup.prototype.close = function () { // options
	//options = options || {};
	//this.onFinish = 'closed';
	this.tweens.alpha.reset({ a: 1 }, { a: 0 });
	this.tweens.alpha.start();
};