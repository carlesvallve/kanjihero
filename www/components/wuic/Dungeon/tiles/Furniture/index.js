//var utils = require('utils');
var inherit = require('inherit');
var Tile = require('Tile');


/**
 * @class
 * @classDesc Item
 */
function Furniture(parent, x, y, type) {
	Tile.call(this, x, y, type);

	this.layer = 'items';
	this.zIndex -= window.tileSize / 4;

	// get random tileset
	var arr = ['column', 'crate', 'altar', 'anvil', 'bullseye', 'coffin', 'lab', 'tombstone', 'well'];
	this.tileset = parent.setTileset('furniture', arr, 'OR');

	// render furniture
	this.setRenderMethod(function (context) {
		this.draw(context);
	});
	

	this.draw = function (context) {
		// call superclass method
		//superClassMethods.draw.call(this, context);

		// check tileset
		if (!this.tileset) { return this.tilesetNotFound(); }

		// draw furniture
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			0, 0, this.tileset.rect.w - 0, this.tileset.rect.h - 0);

		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 0, y: 0, w: this.tileset.rect.w - 0, h: this.tileset.rect.h - 0 }, false);
	};
}

inherit(Furniture, Tile);
module.exports = Furniture;