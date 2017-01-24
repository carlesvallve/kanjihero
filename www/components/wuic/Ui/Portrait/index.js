var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');


// -------------------------------------------------
// Portrait
// -------------------------------------------------

function Portrait(parent) {
	Sprite.call(this);
	this.parent = parent;

	// init vars
	this.tweens = {};
	this.width = window.canvasWidth;
	this.height = 42; //window.canvasHeight;
	this.x = 4;
	this.y = 4;

	this.init = function (hero) {

		this.setRenderMethod(function (context) {
			// update tweens
			for (var i in this.tweens) {
				this.tweens[i].update();
			}

			// draw portrait box
			context.save();
			//this.globalAlpha = 0.8;
			utils.drawBox(context, 0, 0, 172, 38, 'rgba(100, 100, 100, 0.6)', 5);
			context.restore();

			// draw hero portrait
			context.drawImage(hero.tileset.img,
			hero.tileset.rect.x, hero.tileset.rect.y, hero.tileset.rect.w, hero.tileset.rect.h,
			-6, -5, hero.tileset.rect.w - 6, hero.tileset.rect.h - 6);

			var x = 38;
			// draw hero name
			var nameWidth = 0;
			nameWidth += utils.drawText(context, hero.info[0], x, 14, 'white', 'left', 7, 'bold', true);
			nameWidth += utils.drawText(context, hero.info[1], x + nameWidth + 2, 14, 'white', 'left', 9, 'bold', true);
			// draw hero level
			var level = hero.stats.level >= 10 ? hero.stats.level : '0' + hero.stats.level;
			utils.drawText(context, 'Lv.', x + nameWidth + 8, 14, 'white', 'left', 5, 'bold', true);
			utils.drawText(context, level, x + nameWidth + 20, 14, 'white', 'left', 7, 'bold', true);

			// draw hero stat bars
			utils.drawBar(context, hero.stats.xp, hero.stats.xpMax, '#e42cee', x + 10, 22, 30, 10);
			utils.drawText(context, 'XP', x, 22 + 9, '#e42cee', 'left', 8, 'bold', true);
			utils.drawBar(context, hero.stats.hp, hero.stats.hpMax, '#fe0000', 90, 22, 30, 10);
			utils.drawText(context, 'HP', 90 - 8, 22 + 9, '#fe0000', 'left', 8, 'bold', true);
			utils.drawBar(context, hero.stats.mp, hero.stats.mpMax, '#fa9b01', 134, 22, 30, 10);
			utils.drawText(context, 'MP', 134 - 8, 22 + 9, '#fa9b01', 'left', 8, 'bold', true);

			// draw dungeon level and current turn number
			var dungeon = this.parent.parent.dungeon;
			utils.drawText(context,
				'Dungeon ' + (dungeon.dungeonLevel + 1) + ' / ' +
				'Turn ' + dungeon.hero.turns, window.canvasWidth - 12, 12, '#ddd', 'right', 7
			);

			// draw fps meter
			utils.drawFPS(context);
		});
	};
}

inherit(Portrait, Sprite);
module.exports = Portrait;

