var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var Tween = require('wuicTween').Tween;
var twTime = 0.15;

/**
 * @class
 * @classDesc Projectile
 */
function Projectile(parent, id, shooter, target, cb) {
	Sprite.call(this);
	var self = this;

	// TODO: use diferent images for diferent kind of projectiles,
	// TODO: rotated and transformed propperly depending on progectile direction

	// set vars
	this.tweens = {};
	this.x = shooter.x;
	this.y = shooter.y;
	this.id = id || 'AmmoIronShot';
	this.tileset = utils.getTilesetById('weapons', this.id);
	this.done = false;

	// --------------------------------------
	// init projectile
	var time = twTime;
	var p;

	// throw ranged attack dice
	var targetWasHit = false;
	var hitPercentage = 50;
	var dice = utils.randomInt(1, 100);

	// set projectile destination point 
	if (dice <= hitPercentage) {
		// hit
		targetWasHit = true;
		p =  { x: target.x, y: target.y };
	} else {
		// miss
		targetWasHit = false;
		p =  {
			x: target.x - 54 + utils.randomInt(0, 54 * 2),
			y: target.y - 27 + utils.randomInt(0, 27 * 2),
		};
	}


	// --------------------------------------
	// tween projectile

	// tween projectile to destination point
	this.tweens.move = new Tween(Tween.Linear, { x: this.x, y: this.y }, { x: p.x, y: p.y }, 0, time);
	this.tweens.move.on('change', function (v) {
		self.x = v.x;
		self.y = v.y;
	});
	this.tweens.move.on('finish', function () {
		self.done = true;
		if (cb) { cb(targetWasHit); }
	});
	this.tweens.move.start();


	// wait until shooter is ready to shoot again
	shooter.fighting = true;
	this.tweens.wait = new Tween(Tween.Linear, { t: 0 }, { t: 100 }, 0, 0.5);
	this.tweens.wait.on('finish', function () {
		shooter.fighting = false;
		// destroy the projectile
		self.destroy();
	});
	this.tweens.wait.start();

	// --------------------------------------
	// render projectile

	this.setRenderMethod(function (context) {
		// update tweens
		for (var i in this.tweens) {
			this.tweens[i].update();
		}

		if (this.done) { return; }

		// update zIndex
		this.zIndex = 9999;//this.y + 1;

		// draw projectile
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			-3 + this.tileset.rect.w / 2, -1 + this.tileset.rect.h / 2, this.tileset.rect.w - 6, this.tileset.rect.h - 6);
	});
}

inherit(Projectile, Sprite);
module.exports = Projectile;