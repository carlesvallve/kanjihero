var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var Tween = require('wuicTween').Tween;

var Fov = require('Fov');
var Tile = require('Tile');
var Furniture = require('Furniture');
var Item = require('Item');
var Hero = require('Hero');
var Monster = require('Monster');


// global vars
window.tileSize = 54 / 2;

window.Tiles = {
	Blank:		'Blank',
	Floor:		'Floor',
	Wall:		'Wall',
	Corridor:	'Corridor',
	Door:		'Door',
	DoorOver:	'DoorOver',
	StairsUp:	'StairsUp',
	StairsDown:	'StairsDown',
	Item:		'Item',
	Furniture:	'Furniture',
	Monster:	'Monster',
	Hero:		'Hero',
	Selector:	'Selector'
};


/**
 * @class
 * @classDesc Dungeon class that manages all kind of stuff that happens inside a dungeon level
 * Dungeon generators inherit from this class
 */
function Dungeon(parent, width, height) {
	Sprite.call(this);
	this.parent = parent;
	var self = this;

	// get global vars
	var Tiles = window.Tiles;
	var tileSize = this.tileSize = window.tileSize;
	
	// init vars
    this.tiles = { floors: [], items: [], walls: [], overlay: [] };

	// set dimensions
	this.mapW = width;
	this.mapH = height;
    this.width = width * tileSize;
	this.height = height * tileSize;


    //----------------------------------
	// Init Level
	//----------------------------------

	this.init = function (dungeonLevel) {
		// init vars
		this.tweens = {};
		this.dungeonLevel = dungeonLevel;

		// initialize fov
		this.fov = new Fov(this);
		
		// create selector
		this.createSelector();

		// create dungeon tiles
		this.createTiles();

		// initialize camera on hero
		this.scrollToTile(this.hero, 0, 0);
		
		// init monsters
		this.initMonsters();

		// init hero
		this.initHero();

		// render dungeon level
		this.setRenderMethod(function () {
			// update tweens
			for (var i in this.tweens) {
				this.tweens[i].update();
			}

			// sort children
			this.sortChilden(function (a, b) {
				return a.zIndex - b.zIndex;
			});
		});
	};


	//----------------------------------
	// Create dungeon tiles as sprites
	//----------------------------------

	this.setTileset = function (tilesetName, arr, mode) {
		//console.log('setTileset:', tilesetName, arr, mode);
		var tilesetData = window.tilesets[tilesetName];
		var result = utils.searchInTileset(tilesetData.data.frames, arr, mode);
		return utils.getTileset(tilesetData, utils.randomArr(result));
	};


	this.setImgTypes = function () {
		var layerImgTypes = {};

		layerImgTypes.floor = utils.randomArr(
			utils.searchInTileset(window.tilesets.floor.data.frames, ['mud', 'stone'], 'OR') // ,'grass', 'swamp', 'lava', 'ice', 'rune'
		).id;

		var imgId = utils.randomArr(
			utils.searchInTileset(window.tilesets.wall.data.frames, ['adobe', 'bone', 'brick', 'cave', 'fort', 'hut', 'ice', 'iron', 'log', 'mine', 'pillar', 'stone', 'wood'], 'OR')
		).id;
		imgId = utils.splitCamelCase(imgId);
		imgId.pop();
		layerImgTypes.wall = imgId.join('');

		layerImgTypes.door = utils.randomArr(['door-hut', 'door-iron', 'door-sand', 'door-stone', 'door-stonedark', 'door-wood']);

		return layerImgTypes;
	};


	this.createTiles = function () {
		var layerImgTypes = this.setImgTypes();

		// iterate through all tile objects and append them as sprites
		for (var layer in this.tiles) {
			for (var y = 0; y < this.mapH; y++) {
				for (var x = 0; x < this.mapW; x++) {
					var tile = this.getTile(x, y, layer);
					if (tile) { //  && tile.type
						// append tile as sprite
						tile = this.appendChild(tile);
						this.tiles[layer][y][x] = tile;
						if (!tile.imgType) {
							if (tile.type === Tiles.Floor) { tile.imgType = layerImgTypes.floor; }
							if (tile.type === Tiles.Wall) { tile.imgType = layerImgTypes.wall; }
							if (tile.type === Tiles.Door) {
								tile.imgType = utils.randomArr(['door-hut', 'door-iron', 'door-sand', 'door-stone', 'door-stonedark', 'door-wood']);
							}
							if (tile.type === Tiles.DoorOver) { tile.imgType = this.tiles.items[y][x].imgType; }
						}
					}
				}
			}
		}
	};


	this.defineRooms = function () {
		this.rooms = [];
		if (!this.bspRooms) { return; }

		for (var i = 0; i < this.bspRooms.length; i++) {
			var bspRoom = this.bspRooms[i];
			var room = { num: bspRoom.num, rect: bspRoom.rect, tiles: [] };
			this.rooms.push(room);

			for (var layer in this.tiles) {
				for (var x = room.rect.x; x < room.rect.x + room.rect.width; x++) {
					for (var y = room.rect.y; y < room.rect.y + room.rect.height; y++) {
						var tile = this.getTile(x, y, layer);
						if (tile) {
							tile.room = room;
							room.tiles.push(tile);
						}
					}
				}
			}
		}
	};


	this.createSelector = function () {
		this.selector = this.appendChild(new Tile(0, 0, Tiles.Selector));
		this.selector.hide();
	};


	//----------------------------------
	// Create dungeon additional elements (hero, monsters, stairs, items, walldecos, funiture...)
	//----------------------------------

	// create hero on stairs
	this.createHero = function (heroData) {
		this.hero = new Hero(this, this.stairsDown.gridx, this.stairsDown.gridy, Tiles.Hero, heroData);
	};


	this.initHero = function () {
		this.hero.createHpBar();
		this.hero.moving = false;
		this.hero.fighting = false;
		this.hero.encounter = null;
		this.hero.path = [];
		for (var i in this.hero.tweens) {
			this.hero.tweens[i].stop();
		}

		// update fov -> callback will be executed for any tiles that become visible
		this.fov.updateFov(
			{ x: this.hero.gridx, y: this.hero.gridy }, this.hero.visRadius, true, this.hero.examineSurroundings);
	};


	// create max monsters at random locations
	this.createMonsters = function (max) {
		this.monsters = [];
		for (var i = 1; i <= max; i++) {
			var tile = this.getRandomTile(Tiles.Floor);
			var monster = new Monster(this, tile.gridx, tile.gridy, Tiles.Monster);
			monster.locate(tile.gridx, tile.gridy);
			monster.num = i;
			this.monsters.push(monster);
		}
	};


	this.initMonsters = function () {
		for (var i = 0; i < this.monsters.length; i++) {
			var monster = this.monsters[i];
			monster.createHpBar();
			monster.hide(); // necessary for propperly initializing fov
		}
	};


	// create stairs at nice ranom locations
	this.createStairs = function (type) {
		// build a list of all locations in the map that qualify for stairs
		var candidates = [];
		for (var y = 1; y < this.mapH - 1; y++) {
			for (var x = 1; x < this.mapW - 1; x++) {
				// only put stairs on the floor
				var tile = this.getTile(x, y);
				if (!tile) { continue; }
				if (tile.type !== Tiles.Floor) { continue; }
				// make sure this floor isn't right next to a door
				if (this.hasNeighborTypes(x, y, [Tiles.Door], true)) { continue; }
				// add it to the candidate list
				candidates.push({ x: x, y: y });
			}
		}
		// pick a random candidate location and make it the stairs
		var p = utils.randomArr(candidates);
		this.tiles.items[p.y][p.x] = new Tile(p.x, p.y, type);
		
		// return the generated stair tile
		return this.tiles.items[p.y][p.x];
	};


	this.createItem = function () {
		// build a list of all locations in the map that qualify for chests
		var candidates = [];
		for (var y = 1; y < this.mapH - 1; y++) {
			for (var x = 1; x < this.mapW - 1; x++) {
				// only put stairs on the floor
				var tile = this.getTile(x, y);
				if (!tile) { continue; }
				if (tile.type !== Tiles.Floor) { continue; }

				// high probability for item to appear on a room and not in a corridor
				if (utils.randomInt(1, 100) < 50 && !tile.room) { continue; }
				//if (!tile.room) { continue; }

				// make sure this floor isn't right next to a door or stair
				if (this.hasNeighborTypes(x, y, [Tiles.Door, Tiles.StairsUp, Tiles.StairsDown], true)) { continue; }
		
				

				// make sure at least 3 neighbors are walls
				if (this.hasNeighborTypes(x, y, [Tiles.Wall], true) < 3) { continue; }

				// add it to the candidate list
				candidates.push({ x: x, y: y });
			}
		}

		// escape if no location candidates
		if (candidates.length === 0) { return console.log('item could not be placed!'); }

		// pick a random candidate location and make it the stairs
		var p = utils.randomArr(candidates);
		this.tiles.items[p.y][p.x] = new Item(this, p.x, p.y, Tiles.Item);
		
		// return the generated item tile
		return this.tiles.items[p.y][p.x];
	};


	this.createWallDecoration = function () {
		// pick a random id from the walldeco tileset
		var decoTileset = utils.getRandomTileset('walldeco');
		var arr = decoTileset.id.split('-');
		var decoDirection = arr[arr.length - 1];

		// build a list of all locations in the map that qualify for chests
		var candidates = [];
		for (var y = 1; y < this.mapH - 1; y++) {
			for (var x = 1; x < this.mapW - 1; x++) {
				// only put stairs on the floor
				var tile = this.getTile(x, y, 'walls');
				if (!tile) { continue; }

				// make sure this tile is a wall
				if (tile.type !== Tiles.Wall) { continue; }

				// make sure the deco orientation matches the wall orientation
				if (tile.direction !== decoDirection) { continue; }

				// make sure the wall tile doesnt have a previous decoration
				if (tile.deco) { continue; }

				// make sure EW tile has a floor tile at his right
				var floorEW = this.getTile(x + 1, y);
				if (tile.direction === 'EW' && !floorEW) { continue; }

				// make sure NS tile has a floor tile at his bottom
				var floorNS = this.getTile(x, y + 1);
				if (tile.direction === 'NS' && !floorNS) { continue; }

				// add it to the candidate list
				candidates.push({ x: x, y: y });
			}
		}

		// escape if no location candidates
		if (candidates.length === 0) { return console.log('wall decoration could not be placed!'); }

		// pick a random candidate location and make it the wall decoration
		var p = utils.randomArr(candidates);
		this.tiles.walls[p.y][p.x].deco = decoTileset;
		//console.log('wallDeco:', decoTileset.id, decoDirection);
	};


	this.createRoomFurniture = function () {
		// build a list of all locations in the map that qualify for chests
		var candidates = [];
		for (var y = 1; y < this.mapH - 1; y++) {
			for (var x = 1; x < this.mapW - 1; x++) {
				// only put stairs on the floor
				var tile = this.getTile(x, y);
				if (!tile) { continue; }
				if (tile.type !== Tiles.Floor) { continue; }

				// make sure this floor isn't right next to a door or stair or other furniture
				if (this.hasNeighborTypes(x, y, [Tiles.Door, Tiles.StairsUp, Tiles.StairsDown, Tiles.Furniture], true)) { continue; }
		
				// make sure this floor is in a room
				if (!tile.room) { continue; }

				// make sure that any of the adjacent walls is decorated
				// TODO: this does not seem to work!
				var wall;
				wall = this.getTile(x - 1, y, 'walls');
				if (wall && wall.deco) { continue; }
				wall = this.getTile(x + 1, y, 'walls');
				if (wall && wall.deco) { continue; }
				wall = this.getTile(x, y - 1, 'walls');
				if (wall && wall.deco) { continue; }
				wall = this.getTile(x, y + 1, 'walls');
				if (wall && wall.deco) { continue; }

				// make sure at least 3 neighbors are walls
				//if (this.hasNeighborTypes(x, y, [Tiles.Wall], true) < 3) { continue; }

				// add it to the candidate list
				candidates.push({ x: x, y: y });
			}
		}

		// escape if no location candidates
		if (candidates.length === 0) { return console.log('furniture could not be placed!'); }

		// pick a random candidate location and make it furniture
		var p = utils.randomArr(candidates);
		this.tiles.items[p.y][p.x] = new Furniture(this, p.x, p.y, Tiles.Furniture);
		
		// return the generated item tile
		return this.tiles.items[p.y][p.x];
	};


	//----------------------------------
	// Scroll functions
	//----------------------------------

	// scroll dungeon to target tile
	this.scrollToTile = function (target, delay, time) {
		// determine final position for dungeon scrolling (1.25 is the factor up)
		var p = {
			x: 0 + Math.floor((-target.x - tileSize) + (window.canvasWidth / 2)),
			y: 0 + Math.floor((-target.y - tileSize * 1.25) + (window.canvasHeight / 2))
		};

		// if no time given, locate dungeon at end point
		if (!time || time === 0) {
			this.x = p.x;
			this.y = p.y;
			self.scrolling = false;
			return;
		}

		// tween dungeon to end point
		this.tweens.scroll = new Tween(Tween.QuadInOut, { x: this.x, y: this.y }, { x: p.x, y: p.y }, delay, time);
		this.tweens.scroll.on('start', function () {
			self.scrolling = true;
		});
		this.tweens.scroll.on('change', function (v) {
			self.x = v.x;
			self.y = v.y;
		});
		this.tweens.scroll.on('finish', function () {
			self.scrolling = false;
		});
		this.tweens.scroll.start();
	};


	//----------------------------------
	// Tile based Functions
	//----------------------------------

	this.getTile = function (x, y, layer) {
		if (x < 0 || y < 0 || x > this.mapW - 1 || y > this.mapH - 1) {
			return null;
		}

		var tile;
		if (layer) { return this.tiles[layer][y][x]; }
		tile = this.tiles.walls[y][x];
		if (tile) { return tile; }
		tile = this.tiles.items[y][x];
		if (tile) { return tile; }
		tile = this.tiles.floors[y][x];
		if (tile) { return tile; }

		return null;
	};


	this.getTileAtPos = function (pos, layer) {
		var x = Math.floor(pos.x / (tileSize));
		var y = Math.floor(pos.y / (tileSize));
		return this.getTile(x, y, layer);
	};


	this.getPosAtTile = function (tile) {
		return {
			x: tile.x * tileSize + tileSize / 2,
			y: tile.y * tileSize + tileSize / 2
		};
	};


	this.getRandomTile = function (tileType) {
		var ok = false;
		var tile;
		while (ok === false) {
			var x = utils.randomInt(0, this.mapW - 1);
			var y = utils.randomInt(0, this.mapH - 1);
			tile = this.getTile(x, y);
			if (tile) {
				if (tile.type === tileType) { ok = true; }
			}
		}

		return tile;
	};


	//----------------------------------
	// Neighbor functions
	//----------------------------------

	// check if tile is adjacent to another tile of given type
	// we can look on all 8 tiles or only 4
	// returns the number of neighbors of specified type
	this.hasNeighborTypes = function (x, y, neighborTypes, diagonals) {
		var n = 0;

		for (var i = 0; i < neighborTypes.length; i++) {
			var type = neighborTypes[i];
			if (this.getTile(x, y - 1).type === type) { n++; }
			if (this.getTile(x, y + 1).type === type) { n++; }
			if (this.getTile(x - 1, y).type === type) { n++; }
			if (this.getTile(x + 1, y).type === type) { n++; }

			if (diagonals) {
				if (this.getTile(x - 1, y - 1).type === type) { n++; }
				if (this.getTile(x + 1, y - 1).type === type) { n++; }
				if (this.getTile(x + 1, y + 1).type === type) { n++; }
				if (this.getTile(x - 1, y + 1).type === type) { n++; }
			}
		}
		
		return n;
	};


	// returns an array with tile's 8 neighbors sorted clockwise
	this.getTileNeighbors = function (tile, layer) {
		var w = this.mapW - 1;
		var h = this.mapH - 1;
		var x = tile.gridx;
		var y = tile.gridy;

		var arr = [];
		arr[0] = y > 0 ? this.getTile(x, y - 1, layer) : null;
		arr[1] = x < w && y > 0 ? this.getTile(x + 1, y - 1, layer) : null;
		arr[2] = x < w ? this.getTile(x + 1, y, layer) : null;
		arr[3] = x < w && y < h ? this.getTile(x + 1, y + 1, layer) : null;
		arr[4] = y < h ? this.getTile(x, y + 1, layer) : null;
		arr[5] = x > 0 && y < h ? this.getTile(x - 1, y + 1, layer) : null;
		arr[6] = x > 0 ? this.getTile(x - 1, y, layer) : null;
		arr[7] = x > 0 && y > 0 ? this.getTile(x - 1, y - 1, layer) : null;

		return arr;
	};


	// returns 8 cells clockwise, with 1 if neighbor is of given type
	this.getTileNeighborTypes = function (tile, types, layer) {
		var neighbors = this.getTileNeighbors(tile, layer);
		
		var arr = [];
		for (var i = 0; i < neighbors.length; i++) {
			arr.push(0);
			if (neighbors[i]) {
				for (var n = 0; n < types.length; n++) {
					if (neighbors[i].type === types[n]) {
						arr[i] = 1;
						break;
					}
				}
			}
		}

		return arr;
	};


	// TODO: If walls are next to another wall on the same direction, dont use 3wall tiles...
	this.setWallDirections = function () {
		for (var y = 0; y < this.mapW; y++) {
			for (var x = 0; x < this.mapH; x++) {
				var tile = this.tiles.walls[y][x];
				if (tile && tile.type === Tiles.Wall) {
					var n = this.getTileNeighborTypes(tile, [Tiles.Wall, Tiles.Door]);
					
					// no walls around is a column, tree, obstacle, etc
					tile.direction = 'column';

					// 2 walls 2 floors
					if (!n[0] && !n[4] && n[6] && n[2]) { tile.direction = 'NS'; }
					if (!n[6] && !n[2] && n[0] && n[4]) { tile.direction = 'EW'; }

					// 1 wall 3 floors
					if (n[2] && !n[0] && !n[2] && !n[6]) { tile.direction = utils.randomArr(['column']); }
					if (n[6] && !n[0] && !n[2] && !n[4]) { tile.direction = utils.randomArr(['column']); }
					if (n[0] && !n[2] && !n[4] && !n[6]) { tile.direction = utils.randomArr(['column']); }
					if (n[4] && !n[0] && !n[2] && !n[6]) { tile.direction = utils.randomArr(['column']); }

					// corners
					if (n[2] && n[4] && !n[0] && !n[6]) { tile.direction = 'SW'; }
					if (n[6] && n[4] && !n[0] && !n[2]) { tile.direction = 'NW'; }
					if (n[0] && n[2] && !n[6] && !n[4]) { tile.direction = 'ES'; }
					if (n[0] && n[6] && !n[2] && !n[4]) { tile.direction = 'NE'; }

					// 3 walls, one floor
					if (n[0] && n[2] && n[4] && !n[6]) { tile.direction = 'ESW'; }
					if (n[0] && n[6] && n[4] && !n[2]) { tile.direction = 'NEW'; }
					if (n[0] && n[2] && n[6] && !n[4]) { tile.direction = 'NES'; }
					if (n[2] && n[4] && n[6] && !n[0]) { tile.direction = 'NSW'; }

					// 4 walls
					if (n[0] && n[2] && n[4] && n[6]) {
						tile.direction = 'NESW'; //utils.randomArr('NESW');
					}
				}
			}
		}
	};


	//----------------------------------
	// Room functions
	//----------------------------------

	this.getRandomRoom = function () { // roomNum, tileType
		if (!this.rooms) { return undefined; }
		return utils.randomArr(this.rooms);
	};


	this.getRandomTileInRoom = function (room, tileType) {
		if (!this.rooms) { return this.getRandomTile(tileType); }
		var ok = false;
		var tile;
		while (ok === false) {
			var x = Math.rand(room.rect.x, room.rect.x + room.rect.width);
			var y = Math.rand(room.rect.y, room.rect.y + room.rect.height);
			tile = this.getTile(x, y);
			if (tile.type === tileType) { ok = true; }
		}

		return tile;
	};

}

inherit(Dungeon, Sprite);
module.exports = Dungeon;