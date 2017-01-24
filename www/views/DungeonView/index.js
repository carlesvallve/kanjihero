var utils = require('utils');
var inherit = require('inherit');
var View = require('WuicView');
var wuicSwipeBehavior = require('wuicSwipeBehavior');
var Tween = require('wuicTween').Tween;

var Ui = require('Ui');
var Visor = require('Visor');
var Basic = require('Basic');
var Bsp = require('Bsp');
var Cave = require('Cave');


function DungeonView() {
	View.call(this);
	var self = this;

	// get globals
	var Tiles = window.Tiles;

	// init preferences
	var tweenAfterDrag = false;
	this.tappedOnUi = false;

	// set dimensions
	var canvasWidth = window.canvasWidth;
	var canvasHeight = window.canvasHeight;
	this.width = canvasWidth;
	this.height = canvasHeight;

	// init dungeon levels data
	var dungeonLevels = [];
	var currentDungeonLevel = 0;

	// init hero data
	var heroData = {};

	// init tweens
	this.tweens = {};

	// create ui overlay
	this.ui = this.appendChild(new Ui(this));


	// -------------------------------------------------
	// Init
	// -------------------------------------------------

	this.init = function () {
		// reset dungeon levels data
		dungeonLevels = [];
		currentDungeonLevel = 0;

		// initialize ui
		this.ui.init();
		this.ui.console.init();

		// create first dungeon level
		this.initLevel(currentDungeonLevel);

		// initialize ui elements that use hero data
		this.ui.portrait.init(this.dungeon.hero);
		this.ui.inventory.init();
		this.ui.quickSlots.init();
		

		// render view
		this.setRenderMethod(function (context) {
			// update tweens
			for (var i in this.tweens) {
				this.tweens[i].update();
			}

			// clear the canvas
			context.clearRect(0, 0, this.width, this.height);
		});
	};


	/*this.drawTiles = function () {
		var dungeon = this.dungeon;
		var tiles = this.dungeon.tiles;
		var ts = window.tileSize;
		var zoom = window.zoom;


		// method 1
		// Find the tile position of the tiles in the corners of the screen, 
		// then draw the map line by line between these positions?
		var p1 = this.getIsoCoordAtScreenPoint({ x: ts / 2, y: ts / 2 }); // find tile at top-left corner
		var p2 = this.getIsoCoordAtScreenPoint({ x: this.width - ts / 2, y: this.height - ts / 2 }); // find tile at bottom-right corner
		for (var y = p1.y; y < p2.y; y++) {
			for (var x = p1.x; x < p2.x; x++) {
				//var p = this.getIsoCoordAtScreenPoint({ x: x, y: y });
				var tile = dungeon.getTile(x, y);
				if (tile) { 
					tile.lightIntensity = 0.3; 
				}
			}
		}

		// method 2
		var p1 = { x: ts / 2, y: ts / 2 }; // find tile at top-left corner
		var p2 = { x: this.width - ts / 2, y: this.height - ts / 2 }; // find tile at bottom-right corner
		for (var y = p1.y; y < p2.y; y += ts / 2) {
			for (var x = p1.x; x < p2.x; x+= ts) {
				var p = this.getIsoCoordAtScreenPoint({ x: x, y: y });
				var tile = dungeon.getTile(p.x, p.y);
				if (tile) { 
					//tile.lightIntensity = 0.3; 
					//tile.draw(tile.context);
					tile.setRenderMethod(function (context) {
						this.draw(context);
					})
				}
			}
		}
	};*/


	this.changeLevel = function (direction) {
		// TODO: Display warning popup
		if (currentDungeonLevel === 0 && direction < 0) {
			return console.log('Are you sure you want to leave the tower?');
		}

		// update level num and create new level
		currentDungeonLevel += direction;
		self.initLevel();
	};


	this.initLevel = function () {
		console.log('welcome to dungeon level ' + currentDungeonLevel);
		
		// init vars
		this.tweens = {};

		// clear the ui console
		this.ui.console.clear();

		// create visor after destroying previous one
		if (this.visor) { this.visor.destroy(); }
		this.visor = this.appendChild(new Visor(this));
		this.visor.init(1.0); //1.25

		// generate new dungeon level, or grab one stored in levels array
		var dungeon;
		if (currentDungeonLevel < dungeonLevels.length) {
			dungeon = dungeonLevels[currentDungeonLevel];
		} else {
			dungeon = this.generateLevel();
		}
		
		// append dungeon sprite
		this.dungeon = this.visor.appendChild(dungeon);

		// log welcome to dungeon level
		this.ui.console.log('Welcome to Dungeon Level ' + (currentDungeonLevel + 1) + '.');

		// initialize dungeon
		dungeon.init(currentDungeonLevel);

		// store dungeon as a global var
		window.dungeon = dungeon;
		
		// sort view childs by zIndex
		this.sortChilden(function (a, b) {
			return a.zIndex - b.zIndex;
		});
	};


	this.generateLevel = function () {
		// define map size
		var w = 24, h = 24;
		var i;

		// if a dungeon already exists, store hero data
		if (this.dungeon) {
			var hero = this.dungeon.hero;
			heroData =  {
				tileset: hero.tileset,
				stats: hero.stats,
				actionMode: hero.actionMode,
				selectedWeapon: hero.selectedWeapon
			};
		}

		// choose generator
		var dungeon;
		switch ('bsp') {
			case 'basic':
				dungeon = new Basic(this.visor, w, h);
				break;
			case 'cave':
				dungeon = new Cave(this.visor, w, h);
				break;
			case 'bsp':
				dungeon = new Bsp(this.visor, w, h);
				break;
		}

		// generate dungeon
		dungeon.generate();

		// define rooms
		dungeon.defineRooms();

		// set wall directions
		dungeon.setWallDirections();

		// create up and down stairs
		dungeon.stairsUp = dungeon.createStairs(Tiles.StairsUp);
		dungeon.stairsDown = dungeon.createStairs(Tiles.StairsDown);

		// create items
		for (i = 1; i < 16; i++) {
			dungeon.createItem();
		}

		// create rooms furniture
		for (i = 1; i < 16; i++) {
			dungeon.createRoomFurniture();
		}

		// create wall decorations
		for (i = 1; i < 16; i++) {
			dungeon.createWallDecoration();
		}

		// create hero
		dungeon.createHero(heroData);

		//create some monsters
		dungeon.createMonsters(8);

		// define rooms (used by items, hero, monsters)
		dungeon.defineRooms();

		// add level to levels list
		dungeonLevels.push(dungeon);
		return dungeon;
	};


	// -------------------------------------------------
	// Swipe Behavior
	// -------------------------------------------------

	this.initSwipeBehavior = function () {

		wuicSwipeBehavior(this, this);

		var swipeCancel = false;
		var swOriginPos = { x: 0, y: 0 };
		var swPos = { x: 0, y: 0 };
		var swIncs = { x: 0, y: 0 };

		this.on('swipestart', function (e, state) {
			if (window.focus !== 'dungeon' || this.ui.state === 'open') { return; }
			//console.log('swipestart', window.focus);

			// init swipe vars
			swipeCancel = true;
			swOriginPos = { x: state.x, y: state.y };
			swPos = { x: state.x, y: state.y };
			swIncs = { x: 0, y: 0 };
		});


		this.on('swipe', function (e, state) {
			if (window.focus !== 'dungeon' || this.ui.state === 'open') { return; }
			//console.log('swipping', window.focus);

			// stop tween if exist
			if (self.dungeon.tweens.swipe) { self.dungeon.tweens.swipe.stop(); }
			if (self.dungeon.scrolling) {
				self.dungeon.tweens.scroll.stop();
				self.dungeon.scrolling = false;
			}

			// scroll map by swipe increments
			var zoom = self.visor.scaleX;
			swIncs = { x: state.x - swPos.x, y: state.y - swPos.y };
			swPos = { x: state.x, y: state.y };
			self.dungeon.x += swIncs.x / zoom;
			self.dungeon.y += swIncs.y / zoom;

			// if we moved over maxDistance, means we didnt cancel the swipe
			var tapDistanceMax = 4;
			var a = Math.abs(swPos.x - swOriginPos.x);
			var b = Math.abs(swPos.y - swOriginPos.y);
			if (a > tapDistanceMax || b > tapDistanceMax) {
				swipeCancel = false;
			}
			
		});


		this.on('swipeend', function (e, state, pos) {
			if (window.focus !== 'dungeon' || this.ui.state === 'open') { return; }
			//console.log('swipeend', window.focus);

			// if mouse distance from origin is small enough, means we are clicking instead of swiping
			if (swipeCancel) {
				return this.emit('swipecancel', swOriginPos);
			}

			if (tweenAfterDrag) {
				// calculate final swipe position applying swipe velocity
				var zoom = self.visor.scaleX;
				var x = Math.floor(self.dungeon.x + (pos.velocityX * (100 / zoom)));
				var y = Math.floor(self.dungeon.y + (pos.velocityY * (100 / zoom)));

				// optionally, snap it to the grid
				//x = Math.round(x / tileSize) * tileSize;
				//y = Math.round(y / tileSize) * tileSize;

				// tween dungeon sprite to final swipe position
				var tweens = self.dungeon.tweens;
				tweens.swipe = new Tween(Tween.QuadOut, { x: self.dungeon.x, y: self.dungeon.y }, { x: x, y: y }, 0, 0.3);
				tweens.swipe.on('change', function (v) {
					self.dungeon.x = v.x;
					self.dungeon.y = v.y;
				});
				tweens.swipe.start();
			}
		});


		this.on('swipecancel', function (pos) {
			if (window.focus !== 'dungeon' || this.ui.state === 'open') { return; }

			// get isometric coordinate at given screen point
			var p = self.getIsoCoordAtScreenPoint(pos);
			
			// get tile in map at given coords
			var tile = self.dungeon.getTile(p.x, p.y);
			
			// tell the hero to find a path to tile in map
			if (tile) {
				//self.dungeon.hero.findPath(tile);
				self.dungeon.hero.setPathToGoal(tile);
			} else {
				console.log('no tile found');
			}
		});
	};

	this.initSwipeBehavior();


	this.getIsoCoordAtScreenPoint = function (pos) {
		// get zoom factor
		var zoom = window.zoom;

		// get point in visor
		var visorX = Math.floor(pos.x  - self.visor.x);
		var visorY = Math.floor(pos.y  - self.visor.y);

		// get point in dungeon map
		var mapX = visorX - self.dungeon.x * zoom;
		var mapY = visorY - self.dungeon.y * zoom;

		// get coords in map
		//var coordX = Math.floor((-tileSize / 2 + mapX) / Math.floor(tileSize * zoom));
		//var coordY = Math.floor((-tileSize / 4 + mapY) / Math.floor(tileSize * zoom));
		
		// get coords in map
		var p = utils.isoToCoords(mapX - (54 / 2) * zoom, mapY - (54 / 2) * zoom, zoom);
		return p;
	};
	

	// -------------------------------------------------------------------
	// Open/Close Wuic View
	// -------------------------------------------------------------------

	this.open = function (options) {
		// initialize
		if (options.initialize) { self.init(); }

		// tell navTree we finished opening the view
		this.emit('opened');
	};


	this.close = function () {
		// tell navTree we finished closing the view
		this.emit('closed');
	};

}

inherit(DungeonView, View);
module.exports = DungeonView;
