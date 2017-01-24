var utils = require('utils');
var inherit = require('inherit');
var Ent = require('Ent');

//var twTime = 0.15;

/**
 * @class
 * @classDesc Hero
 */
function Hero(parent, x, y, type, data) {
	Ent.call(this, parent, x, y, type, data);

	//var self = this;
	//var ui = parent.parent.parent.ui;
	//var Tiles = window.Tiles;

	// set hero stats
	this.visRadius = 6;
	if (!data.stats) {
		this.stats.damage += 2;
		this.stats.armor += 2;
	}

	// set hero tileset
	if (data && data.tileset) {
		this.tileset = data.tileset;
	} else {
		// this.tileset = utils.getRandomTileset('monsters');
		this.tileset = parent.setTileset('monsters', // 'man'
			['barbarian', 'cyclops', 'demon', 'elf', 'female', 'gargoyle', 'gnome', 'halfling', 'human',
			'imp', 'kobold', 'ninja', 'ogre', 'orc', 'people', 'race', 'skeleton', 'smithy', 'troll',
			'unique', 'vampire'], 'OR');
		this.info = utils.splitCamelCase(this.tileset.id);
		console.log('hero:', this.info);
	}

	// set superclass methods
	/*var superClassMethods = {
		//draw: this.draw,
		examineSurroundings: this.examineSurroundings,
		checkHalfStep: this.checkHalfStep,
		checkStep: this.checkStep,
		checkPathEnd: this.checkPathEnd
	};


	this.examineSurroundings = function (tile) {
		// call superclass method
		superClassMethods.examineSurroundings.call(this, tile);

		// TODO: we should make more obvious to the user that a monster has been detected!

		if (tile.type === Tiles.Monster) {
			// log 'you see the monster'
			ui.console.log('You see a ' + utils.wordifyCamelCase(tile.tileset.id));
			// scroll dungeon to monster tile
			parent.scrollToTile(tile, twTime * 0.75, twTime * 1.5); // tile
		}
	};


	this.checkHalfStep = function (tile) {
		superClassMethods.checkHalfStep.call(this, tile);
		parent.fov.updateFov({ x: tile.gridx, y: tile.gridy }, this.visRadius, true, self.examineSurroundings);
	};


	this.checkStep = function () {
		superClassMethods.checkStep.call(this);

		for (var i  = 0; i < this.visibleMonsters.length; i++) {
			var monster = this.visibleMonsters[i];
			monster.moveToHero(this, i);
		}
	};


	this.checkPathEnd = function () {
		// check for items or encounters at current position
		if (this.path.length === 0) {
			this.checkItemsAtCoord(this.gridx, this.gridy);
		}

		// call superclass method
		superClassMethods.checkPathEnd.call(this);
	};*/

}

inherit(Hero, Ent);
module.exports = Hero;