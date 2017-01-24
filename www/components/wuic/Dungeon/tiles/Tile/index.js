var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');

/**
 * @class
 * @classDesc Tile
 */
function Tile(x, y, type, direction, room) {
	Sprite.call(this);

	// set tile dimensions
	var Tiles = window.Tiles;
	var tileSize = window.tileSize;
	var tileW = tileSize * 2;
	var tileH = tileSize * 2;
	//this.width = tileSize;
	//this.height = tileSize;

	// init fov vars
	this.hasBeenSeen = false;
	this.canBeSeen = false;
	this.lightIntensity = 0;
	this.hide();

	// render tile
	this.setRenderMethod(function (context) {
		this.draw(context);
	});


	// -------------------------------------------------
	// Tile Type
	// -------------------------------------------------

	this.setType = function (gridx, gridy, type, direction, room) {
		// set tile props
		this.gridx = gridx;
		this.gridy = gridy;
		
		var p = utils.coordsToIso(gridx, gridy);
		this.x = p.x;
		this.y = p.y;

		this.zIndex = this.y;

		this.type = type;
		this.direction = direction || null;
		this.room = room || null;

		// set tile props by type
		switch (type) {
			case Tiles.Blank:
			case Tiles.Floor:
				this.layer = 'floors';
				this.stained = null;
				this.zIndex -= tileSize;
				break;
			case Tiles.Door:
				this.layer = 'items';
				this.state = utils.randomArr(['open', 'closed']);
				this.zIndex -= tileSize / 8;
				break;
			case Tiles.DoorOver:
				this.layer = 'overlay';
				this.state = 'open';
				this.zIndex += tileSize / 4;
				break;
			case Tiles.StairsUp:
			case Tiles.StairsDown:
				this.layer = 'items';
				this.zIndex -= tileSize / 4;
				break;
			case Tiles.Wall:
				this.layer = 'walls';
				break;
			case Tiles.Selector:
				this.layer = 'floors';
				this.zIndex -= tileSize / 2;
				break;
		}
	};

	// initialize tile props
	this.setType(x, y, type, direction, room);
	

	// -------------------------------------------------
	// Tile Draw 
	// -------------------------------------------------

	this.isInsideScreen = function () {
		// get global vars
		var zoom = window.zoom;
		var dungeon = window.dungeon;

		// get extra margin
		var d = (tileSize / 1 * zoom);

		// get screen dimensions
		var w = (window.canvasWidth / zoom); //+ (tileSize * zoom) * 1;
		var h = (window.canvasHeight / zoom); //+ (tileSize * zoom) * 1;

		// get point in visor
		var visorX = Math.floor(-dungeon.x - dungeon.parent.x);
		var visorY = Math.floor(-dungeon.y - dungeon.parent.y);

		// get tile pos
		var tileX = this.x + (tileSize * zoom);
		var tileY = this.y + (tileSize * zoom);

		// calculate if tile is inside bounds
		if (tileX >= visorX - d && tileY >= visorY - d && tileX <= visorX + w + d && tileY <= visorY + h + d) {
			return true;
		}
		return false;
	};


	this.draw = function (context) {
		// escape if tile is outside canvas bounds
		if (!this.isInsideScreen()) { return; }

		// update tweens
		for (var i in this.tweens) {
			this.tweens[i].update();
		}

		context.save();

		// draw tile by type
		switch (this.type) {
			case Tiles.Blank:
				console.log('draw blank tile');
				this.drawIsoBlank(context);
				return;
			case Tiles.Floor:
				this.drawIsoFloor(context);
				break;
			case Tiles.Wall:
				this.drawIsoWall(context);
				break;
			case Tiles.Door:
				this.drawIsoDoor(context);
				break;
			case Tiles.DoorOver:
				this.drawIsoDoorOver(context);
				break;
			case Tiles.StairsDown:
			case Tiles.StairsUp:
				this.drawIsoStairs(context);
				break;
			case Tiles.Selector:
				this.drawSelector(context);
				break;
		}

		context.restore();

		// draw tile decoration if it has one
		if (this.deco) { this.drawDeco(context); }
	};


	// -------------------------------------------------
	// Draw Iso Tiles
	// -------------------------------------------------

	this.drawSelector = function (context) {
		context.globalAlpha = 0.4;
		context.fillStyle = '#000';
		context.roundRect(tileW / 2.75, tileH / 1.5, tileW / 3.5, tileH / 6, 20).fill();
	};


	this.drawIsoBlank = function (context) {
		// get tileset
		this.tileset = utils.getTilesetById('floor', 'floor-grass-1');
		if (!this.tileset) { return this.tilesetNotFound(); }
		
		// draw floor
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			0, 0, this.tileset.rect.w + 0, this.tileset.rect.h + 0); // + 1
	};


	this.drawIsoFloor = function (context) {
		// get tileset
		this.tileset = utils.getTilesetById('floor', this.imgType);
		if (!this.tileset) { return this.tilesetNotFound(); }
		
		// draw floor
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			0, 0, this.tileset.rect.w + 0, this.tileset.rect.h + 0); // + 1

		// draw blood stain
		if (this.stained !== null) {
			context.save();
			var p = { x: this.stained * 20, y: 5 * 20 };
			context.transform(1, 0.5, -1, 0.5, tileW / 2, tileH / 2);
			context.drawImage(window.assets.objects1, p.x, p.y, 20, 20, 5, 5, 20, 20);
			context.restore();
		}

		// debug purpose only!
		/*if (!window.dungeon.getTile(this.gridx, this.gridy, 'walls')) {
			utils.drawText(context, this.gridx + ',' + this.gridy, x + 16, y + 32, 'white', 'center', 7, 'normal', false);
		}*/
		
		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 0, y: 0, w: this.tileset.rect.w, h: this.tileset.rect.h });
	};


	this.drawIsoDoor = function (context) {
		var id = this.imgType;
		
		// get door final id by door direction
		if (this.direction === 'vertical') {
			id += this.state === 'open' ? '-open-NS' : '-closed-NS';
		} else {
			id += this.state === 'open' ? '-open-EW' : '-closed-EW';
		}

		// get tileset
		this.tileset = utils.getTilesetById('door', id);
		if (!this.tileset) { return this.tilesetNotFound(); }

		// draw door
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			0, 0, this.tileset.rect.w, this.tileset.rect.h);
		
		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 0, y: 0, w: this.tileset.rect.w, h: this.tileset.rect.h });
	};


	this.drawIsoDoorOver = function (context) {
		var id = this.imgType;
		var r;

		if (this.direction === 'vertical') {
			// get vertical final id
			id += this.state === 'open' ? '-open-NS' : '-closed-NS';
			// get tileset
			this.tileset = utils.getTilesetById('door', id);
			if (!this.tileset) { return this.tilesetNotFound(); }
			// draw vertical door over
			context.drawImage(this.tileset.img,
			this.tileset.rect.x + this.tileset.rect.w / 2, this.tileset.rect.y, this.tileset.rect.w / 2, this.tileset.rect.h,
			this.tileset.rect.w / 2, 0, this.tileset.rect.w / 2, this.tileset.rect.h);
			// draw light
			r = this.tileset.rect;
			this.drawLight(context, this.tileset, { x: r.x + r.w / 2, y: r.y, w: r.w / 2, h: r.h }, { x: r.w / 2, y: 0, w: r.w / 2, h: r.h });

		} else {
			// get horizontal final id
			id += this.state === 'open' ? '-open-EW' : '-closed-EW';
			// get tileset
			this.tileset = utils.getTilesetById('door', id);
			if (!this.tileset) { return this.tilesetNotFound(); }
			// draw horizontal door over
			context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w / 2, this.tileset.rect.h,
			0, 0, this.tileset.rect.w / 2, this.tileset.rect.h);
			// draw light
			r = this.tileset.rect;
			this.drawLight(context, this.tileset, { x: r.x, y: r.y, w: r.w / 2, h: r.h }, { x: 0, y: 0, w: r.w / 2, h: r.h });
		}
	};


	this.drawIsoStairs = function (context) {
		// get stairs final id by stairs type (up or down)
		var id  = this.type === Tiles.StairsDown ? 'stairs-ladder-down' : 'stairs-ladder-up';

		// get tileset
		this.tileset = utils.getTilesetById('furniture', id);
		if (!this.tileset) { return this.tilesetNotFound(); }
		
		// draw stairs
		
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			0, 0, this.tileset.rect.w, this.tileset.rect.h);
		
		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 0, y: 0, w: this.tileset.rect.w, h: this.tileset.rect.h });
	};



	this.drawIsoWall = function (context) {

		// get tileset id adding wall direction to wall image type
		var id = this.imgType + this.direction;

		// if wall doesnt have a direction, render ruins instead
		if (!this.direction || this.direction === 'column' || this.direction === 'wall-darkstone-destroyed') {
			this.direction = 'wall-darkstone-destroyed';
			id = this.direction;
		}

		// get tileset
		this.tileset = utils.getTilesetById('wall', id);
		if (!this.tileset) { return this.tilesetNotFound(); }

		// draw wall
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			0, 0, this.tileset.rect.w, this.tileset.rect.h);

		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 0, y: 0, w: this.tileset.rect.w, h: this.tileset.rect.h });
		
	};


	this.drawDeco = function (context) {
		if (!this.deco || !this.deco.img) {
			console.log(this.deco);
			return;
		}

		// make sure that floor tile on deco bottom side has been discovered
		var floorEW = window.dungeon.getTile(x + 1, y);
		if (this.direction === 'EW' && !floorEW.hasBeenSeen) { return; }

		var floorNS = window.dungeon.getTile(x, y + 1);
		if (this.direction === 'NS' && !floorNS.hasBeenSeen) { return; }
		
		// draw decoration
		context.drawImage(this.deco.img,
			this.deco.rect.x, this.deco.rect.y, this.deco.rect.w, this.deco.rect.h,
			0, 0, this.deco.rect.w, this.deco.rect.h);

		// draw light
		// TODO: wall deco should get his light from floorEW or floorNS instead!
		this.drawLight(context, this.deco, this.deco.rect, { x: 0, y: 0, w: this.deco.rect.w, h: this.deco.rect.h }, false);
	};


	this.drawLight = function (context, tileset, sourceRect, rect, turnsInvisible) {
		// set alpha of shadow layer depending on light intensity
		context.globalAlpha = Math.max(1 - this.lightIntensity, 0);

		// set shadow outline width
		var d = 0;

		// draw shadow layer
		context.drawImage(tileset.black,
			sourceRect.x, sourceRect.y, sourceRect.w, sourceRect.h,
			rect.x - d, rect.y - d, rect.w + d * 2, rect.h + d * 2);

		// hide interactive elements (items, hero, monsters)
		// show happens in renderFov
		if (turnsInvisible && this._visible) {
			if (!this.canBeSeen) {
				this.hide();
			}
		}
	};


	this.tilesetNotFound = function () {
		// display error message
		console.log('sorry, tileset not found at', this.gridx + ',' + this.gridy, this);

		// destroy the tile so doesnt emit errors every frame
		this.destroy();
	};
}

inherit(Tile, Sprite);
module.exports = Tile;