var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');


// -------------------------------------------------
// Item
// -------------------------------------------------

function SlotItem(parent, id) {
	Sprite.call(this);
	this.parent = parent;
	//var self = this;

	// create item
	this.tileset = (id !== 'none') ? utils.getTilesetById('ui', id) : null;
	this.units = 0;
	this.x = this.startX = 0;
	this.y = this.startY = 0;
	this.width = 30;
	this.height = 30;

	this.tweens = {};

	// render item
	this.setRenderMethod(function (context) {
		// update tweens
		for (var i in this.tweens) {
			this.tweens[i].update();
		}

		// draw item
		if (this.tileset) {
			context.drawImage(this.tileset.img,
				this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
				5, 4, this.width, this.height);
		}

		// draw units
		if (this.units > 1) {
			utils.drawText(context, this.units, 30, 30, 'white', 'right', 6);
		}
	});


	/*this.moveToDestination = function (item, time) {
		time = time || 0;

		// if 0 time, just locate the item
		if (time === 0) {
			item.x = item.startX;
			item.y = item.startY;
			item.parent.zIndex = 0;
			return;
		}

		// otherwise, tween the item back to start pos
		var tween = item.tweens.move = new Tween(Tween.QuadInOut, { x: this.x, y: this.y }, { x: item.startX, y: item.startY }, 0, time);
		tween.on('change', function (v) {
			self.x = v.x;
			self.y = v.y;
		});
		tween.on('finish', function () {
			item.parent.zIndex = 0;
		});
		tween.start();
	};*/



}

inherit(SlotItem, Sprite);
module.exports = SlotItem;
