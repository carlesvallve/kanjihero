var utils = require('utils');
var inherit = require('inherit');
var Ent = require('Ent');
//var Tween = require('wuicTween').Tween;
//var twTime = 0.15;


/**
 * @class
 * @classDesc Monster
 */
function Monster(parent, x, y, type, data) {
	Ent.call(this, parent, x, y, type, data);
	//var self = this;

	// choose a random monster from monsters tileset
	if (data && data.tileset) {
		this.tileset = data.tileset;
	} else {
		this.tileset = utils.getRandomTileset('monsters');
		this.info = utils.splitCamelCase(this.tileset.id);
	}

	this.visRadius = 7;


	// set superclass methods
	/*var superClassMethods = {
		checkPathEnd: this.checkPathEnd
	};*/


	/*this.moveToHero = function (hero, num) {

		// attack animation
		this.tweens.wait = new Tween(Tween.QuadOut, { t: 0 }, { t: 100 }, 0,  twTime + num * (twTime));
		
		this.tweens.wait.on('finish', function () {
			self.findPath(hero, 2);
		});

		this.tweens.wait.start();
	};*/


	/*this.checkPathEnd = function () {
		// check for items at current position
		if (this.path.length === 0) {
			this.checkItemsAtCoord(this.gridx, this.gridy);
		}

		// call superclass method
		superClassMethods.checkPathEnd.call(this);
	};*/




}

inherit(Monster, Ent);
module.exports = Monster;