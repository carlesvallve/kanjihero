var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var Tile = require('Tile');
var Projectile = require('Projectile');
var AStar = require('AStar');
var Tween = require('wuicTween').Tween;

var twTime = 0.15;

/**
 * @class
 * @classDesc Ent -> Moveable entity tile, to use as superclass for monsters, heroes, etc
 */
function Ent(parent, x, y, type, data) {
	Tile.call(this, x, y, type);
	
	// set vars
	var self = this;
	var ui = parent.parent.parent.ui;
	var Tiles = window.Tiles;
	var tileSize = window.tileSize;

	// init preferences
	var moveAfterOpenDoor = true;
	var moveAfterKilling = true;

	// init props
	this.tweens = {};
	this.layer = 'walls';

	// init states
	this.turns = 1;
	this.moving = false;
	this.fighting = false;
	this.encounter = null;
	this.path = [];

	// stats
	if (data && data.stats) {
		this.stats = data.stats;
	} else {
		var xp = utils.randomInt(0, 0);
		var hp = utils.randomInt(10, 20);
		var mp = utils.randomInt(20, 20);

		this.stats = {
			level: 1,
			xp: xp,
			xpMax: 10,
			hp: hp,
			hpMax: hp,
			mp: mp,
			mpMax: mp,
			regeneration: 0.1,
			hunger: 0.1,
			hit: utils.randomInt(30, 60),
			evasion: utils.randomInt(15, 30),
			damage: utils.randomInt(1, 4),
			armor: utils.randomInt(1, 2)
		};
	}
	
	// choose a pure random monster by default
	if (data && data.tileset) {
		this.tileset = data.tileset;
	} else {
		this.tileset = utils.getRandomTileset('monsters');
		this.info = utils.splitCamelCase(this.tileset.id);
	}

	// set/update hero's actionMode
	if (data && data.actionMode) {
		this.actionMode = data.actionMode;
	} else {
		this.actionMode = 'move';
	}

	// set/update hero's selected weapon
	// TODO: this doesn't seem to work!
	if (data && data.selectedWeapon) {
		this.selectedWeapon = data.selectedWeapon;
	} else {
		this.selectedWeapon = null;
	}


	// -------------------------------------------------
	// Render Ent
	// -------------------------------------------------

	// render ent
	this.setRenderMethod(function (context) {
		this.draw(context);
	});


	this.draw = function (context) {
		// update tweens
		for (var i in this.tweens) {
			this.tweens[i].update();
		}

		// update zIndex
		this.zIndex = this.y;

		// check tileset
		if (!this.tileset) { return this.tilesetNotFound(); }

		context.save();

		// draw the entity
		context.drawImage(this.tileset.img,
			this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
			3, 5, this.tileset.rect.w - 6, this.tileset.rect.h - 6);

		// draw light
		this.drawLight(context, this.tileset, this.tileset.rect, { x: 3, y: 5, w: this.tileset.rect.w - 6, h: this.tileset.rect.h - 6 }, true);

		context.restore();
	};

	// -------------------------------------------------
	// Examine Surroundings
	// -------------------------------------------------

	this.examineSurroundings = function (tile) {
		if (tile.type === Tiles.Monster) { //  || tile.type === Tiles.Hero
			// stop moving
			self.moving = false;
			self.encounter = null;
		}
	};


	// -------------------------------------------------
	// Pathfinding & Movement
	// -------------------------------------------------

	// -------------------
	// Locate

	this.locate = function (gridx, gridy, layer) {
		// liberate tile at old location
		parent.tiles[self.layer][self.gridy][self.gridx] = null;

		// set ent new layer and location
		if (layer) { self.layer = layer; }
		this.gridx = gridx;
		this.gridy = gridy;

		var p = utils.coordsToIso(gridx, gridy);
		this.x = p.x;
		this.y = p.y;

		// set ent at tiles array position
		parent.tiles[self.layer][gridy][gridx] = this;
	};

	this.locate(this.gridx, this.gridy);


	// -------------------
	// Auto Explore

	this.autoExplore = function () {
		// TODO: Implement this feature!
		console.log('AutoExplore is not implemented yet!');
	};


	// -------------------
	// Walkability Grid

	this.generateWalkabilityGrid = function (goalTile) {
		// Get Encounters: check if goalTile will trigger an encounter
		this.encounter = null;

		switch (goalTile.type) {
			case Tiles.Door:
				if (goalTile.state === 'closed') { this.encounter = goalTile; }
				break;
			case Tiles.Monster:
			case Tiles.Hero:
				if (goalTile.canBeSeen) { this.encounter = goalTile; }
				break;
		}

		if (this.encounter === this) { this.encounter = null; }

		// Generate walkability grid:
		// - are not walkable (1) all tiles that are walls, closed doors or monsters 
		// - not explored tiles are also unwalkable
		// - invisible monsters are walkable, but (important!) we will stop moving as soon as we see them
		//   (otherwise we will end up over the monster or pass through it)
		// - any tile that is an encounter it will be walkalbe

		var grid = [];
		for (var y = 0; y < parent.mapW; y++) {
			grid[y] = [];
			for (var x = 0; x < parent.mapH; x++) {
				grid[y][x] = 0;
				var tile = parent.getTile(x, y);
				if (tile && tile !== this.encounter) {
					var solid = 0;
					switch (tile.type) {
						case Tiles.Wall:
						case Tiles.Furniture:
							solid = 1;
							break;
						case Tiles.Monster:
							if (tile.canBeSeen) {
								solid = 1;
							} else {
								solid = 0;
							}
							break;
						case Tiles.Hero:
							if (tile.canBeSeen) {
								solid = 1;
							} else {
								solid = 0;
							}
							break;
						case Tiles.Door:
							if (tile.state === 'closed') {
								solid = 1;
							}
							break;
					}
					if (!tile.hasBeenSeen) { solid = 1; }
					grid[y][x] = solid;
				}
			}
		}
		return grid;
	};


	// --------------------------------------
	// Path and Movement

	this.getPath = function (goalTile) {
		var grid = this.generateWalkabilityGrid(goalTile);
		var start = [this.gridx, this.gridy];
		var goal = [goalTile.gridx, goalTile.gridy];
		var path = new AStar(grid, start, goal, 'DiagonalFree');
		// remove first path node
		path.shift();
		return path;
	};


	this.setPathToGoal = function (goalTile) {
		// get path
		var path = this.getPath(goalTile);
		this.moveToGoal(goalTile, path);
		
	};


	this.moveToGoal = function (goalTile, path) {
		if (!path || path.length === 0) { return; }
		if (self.fighting) { return; }

		// scroll map to goal
		parent.scrollToTile(goalTile, 0, twTime * path.length);
		
		function step() {
			// get next tile in path
			var tile = parent.getTile(path[0][0], path[0][1]);

			// if tile is an encounter, escape and resolve it
			if (self.encounter) {
				if (tile === self.encounter) {
					self.endMoving();
					self.resolveEncounter();
					return;
				}
			}

			// update hero on map
			parent.tiles[self.layer][self.gridy][self.gridx] = null;
			self.gridx = tile.gridx;
			self.gridy = tile.gridy;
			parent.tiles[self.layer][self.gridy][self.gridx] = self;

			// tween ent from current to next tile pos
			var tween = self.tweens.move = new Tween(Tween.QuadInOut, { x: self.x, y: self.y }, { x: tile.x, y: tile.y }, 0, twTime);
			tween.on('change', function (v) {
				self.x = v.x;
				self.y = v.y;
			});

			tween.on('finish', function () {
				// remove path node
				path.shift();
				
				// update fov
				self.updateFov();

				// check for end of movement
				if (path.length === 0 || !self.moving) {
					self.endMoving();
					return;
				}

				// apply hunger
				self.applyHunger(1);

				// execute next step
				step();
			});

			tween.start();
		}

		// start moving
		this.moving = true;
		step();
	};


	// --------------------------------------
	// End Moving


	this.endMoving = function () {
		// stop moving
		this.moving = false;

		// apply hunger
		this.applyHunger(1);

		// check for items
		this.checkItemsAtTile(this.gridx, this.gridy);
	};


	this.checkItemsAtTile = function (gridx, gridy) {
		var item = parent.getTile(gridx, gridy, 'items');
		
		if (!item || this.encounter) { return; }

		switch (item.type) {
			case Tiles.StairsDown:
				parent.parent.parent.changeLevel(-1);
				break;

			case Tiles.StairsUp:
				parent.parent.parent.changeLevel(1);
				break;
				
			case Tiles.Item:
				var inv = parent.parent.parent.ui.inventory;
				var uiSlot = inv.addItem(item);
				if (uiSlot) {
					ui.console.log('You pick a ' + utils.wordifyCamelCase(item.tileset.id) + '.');
					this.displayTileInfo(item, 'yellow');
					item.destroy();
					parent.tiles[item.layer][item.gridy][item.gridx] = null;
				} else {
					this.createInfoLabel(this, 'Inventory full!', '#bbb', 0);
				}
				break;
		}
	};


	this.resolveEncounter = function () {
		var tile = this.encounter;
		switch (tile.type) {
			case Tiles.Door:
				if (tile.state === 'closed') {
					tile.state = 'open';
					// wait for one turn and move to open door tile
					if (moveAfterOpenDoor) {
						this.wait(twTime * 0.25, function () {
							this.encounter = null;
							self.setPathToGoal(tile);
						});
					}
				}
				break;
			case Tiles.Monster:
			case Tiles.Hero:
				// initiate combat
				parent.scrollToTile(this, 0, twTime * 3);
				this.wait(twTime * 0.25, function () {
					this.encounter = null;
					self.combat(self.encounter);
				});
				break;
		}
	};


	// --------------------------------------
	// Fov (Vision)


	this.updateFov = function () {
		var arr = parent.fov.updateFov({ x: this.gridx, y: this.gridy }, this.visRadius, true, function (tile) {
			// note: this function gives tiles that has passed from invisible to visible!
			if (tile.type === Tiles.Monster) {
				self.moving = false;
				ui.console.log('You see a ' + utils.wordifyCamelCase(tile.tileset.id));
				parent.scrollToTile(tile, twTime * 0.75, twTime * 1.5);
			}
		});
		
		// generate arrays of relevant visible tiles (not in use yet)
		var visibleItems = [];
		var visibleMonsters = [];
		var visibleHeroes = [];

		for (var i = 0; i < arr.length; i++) {
			var p = arr[i];
			var tile = parent.getTile(p.x, p.y);
			switch (tile.type) {
				case Tiles.Hero:
					visibleHeroes.push(tile);
					break;
				case Tiles.Item:
					visibleItems.push(tile);
					break;
				case Tiles.Monster:
					visibleMonsters.push(tile);
					break;
			}
		}
	};
	


	// -------------------
	// Find Path Old

	/*this.findPathOld = function (goalTile) { // , maxPathSteps
		// if we are in 'look' action mode, 
		// display tile info on any tile that is not a floor or a door
		if (this.actionMode === 'look') {
			if (goalTile.layer !== 'floors' && goalTile.type !== Tiles.Door) {
				parent.selector.hide();
				this.displayTileInfo(goalTile, 'white', false);
				return;
			}
		}

		// check if we are dead
		if (this.dead) {
			console.log('Sorry, Im dead!');
			parent.selector.hide();
			return;
		}

		// check if the goal tile is not available
		if (!goalTile.hasBeenSeen || goalTile.type === Tiles.Wall || goalTile.type === Tiles.Furniture) {
			this.moving = false;
			parent.selector.hide();
			console.log("Sorry, can't go there!");
			return;
		}

		// escape if we are already doing some action (moving, fighting)
		if (this.moving || this.fighting) {
			this.moving = false;
			parent.selector.hide();
			console.log('Sorry, I am bussy!');
			return;
		}

		// check if we want to do a ranged attack on the tile
		if (goalTile.type === Tiles.Monster && this.checkForRangedAttack(goalTile)) {
			this.moving = false;
			return;
		}

		// if we clicked on us, check for items
		if (goalTile.gridx === this.gridx && goalTile.gridy === this.gridy) {
			this.applyHunger(1);
			this.checkItemsAtCoord(goalTile.gridx, goalTile.gridy);
		}

		// check if the goal tile will trigger an encounter
		this.encounter = this.checkTileEncounters(goalTile);

		// display selector on tile
		if (goalTile.type !== Tiles.Monster) {
			parent.selector.x = goalTile.x;
			parent.selector.y = goalTile.y;
			if (goalTile.layer === 'floors') {
				parent.selector.zIndex = goalTile.zIndex + 1;
			} else {
				parent.selector.zIndex = goalTile.zIndex - tileSize / 4;
			}
			parent.selector.show();
		} else {
			parent.selector.hide();
		}

		// define a-star parameters:
		// walkability grid, start and goal points
		var grid = this.generateWalkabilityGrid();
		var start = [this.gridx, this.gridy];
		var goal = [goalTile.gridx, goalTile.gridy];

		// search for an astar path: 
		// (Manhattan, Diagonal, Euclidean, Diagonal, EuclideanFree, DiagonalFree)
		this.path = new AStar(grid, start, goal, 'DiagonalFree');
		//console.log('findPath:', this.path);

		// scroll dungeon to goalTile
		if (self.path.length > 0) {
			parent.scrollToTile(goalTile, 0, twTime * self.path.length);
		}

		// we found no path to viable goalTile
		if (!this.path || this.path.length === 0) {
			console.log("Curses, can't go there!");
			this.moving = false;
			parent.selector.hide();
			return;
		}

		// we clicked on us
		if (this.path.length === 1) {
			console.log("Here I am!");
			this.moving = false;
			parent.selector.hide();
			this.checkPathEnd();
			return;
		}

		// resolve encounters
		if (this.encounter && this.path.length === 2) {
			return this.resolveEncounters();
		}

		//if (maxPathSteps && this.path.length > maxPathSteps) {
			//this.path.splice(maxPathSteps + 1, (this.path.length - maxPathSteps));
		//}

		// make hero follow the path
		this.followPath();
	};*/

	// -------------------
	// Follow Path Old

	/*this.followPathOld = function () {
		// tween hero through one step
		function step() {
			// escape if not moving
			if (!self.moving) {
				self.moving = false;
				self.checkPathEnd();
				return;
			}

			// escape if path is empty
			if (!self.path || self.path.length === 0) {
				this.moving = false;
				return console.log('sorry, I have no path to follow!');
			}

			// get next tile in path
			var tile = parent.getTile(self.path[0][0], self.path[0][1], 'floors');
			if (!tile) {
				self.moving = false;
				return console.log('sorry, next tile in path was not found');
			}

			// start helping tween to calculate when the entity will be exactly in-between 2 tiles
			self.tweens.halfstep = new Tween(Tween.QuadInOut, { t: 0 }, { t: 100 }, 0, twTime / 2);
			self.tweens.halfstep.on('finish', function () {
				// check half step (update fov)
				self.checkHalfStep(tile);
			});
			self.tweens.halfstep.start();

			// tween ent from current to next tile pos
			var tween = self.tweens.move = new Tween(Tween.QuadInOut, { x: self.x, y: self.y }, { x: tile.x, y: tile.y }, 0, twTime);
			tween.on('start', function () {
				// liberate tile at hero pos
				parent.tiles[self.layer][self.gridy][self.gridx] = null;
			});

			tween.on('change', function (v) {
				self.x = v.x;
				self.y = v.y;
			});

			tween.on('finish', function () {
				// remove path node
				self.path.shift();

				// check step
				self.checkStep();

				// check for path end
				if (self.path.length === 0) {
					self.moving = false;
					self.checkPathEnd();
				} else {
					// execute next step
					step();
				}
			});

			tween.start();
		}

		// first, check for any tile encounters in the path, 
		// and if so, limit path until that tile
		var tile;
		var path = [];
		for (var i = 0; i < this.path.length; i++) {
			tile = parent.getTile(this.path[i][0], this.path[i][1]);
			if (tile) {
				if (tile === this.encounter) {
					break;
				}
				path.push(this.path[i]);
			}
		}
		this.path = path;

		// remove first path node
		self.path.shift();

		// begin first step
		this.moving = true;
		step();
	};*/

	
	// -------------------
	// Tile Checks

	/*this.checkHalfStep = function () { // tile
		// TODO: Implement fov without render for monnster ai
	};

	this.checkStep = function () {
		// locate ent in new tile
		var p = utils.isoToCoords(self.x, self.y, 1);
		self.locate(p.x, p.y);

		// aplly hunger to mp
		this.applyHunger(1);
	};


	this.checkPathEnd = function () {
		// hide selector
		parent.selector.hide();

		// reset path
		this.path = [];

		// if goalTile was an encounter, resolve it
		if (this.encounter) {
			this.resolveEncounters();
		}
	};


	this.checkTileEncounters = function (tile) {
		var encounter;
		switch (tile.type) {
			case Tiles.Door:
				if (tile.state === 'closed') {
					encounter = tile;
				}
				break;
			case Tiles.Monster:
				if (tile.canBeSeen) {
					encounter = tile;
				}
				break;
			case Tiles.Hero:
				if (tile.canBeSeen) {
					encounter = tile;
				}
				break;
		}
		return encounter;
	};


	this.resolveEncountersOld = function () {
		var tile = this.encounter;
		switch (tile.type) {
			case Tiles.Door:
				if (tile.state === 'closed') {
					tile.state = 'open';
					// wait for one turn and move to open door tile
					if (moveAfterOpenDoor) {
						this.wait(twTime * 0.25, function () {
							this.encounter = null;
							self.findPath(tile);
						});
					}
				}
				break;
			case Tiles.Monster:
			//case Tiles.Hero:
				// initiate combat
				parent.scrollToTile(this, 0, twTime * 3);
				this.wait(twTime * 0.25, function () {
					this.encounter = null;
					self.combat(self.encounter);
				});
				break;
		}
	};


	this.checkItemsAtCoordOld = function (gridx, gridy) {
		var item = parent.getTile(gridx, gridy, 'items');
		
		if (!item || this.encounter) { return; }

		switch (item.type) {
			case Tiles.StairsDown:
				parent.parent.parent.changeLevel(-1);
				break;

			case Tiles.StairsUp:
				parent.parent.parent.changeLevel(1);
				break;
				
			case Tiles.Item:
				var inv = parent.parent.parent.ui.inventory;
				var uiSlot = inv.addItem(item);
				if (uiSlot) {
					ui.console.log('You pick a ' + utils.wordifyCamelCase(item.tileset.id) + '.');
					this.displayTileInfo(item, 'yellow');
					item.destroy();
					parent.tiles[item.layer][item.gridy][item.gridx] = null;
					//inv.autoEquipItem(uiSlot);
				} else {
					this.createInfoLabel(this, 'Inventory full!', '#bbb', 0);
				}
				break;
		}
	};*/


	// -------------------
	// Tile Ifo

	this.displayTileInfo = function (tile, color, reversedWords) {
		color = color || 'white';
		var arr;
		if (tile.deco) {
			arr = utils.splitCamelCase(tile.deco.id);
		} else {
			arr = utils.splitCamelCase(tile.tileset.id);
		}
		if (reversedWords) {
			var temp = arr[0];
			arr[0] = arr[1];
			arr[1] = temp;
		}
		this.createInfoLabel(tile, arr.join(' '), color, 0, twTime * 6, 60);

		/*if (tile.type === Tiles.Monster) {
			tile.calculateFov();
		}*/
	};


	// -------------------------------------------------
	// Ranged Combat
	// -------------------------------------------------

	this.checkForRangedAttack = function (goalTile) {
		// if no weapon or no monster, escape
		if (!this.selectedWeapon) { return false; }
		if (goalTile.type !== Tiles.Monster) { return false; }
		
		// check if our selected weapon is ranged
		var subtype = this.selectedWeapon.subtype;
		//console.log('attack with weapon type:', subtype);
		if (subtype === 'bow' || subtype === 'crossbow' || subtype === 'xbow' ||
			subtype === 'sling' || subtype === 'throwing') {
			// TODO: check that distance to goalTile is more than 1 cell and less than [weapon range] cells (?)
			
			// execute ranged attack
			this.shoot(goalTile);
			return true;
		}

		return false;
	};

	
	this.shoot = function (target) {
		if (this.fighting === true) { return; }

		// log shooting action
		ui.console.log('You shoot the ' + target.tileset.id + ' with your ' + this.selectedWeapon.subtype);
		
		// create projectile at shooter pos // var projectile = 
		parent.appendChild(new Projectile(parent, null, this, target, function (targetWasHit) {
			if (targetWasHit) {
				// target takes damage
				target.takeDamage(self, 0);
			} else {
				// we missed
				target.createInfoLabel(target, 'Miss', '#ddd', twTime * 0.6);
				if (self === parent.hero) {
					ui.console.log('You miss the ' + utils.wordifyCamelCase(target.tileset.id) + '.');
				} else {
					ui.console.log('The ' + utils.wordifyCamelCase(target.tileset.id) + ' misses you.');
				}
			}
		}));
	};


	// -------------------------------------------------
	// Melee Combat
	// -------------------------------------------------


	this.combat = function (enemy) {
		this.fighting = true;

		// hero will attack enemy and hit or fail, wait and defend from enemy
		var dice = this.attack(enemy, 0);
		if (dice <= 75) {
			enemy.takeDamage(self, twTime * 0.6);
		} else {
			// log miss
			enemy.createInfoLabel(enemy, 'Miss', '#ddd', twTime * 0.6);
			if (self === parent.hero) {
				ui.console.log('You miss the ' + utils.wordifyCamelCase(enemy.tileset.id) + '.');
			} else {
				ui.console.log('The ' + utils.wordifyCamelCase(enemy.tileset.id) + ' misses you.');
			}
		}

		// enemy will wait, and then attack himself in turn
		this.wait(twTime * 2.3, function () {
			if (enemy.dead) { return; }
			dice = enemy.attack(self, 0);
			if (dice <= 75) {
				self.takeDamage(enemy, twTime * 0.6);
			} else {
				// log miss
				self.createInfoLabel(self, 'Miss', '#ddd', twTime * 0.6);
				if (enemy === parent.hero) {
					ui.console.log('You miss the ' + utils.wordifyCamelCase(self.tileset.id) + '.');
				} else {
					ui.console.log('The ' + utils.wordifyCamelCase(enemy.tileset.id) + ' misses you.');
				}
			}

			// wait for combat end
			self.wait(twTime * 2, function () {
				self.fighting = false;
			});
		});

		// apply hunger for this action
		self.applyHunger(2);
	};


	this.attack = function (enemy, delay) {
		// total attacker hit - toal defender evasion
		var dice = utils.randomInt(1, 100);

		// get attack displacement point
		var dist = utils.getDistance(this, enemy);
		var a = (enemy.x - this.x);
		var b = (enemy.y - this.y);
		var dx = 27 * a / dist;
		var dy = 27 * b / dist;
		var p = { x: this.x + dx * 0.5, y: this.y + dy * 0.5 };
		var p2 = { x: self.x, y: self.y };
		
		// set attack time
		var time = twTime * 0.5;
		if (moveAfterKilling && enemy.dead) {
			p = { x: enemy.x, y: enemy.y };
			time = twTime;
		}

		// attack animation
		this.tweens.combat = new Tween(Tween.QuadOut, { x: this.x, y: this.y }, { x: p.x, y: p.y }, delay, time);
		
		this.tweens.combat.on('change', function (v) {
			self.x = v.x;
			self.y = v.y;
		});

		this.tweens.combat.on('finish', function () {
			// if enemy is dead, step on it
			if (moveAfterKilling && enemy.dead) {
				// liberate tile at ent pos
				parent.tiles[self.layer][self.gridy][self.gridx] = null;
				self.locate(enemy.gridx, enemy.gridy, enemy.layer);
				// check destination tile
				self.endMoving();
				// end combat
				self.fighting = false;

			// if not, return to original position
			} else {
				self.tweens.combat = new Tween(Tween.QuadInOut, { x: self.x, y: self.y }, { x: p2.x, y: p2.y }, 0, time);
				self.tweens.combat.on('change', function (v) {
					self.x = v.x;
					self.y = v.y;
				});
				self.tweens.combat.on('finish', function () {});
				self.tweens.combat.start();
			}
		});

		this.tweens.combat.start();

		return dice;
	};


	this.takeDamage = function (enemy, delay) {
		// damage is attacker total damage - defender total armor
		var dice = utils.randomInt(1, 4);
		var damage = Math.max(enemy.stats.damage - this.stats.armor + dice, 0);
		this.stats.hp = Math.max(this.stats.hp - damage, 0);

		// log damage
		if (enemy === parent.hero) {
			ui.console.log('You hit the ' + utils.wordifyCamelCase(self.tileset.id) + ' for ' + damage + ' dmg.');
		} else {
			ui.console.log('The ' + utils.wordifyCamelCase(enemy.tileset.id) + ' hits you for ' + damage + ' dmg.');
		}
		
		// create damage label
		this.hpBar.active = true;
		this.createInfoLabel(this, damage, 'red', delay + twTime * 0.5);
		
		// check for death and escape if so
		if (this.stats.hp <= 0) {
			this.death(enemy, delay);
			return;
		}

		// get damage displacement point
		var dist = utils.getDistance(this, enemy);
		var a = (enemy.x - this.x);
		var b = (enemy.y - this.y);
		var dx = 27 * a / dist;
		var dy = 27 * b / dist;
		var p = { x: this.x - dx * 0.5, y: this.y - dy * 0.5 };

		// damage animation
		this.tweens.combat = new Tween(Tween.QuadOut, { x: this.x, y: this.y }, { x: p.x, y: p.y }, delay, twTime * 0.5);
		this.tweens.combat.on('change', function (v) {
			self.x = v.x;
			self.y = v.y;
		});
		this.tweens.combat.on('finish', function () {});
		this.tweens.combat.start();

		if (this.dead) { return; }

		// after damage animation
		this.tweens.combat2 = new Tween(Tween.QuadInOut, { x: p.x, y: p.y }, { x: this.x, y: this.y }, delay + twTime * 0.5, twTime * 0.5);
		this.tweens.combat2.on('change', function (v) {
			self.x = v.x;
			self.y = v.y;
			
		});
		this.tweens.combat2.on('finish', function () {});
		this.tweens.combat2.start();
	};



	this.death = function (enemy, delay) {
		// set dead flag to avoid future actions
		this.dead = true;

		// log death
		if (enemy) {
			if (self === parent.hero) {
				ui.console.log('The ' + utils.wordifyCamelCase(enemy.tileset.id) + ' kills you!');
				ui.console.log('You die...');
			} else {
				ui.console.log('You kill the ' + utils.wordifyCamelCase(self.tileset.id) + '!');
			}
		}
		
		// get death displacement point
		var p;
		if (enemy) {
			var dist = utils.getDistance(this, enemy);
			var a = (enemy.x - this.x);
			var b = (enemy.y - this.y);
			var dx = 27 * a / dist;
			var dy = 27 * b / dist;
			p = { x: this.x - dx * 0.5, y: this.y - dy * 0.5 };
		} else {
			p = { x: this.x, y: this.y };
		}
		
		// death animation
		this.tweens.combat = new Tween(Tween.QuadOut, { x: this.x, y: this.y, alpha: 1 }, { x: p.x, y: p.y, alpha: 0 }, delay, twTime * 0.5);
		this.tweens.combat.on('change', function (v) {
			self.x = v.x;
			self.y = v.y;
			self.alpha = v.alpha;
		});

		this.tweens.combat.on('finish', function () {
			// destroy ent and liberate tile at ent pos
			parent.tiles[self.layer][self.gridy][self.gridx] = null;
			self.destroy();

			// tell floor tile to be stained
			var floorTile = parent.getTile(self.gridx, self.gridy, 'floors');
			floorTile.stained = utils.randomInt(0, 5);

			// if there was an attacker, tell him to increase his xp
			if (enemy) {
				enemy.increaseXp(utils.randomInt(1, 5) * enemy.stats.level);
			}
		});

		this.tweens.combat.start();
	};


	// -------------------------------------------------
	// In-Game Ent Interfaces
	// -------------------------------------------------


	this.createInfoLabel = function (tile, caption, color, delay, time, dy) {
		// default props
		delay = delay || 0;
		time = time || twTime * 6;
		dy = dy || 60;

		// create damage label
		var label = parent.appendChild(new Sprite());
		var x = tile.x + window.tileSize;
		var y = tile.hpBar && tile.hpBar.active ? tile.y + 8 : tile.y + 16;
		label.x = x;
		label.y = y;
		label.alpha = 0;
		label.zIndex = 20000;
		label.tweens = {};

		label.tweens.move = new Tween(Tween.QuadInOut, { y: y, alpha: 1 }, { y: y - dy, alpha: 0 }, delay, time);
		label.tweens.move.on('change', function (v) {
			label.y = v.y;
			label.alpha = v.alpha;
		});
		label.tweens.move.on('finish', function () { label.destroy(); });
		label.tweens.move.start();

		label.setRenderMethod(function (context) {
			// update tweens
			for (var i in label.tweens) {
				label.tweens[i].update();
			}

			// render text
			context.save();
			context.shadowColor = '#000';
			context.shadowOffsetX = 1;
			context.shadowOffsetY = 1;
			context.shadowBlur = 2;
			context.font = 'bold 7pt Verdana';
			context.textAlign = 'center';
			context.fillStyle = color || '#666';
			context.fillText(caption, 0, 0);
			context.restore();
		});
	};


	this.createHpBar = function () {
		// create hp bar
		this.hpBar = this.appendChild(new Sprite());
		this.hpBar.x = tileSize * 0.675;
		this.hpBar.y = 5;//10;
		this.hpBar.width = tileSize * 0.75;
		this.hpBar.height = 3;
		this.hpBar.tweens = {};

		this.hpBar.active = false;

		this.hpBar.setRenderMethod(function (context) {
			if (!context) { return; }
			if (self.stats.hp === self.stats.hpMax) {
				self.hpBar.active = false;
				return;
			} else {
				self.hpBar.active = true;
			}

			context.save();
			context.fillStyle = 'black';
			context.fillRect(0, 0, this.width, this.height);
			if (self.stats.hp > self.stats.hpMax / 2) {
				context.fillStyle = 'green';
			} else if (self.stats.hp > self.stats.hpMax / 3) {
				context.fillStyle = '#f90';
			} else {
				context.fillStyle = 'red';
			}
			var w = this.width * self.stats.hp / self.stats.hpMax;
			context.fillRect(0, 0, w, this.height);
			context.restore();
		});
	};

	// -------------------------------------------------
	// Stats Management
	// -------------------------------------------------

	// -------------------
	// Xp

	this.increaseXp = function (xp) {
		this.stats.xp += xp;
		this.createInfoLabel(this, 'XP+' + xp, 'yellow', twTime);

		var excess = this.stats.xp - this.stats.xpMax;
		if (excess > 0) {
			// update level
			this.stats.level++;
			this.stats.xp = excess;
			// update stats
			this.stats.xpMax *= 2;
			this.stats.hpMax += utils.randomInt(5, 10);
			this.stats.hp = this.stats.hpMax;

			// display level-up message
			this.createInfoLabel(this, 'LEVEL UP', 'yellow', twTime * 2.5);
		}
	};


	// -------------------
	// Hunger
	// TODO: refactor naming to mean something like 'update stats every turn'


	var hungerWarnings = {
		hungry: false,
		starving: false
	};

	this.applyHunger = function (factor) {
		// update turns
		this.turns++;

		// regenerate life (hp)
		this.stats.hp += this.stats.regeneration * 1;
		if (this.stats.hp > this.stats.hpMax) {
			this.stats.hp = this.stats.hpMax;
		}

		// update hunger (mp)
		this.stats.mp -= this.stats.hunger * (factor || 1);

		// warnings
		if (this.stats.mp < 10 && !hungerWarnings.hungry) {
			// hungry warning
			ui.console.log('You are getting hungry...');
			hungerWarnings.hungry = true;
		} else if (this.stats.mp < 5 && !hungerWarnings.starving) {
			// starving warning
			ui.console.log('You are starving...');
			hungerWarnings.starving = true;
		} else if (this.stats.mp <= 0) {
			// die of starvation
			ui.console.log('You starved to death...');
			this.death(null, 0);
		}
	};


	// -------------------
	// Wait

	this.wait = function (time, cb) {
		this.tweens.wait = new Tween(Tween.Linear, { t: 0 }, { t: time }, 0, time);
		this.tweens.wait.on('finish', function () {
			if (cb) { cb(); }
		});

		this.tweens.wait.start();
	};

}

inherit(Ent, Tile);
module.exports = Ent;