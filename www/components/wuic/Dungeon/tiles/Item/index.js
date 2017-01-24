var utils = require('utils');
var inherit = require('inherit');
var Tile = require('Tile');


/**
 * @class
 * @classDesc Item
 */
function Item(parent, x, y, type, subtype) {
	Tile.call(this, x, y, type);

	this.layer = 'items';
	this.zIndex -= window.tileSize / 4;

	// get tileset type 
	this.tilesetType = utils.randomArr(['weapons', 'weapons', 'weapons', 'weapons', 'equipment', 'equipment', 'items', 'items', 'items']);

	// get item subtype
	var subtypes;
	switch (this.tilesetType) {
		case 'equipment':
			subtypes = ['armor', 'belt', 'boots', 'cap', 'crown', 'cloak', 'gloves', 'gloves', 'gloves', 'necklace', 'ring', 'robe', 'shield'];
			break;
		case 'weapons':
			subtypes = ['ammo', 'axe', 'bow', 'broken', 'club', 'crossbow', 'dagger', 'flail', 'hammer', 'lance', 'mace',
			'nunchaku', 'pike', 'quarterstaff', 'saber', 'scythe', 'sling', 'spear', 'staff', '', 'sword', 'sword', 'throwing',
			'trident', 'whip', 'xbow', 'bow', 'bow', 'bow', 'bow', 'bow', 'bow', 'bow', 'bow'];
			break;
		case 'items':
			subtypes = ['coins', 'crystals', 'jewels', 'skeleton', 'food', 'food', 'food', 'food', 'key', 'potion', 'potion'];
			break;
	}
	this.subtype = subtype ? subtype : utils.randomArr(subtypes);

	// get tileset
	this.tileset = parent.setTileset(this.tilesetType, [this.subtype], 'OR');
	if (!this.tileset) {
		this.tileset = utils.getRandomTileset(this.tilesetType);
		console.log('Item subtype', this.subtype, 'does not exist! Generating random item...');
	}

	//console.log('item:', tilesetType, this.subtype);

	// define item stats
	this.stats = {};

	// render item
	this.setRenderMethod(function (context) {
		this.draw(context);
	});
	

	this.draw = function (context) {
		// call superclass method
		//superClassMethods.draw.call(this, context);

		// check tileset
		if (!this.tileset) { return this.tilesetNotFound(); }

		// draw item
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			16, 24, this.tileset.rect.w - 8, this.tileset.rect.h - 8);

		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 16, y: 24, w: this.tileset.rect.w - 8, h: this.tileset.rect.h - 8 }, false);
	};
}

inherit(Item, Tile);
module.exports = Item;