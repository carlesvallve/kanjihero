//var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var buttonBehavior = require('wuicButtonBehavior');
//var Tween = require('wuicTween').Tween;
//var twTime = 0.2;
//window.zoom = 1;


function Button(parent, caption, params) { // , cb
	Sprite.call(this);
	this.parent = parent;
	//var self = this;

	params = params || {};
	caption = caption || 'OK';
	var width = params.width || 100;
	var height = params.height || 38;
	var pos = params.pos || { x: (parent.width - width) / 2, y: parent.height - 55 };
	var fillColor = params.fillColor || '#ccc';
	var strokeColor = params.strokeColor || '#999';
	var color = params.color || '#333';

	// popup button
	this.width = width;
	this.height = height;
	this.x = pos.x;
	this.y = pos.y;

	buttonBehavior(this, parent);

	this.on('tapstart', function () {
		console.log('tapstart!');
	});

	this.on('tapend', function () {
		console.log('tapend!');
		//that.close(); 
	});

	this.setRenderMethod(function (context) {
		context.save();

		context.shadowColor = 'rgba(0, 0, 0, 0.5)';
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 1;
		context.shadowBlur = 2;

		context.strokeStyle = strokeColor;
		context.fillStyle = fillColor;
		context.roundRect(0, 0, width, height, 5).fill();
		context.roundRect(0, 0, width, height, 5).stroke();

		context.font = 'bold 8pt Verdana';
		context.textAlign = 'center';
		context.fillStyle = color;
		context.fillText(caption, width / 2, height / 1.65);

		context.restore();
	});
}

inherit(Button, Sprite);
module.exports = Button;
