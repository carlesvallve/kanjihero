var inherit = require('inherit');
var utils = require('utils');
var Dungeon = require('Dungeon');
var Tile = require('Tile');

// bps render options
window.drawBspRect = false;
window.drawBspTile = true;
window.drawRoomNumber = true;


// -------------------------------------------------
// BspNode
// -------------------------------------------------
/**
 * @class
 * @classDesc bspNode object for procedural dungeon level generation
 */
function BspNode(bsp, parentNode, level, id, rect, color) {

	// get globals
	var bspTileSize = 8;

	// init vars
	this.nodes = [];     // list of the 2 main subnodes contained in this node
	this.subnodes = [];  // list of all children subnodes contained in this node
	this.nodeRooms = []; // list of all children rooms contained in this node

	this.parentNode = parentNode;
	this.bspLevel = level;
	this.id = id;
	this.rect = rect;
	this.color = color;

	// draw this bsp node
	if (window.drawBspRect) { this.drawRect(); }

	// update maxlevels
	if (this.bspLevel >= bsp.maxlevels) {
		bsp.maxlevels = this.bspLevel;
	}

	// if half max is smaller than minimum room size, don't create subnodes and escape.
	var halfW = Math.floor(this.rect.width / 2 * bsp.definition);
	var halfH = Math.floor(this.rect.height / 2 * bsp.definition);
	if (halfW < bsp.minRoomSize && halfH < bsp.minRoomSize) {
		bsp.leaves.push(this);
		return;
	}


	this.splitNode = function () {
		// get random direction and position
		var position = this.getRandomPosition();

		// get splitted rect
		switch (this.direction) {
			case "horizontal":
				var r1 = new utils.Rectangle(this.rect.x, this.rect.y, position, this.rect.height);
				var r2 = new utils.Rectangle(this.rect.x + position, this.rect.y, this.rect.width - position, this.rect.height);
				break;
			case "vertical":
				r1 = new utils.Rectangle(this.rect.x, this.rect.y, this.rect.width, position);
				r2 = new utils.Rectangle(this.rect.x, this.rect.y + position, this.rect.width, this.rect.height - position);
				break;
		}

		// create the 2 sub-nodes
		var color = utils.randomColor();
		this.nodes = [];
		this.nodes[0] = new BspNode(bsp, this, this.bspLevel + 1, 0, r1, color);
		this.subnodes.push(this.nodes[0]);
		this.nodes[1] = new BspNode(bsp, this, this.bspLevel + 1, 1, r2, color);
		this.subnodes.push(this.nodes[1]);
	};


	this.getRandomDirection = function () {
		// get random direction (horizontal or vertical partition)
		var r = Math.rand(0, 2); //0+int(Math.random()*2);
		if (r === 0) {
			this.direction = "horizontal";
		} else {
			this.direction = "vertical";
		}

		// get max (node width or height)
		var max;
		if (this.direction === "horizontal") {
			max = this.rect.width;
		} else {
			max = this.rect.height;
		}

		return max;
	};


	this.getRandomPosition = function () {
		var ok = false;
		var position;
		while (ok === false) {
			var max = this.getRandomDirection();
			var start = bsp.range[0] * max;
			var end = bsp.range[1] * max;
			position = start + Math.rand(0, end - start);//int(Math.random()*(end-start));
			ok = true;
			if (position < bsp.minRoomSize) { ok = false; }
			if (position > max - bsp.minRoomSize) { ok = false; }
		}

		return position;
	};


	// draws the bps node rect
	this.drawRect = function () {
		var context = bsp.context;

		var x = this.rect.x * bspTileSize + 1;
		var y = this.rect.y * bspTileSize + 1;
		context.fillStyle = this.color;
		context.globalAlpha = 0.5;
		context.fillRect(x, y, this.rect.width * bspTileSize - 2, this.rect.height * bspTileSize - 2);
	};


	// split the node into 2 sub-nodes.
	this.splitNode();
}

module.exports = BspNode;


// -------------------------------------------------
// BspTile
// -------------------------------------------------
/**
 * @class
 * @classDesc BspTile holds info while generatin bsp dungeons
 */
function BspTile(x, y, type, direction, room) {
	// set tile vars
	this.x = x;
	this.y = y;
	this.type = type;
	this.direction = direction;
	this.room = room;


	this.setType = function (type, direction, room) {
		this.type = type;
		this.direction = direction;
		this.room = room;
	};

	// set bps tile type
	this.setType(type, direction);
}

module.exports = BspTile;


// -------------------------------------------------
// Corridor
// -------------------------------------------------
/**
 * @class
 * @classDesc Corridor object for bsp procedural dungeon level generation
 */
function Corridor(bsp, room1, room2) { // , colortemp
	var Tiles = window.Tiles;

	// init vars
	this.tiles = [];

	this.setCorridorTiles = function (startx, starty, endx, endy) {
		// draw always form left to right, top to bottom
		var temp;
		if (startx > endx) { temp = endx; endx = startx; startx = temp; }
		if (starty > endy) { temp = endy; endy = starty; starty = temp; }

		// get direction
		var direction;
		if (starty === endy) {
			direction = "horizontal";
		} else {
			direction = "vertical";
		}

		// draw corridor
		for (var x = startx; x <= endx; x++) {
			for (var y = starty; y <= endy; y++) {
				bsp.tiles[x][y].setType(Tiles.Corridor, direction);
				this.tiles.push(bsp.tiles[x][y]);
			}
		}
	};


	// get center of both rooms
	var c1 = utils.Point(room1.rect.x + Math.floor(room1.rect.width / 2), room1.rect.y + Math.floor(room1.rect.height / 2));
	var c2 = utils.Point(room2.rect.x + Math.floor(room2.rect.width / 2), room2.rect.y + Math.floor(room2.rect.height / 2));

	//get random dir
	var dir = Math.floor(Math.random() * 2);

	// get middle point (where it should change direction)
	var c;
	if (dir === 0) {
		c = utils.Point(c2.x, c1.y);
	} else {
		c = utils.Point(c1.x, c2.y);
	}

	// draw tiles form room1 to middle point
	this.setCorridorTiles(c1.x, c1.y, c.x, c.y);

	// draw tiles form middle point to room2
	this.setCorridorTiles(c.x, c.y, c2.x, c2.y);

	// link rooms with each other
	room1.addLink(room2);
	room2.addLink(room1);
}

module.exports = Corridor;


// -------------------------------------------------
// BspRoom
// -------------------------------------------------
/**
 * @class
 * @classDesc Room object for bsp procedural dungeon level generation
 */
function BspRoom(bsp, node, num) {

	// get globals
	var Tiles = window.Tiles;

	// init vars
	this.node = node;
	this.num = num;
	this.tiles = [];
	this.links = [];

	// get room min size
	var minW = bsp.minRoomSize;
	if (minW > this.node.rect.width) {minW = this.node.rect.width; }
	var minH = bsp.minRoomSize;
	if (minH > this.node.rect.height) {minH = this.node.rect.height; }

	// get a random rect inside the bsp node
	var x = Math.floor(Math.random() * (this.node.rect.width - minW));
	var y = Math.floor(Math.random() * (this.node.rect.height - minH));
	var w = minW + Math.floor(Math.random() * (this.node.rect.width - x - minW));
	if (w > this.node.rect.width) { w = this.node.rect.width; }
	var h = minH + Math.floor(Math.random() * (this.node.rect.height - y - minH));
	if (h > this.node.rect.height) { h = this.node.rect.height; }
	x += this.node.rect.x;
	y += this.node.rect.y;
	// % prob that room fills the entire bsp area
	var r = Math.random();
	if (r > bsp.roomRange[1]) {
		x = this.node.rect.x;
		y = this.node.rect.y;
		w = this.node.rect.width;
		h = this.node.rect.height;
	}
	// record room final rect
	this.rect = new utils.Rectangle(x, y, w, h);


	// set room tiles to 'floor' type
	this.setRoomTiles = function (rect) {
		// init vars
		var xx = rect.x, yy = rect.y, w = rect.width, h = rect.height;
		// create floor tiles
		this.tiles = [];
		for (var x = xx; x < xx + w; x++) {
			for (var y = yy;y < yy + h; y++) {
				var tile = bsp.tiles[x][y];
				if (tile) {
					tile.setType(Tiles.Floor);
					tile.room = this;
					this.tiles.push(tile);
				}
			}
		}
	};
	// set room tiles
	this.setRoomTiles(this.rect);


	// link with given room (add given room to links list)
	this.addLink = function (room) {
		for (var n in this.links) {
			if (this.links[n] === room) { return; }
		}
		this.links.push(room);
	};


	// check if this room is linked with another room
	this.isLinked = function (room) {
		for (var n in this.links) {
			if (this.links[n] === room) { return true; }
		}
		return false;
	};
}

module.exports = BspRoom;

// -------------------------------------------------
// Bsp
// -------------------------------------------------
/**
 * @class
 * @classDesc bsp algorithm for bsp based procedural dungeon level generation
 */
function Bsp(parent, width, height) {
	Dungeon.call(this, parent, width, height);

	// get globals
	var Tiles = window.Tiles;

	//init vars
    this.range = [0.1, 0.9];     // randomness factor when splitting bsp node [0 to 1].
    this.definition = 0.5;       // bsp definition (higher -> more bsp levels -> smaller rooms).
    this.minRoomSize = 3;        // minimum side size of the rooms.
    this.roomRange = [0.3, 1.0]; // prob of [noRoom, fillRoom]
    this.maxlevels = 0;
    this.leaves = [];
    this.bspRooms = [];
    this.corridors = [];
    this.doors = [];
    this.rootNode = null;


    this.generate = function () {
		// init vars
		this.tiles = [];
		this.leaves = [];
		this.bspRooms = [];
		this.corridors = [];
		this.doors = [];
		
		// init empty tiles
		this.createBspTiles();

		// init bsp tree
		this.rootNode = new BspNode(this, this, 0, 0,
			new utils.Rectangle(1, 1, this.mapW - 2, this.mapH - 2),
			utils.randomColor()
		);

		// make rooms at bsp last level (leaves)
		this.makeRooms(this.leaves);

		// fill each node with a list of the rooms that contains
		var nodes = this.leaves;
		for (var n = this.maxlevels; n > 0; n--) {
			nodes = this.getRoomsInNodes(nodes);
			if (nodes === null) { break; }
		}

		// make corridors (from leaves to main level)
		nodes = this.leaves;
		for (n = this.maxlevels; n > 0; n--) {
			nodes = this.makeCorridors(nodes);
			if (nodes === null) { break; }
		}
		this.makeCorridorPath();
		
		// adjust rooms to corridors
		this.adjustRooms();

		// make walls around not 'rock' areas
		this.makeWalls();

		// make doors in room entrances
		this.makeDoors();

		// make room labels
		//this.labelRooms();

		// convert bsp tiles to normal map tiles
		this.convertToMapTiles();

		// make up and down stairs
		//this.stairsUp = this.createStairs(Tiles.StairsUp);
		//this.stairsDown = this.createStairs(Tiles.StairsDown);
	};


	// initialize all bsp tiles to blank
	this.createBspTiles = function () {
		this.tiles = [];
		for (var x = 0; x < this.mapW; x++) {
			this.tiles.push([]);
			for (var y = 0; y < this.mapH; y++) {
				this.tiles[x].push(new BspTile(x, y, Tiles.Blank));
			}
		}
	};

	
	// Create a room inside each leaf node.
	this.makeRooms = function (nodes) {
		for (var n in nodes) {
			// if % prob of no room, ecape too.
			var r = Math.random();
			if (r > this.roomRange[0]) {
				nodes[n].room = new BspRoom(this, nodes[n], this.bspRooms.length, this.colorRoom);
				nodes[n].nodeRooms.push(nodes[n].room);
				this.bspRooms.push(nodes[n].room);
			}
		}
		// if no rooms where created, try again
		if (this.bspRooms.length === 0) { this.makeRooms(nodes); }
	};


	// adjust rooms to fit corridors after these where created
	this.adjustRooms = function () {
		for (var r in this.bspRooms) {
			//adjust to corridors (convert corridor types to floors)
			for (var t in this.bspRooms[r].tiles) {
				var tile = this.bspRooms[r].tiles[t];
				if (tile.type === Tiles.Corridor) {
					tile.setType(Tiles.Floor);
					tile.room = this.bspRooms[r];
				}
			}
		}
	};


	// Get all parent nodes in nodelist. Used to traverse from leaves to trunk.
	this.getParentNodes = function (nodes) {
		var pnodes = [];
		for (var n in nodes) {
			var node = nodes[n].parentNode;
			if (node.bspLevel === 0) { return null; } // if (String(node) === "[object BSPGenerator]")
			var ok = true;
			for (var i in pnodes) {
				if (node === pnodes[i]) {
					ok = false;
					break;
				}
			}
			if (ok) { pnodes.push(node); }
		}

		return pnodes;
	};


	// Get all rooms contained in a bsp node and his sub-nodes.
	this.getRoomsInNodes = function (nodes) {
		nodes = this.getParentNodes(nodes);
		if (nodes === null) { return null; }
		for (var n in nodes) {
			var node = nodes[n];
			for (var i in node.subnodes) {
				for (var r = 0; r < node.subnodes[i].nodeRooms.length; r++) {
					node.nodeRooms.push(node.subnodes[i].nodeRooms[r]);
				}
			}
		}

		return nodes;
	};


	// Create corridors traversing all levels from leaves to trunk.
	this.makeCorridors = function (nodes) {
		nodes = this.getParentNodes(nodes); // get current level parent nodes
		if (nodes === null) { return null; }
		for (var n in nodes) {
			var node = nodes[n];
			// get rooms
			var room1 = node.nodes[0].nodeRooms[Math.floor(Math.random() * node.nodes[0].nodeRooms.length)];
			var room2 = node.nodes[1].nodeRooms[Math.floor(Math.random() * node.nodes[1].nodeRooms.length)];
			//if we founded the rooms, and where not already linked, link them with a corridor
			if (room1 && room2) {
				if (!room1.isLinked(room2) && !room2.isLinked(room1)) {
					this.corridors.push(new Corridor(this, room1, room2));
				}
			}
		}

		// return updated parent nodes
		return nodes;
	};


	// after that, link rooms form first to last in a snake-like corridor to evite unlinked rooms.
	this.makeCorridorPath = function () {
		//make corridors from first to last room
		if (this.bspRooms.length > 1) {
			for (var n = 0; n < this.bspRooms.length - 1; n++) {
				var room1 = this.bspRooms[n];
				var room2 = this.bspRooms[n + 1];
				if (!room1.isLinked(room2) && !room2.isLinked(room1)) {
					this.corridors.push(new Corridor(this, room1, room2));
				}
			}
			// link last room with another at random
			this.corridors.push(new Corridor(this, this.bspRooms[n], this.bspRooms[Math.floor(Math.random() * this.bspRooms.length)]));
		}
	};


	// create walls around all tiles that are not 'rock'.
	this.makeWalls = function () {
		for (var x = 1; x < this.mapW - 1; x++) {
			for (var y = 1; y < this.mapH - 1; y++) {
				if (this.tiles[x][y]) {
					if (this.tiles[x][y].type === Tiles.Floor || this.tiles[x][y].type === Tiles.Corridor) {
						if (this.tiles[x][y - 1].type === Tiles.Blank) { this.tiles[x][y - 1].setType(Tiles.Wall); }
						if (this.tiles[x][y + 1].type === Tiles.Blank) { this.tiles[x][y + 1].setType(Tiles.Wall); }
						if (this.tiles[x - 1][y].type === Tiles.Blank) { this.tiles[x - 1][y].setType(Tiles.Wall); }
						if (this.tiles[x + 1][y].type === Tiles.Blank) { this.tiles[x + 1][y].setType(Tiles.Wall); }

						if (this.tiles[x + 1][y + 1].type === Tiles.Blank) { this.tiles[x + 1][y + 1].setType(Tiles.Wall); }
						if (this.tiles[x - 1][y + 1].type === Tiles.Blank) { this.tiles[x - 1][y + 1].setType(Tiles.Wall); }
						if (this.tiles[x + 1][y - 1].type === Tiles.Blank) { this.tiles[x + 1][y - 1].setType(Tiles.Wall); }
						if (this.tiles[x - 1][y - 1].type === Tiles.Blank) { this.tiles[x - 1][y - 1].setType(Tiles.Wall); }
					}
				}
			}
		}
	};


	// create doors at room entrances
	this.makeDoors = function () {
		for (var c in this.corridors) {

			for (var t in this.corridors[c].tiles) {
				var tile = this.corridors[c].tiles[t], x = tile.x, y = tile.y;

				if (this.tiles[x][y]) {
					if (tile.type === Tiles.Corridor) {
						var dir = null;

						if (this.tiles[x - 1][y].type === Tiles.Wall && this.tiles[x + 1][y].type === Tiles.Wall) { // vertical
							if (this.tiles[x][y - 1].type === Tiles.Corridor && this.tiles[x][y + 1].type === Tiles.Floor) { dir = 'vertical'; } // vertical
							if (this.tiles[x][y - 1].type === Tiles.Floor && this.tiles[x][y + 1].type === Tiles.Corridor) { dir = 'vertical'; } // vertical
							if (this.tiles[x][y - 1].type === Tiles.Floor && this.tiles[x][y + 1].type === Tiles.Floor) { dir = 'vertical'; } // vertical
						}
						if (this.tiles[x][y - 1].type === Tiles.Wall && this.tiles[x][y + 1].type === Tiles.Wall) {
							if (this.tiles[x - 1][y].type === Tiles.Corridor && this.tiles[x + 1][y].type === Tiles.Floor) { dir = 'horizontal'; }
							if (this.tiles[x - 1][y].type === Tiles.Floor && this.tiles[x + 1][y].type === Tiles.Corridor) { dir = 'horizontal'; }
							if (this.tiles[x - 1][y].type === Tiles.Floor && this.tiles[x + 1][y].type === Tiles.Floor) { dir = 'horizontal'; }
						}
						if (dir) {
							this.tiles[x][y].setType(Tiles.Door, dir);
							this.doors.push(this.tiles[x][y]);
						}
					}
				}
			}
		}
	};


	//convert bsp format to map format
	this.convertToMapTiles = function () {
		// record bsp array
		this.bspTiles = this.tiles;

		// generate empty array of tiles (layer, and y)
		var x, y;
		this.tiles = { floors: [], items: [], walls: [], overlay: [] };
		for (var layer in this.tiles) {
			this.tiles[layer] = [];
			for (y = 0; y < this.mapH; y++) {
				this.tiles[layer][y] = [];
			}
		}
		
		// fill map array with bsp array values
		for (y = 0; y < this.mapH; y++) {
			for (x = 0; x < this.mapW; x++) {
				// get bsp tile type
				var bspTile = this.bspTiles[x][y];
				var type = bspTile.type;

				if (type === Tiles.Blank) { continue; }

				// convert corridors into simple floors
				if (type === Tiles.Corridor) {  type = Tiles.Floor; }

				// create current tile
				var tile = new Tile(x, y, type, bspTile.direction, null);
				this.tiles[tile.layer][y][x] = tile;

				// if current tile requires it, create also a floor tile
				if (tile.layer !== 'floors') {
					this.tiles.floors[y][x] = new Tile(x, y, Tiles.Floor, bspTile.direction, null);
				}

				// if tile is a door, also create DoorOver half tile in the overlay layer
				if (type === Tiles.Door) {
					this.tiles.overlay[y][x] = new Tile(x, y, Tiles.DoorOver, bspTile.direction, null);
				}
			}
		}
	};

}

inherit(Bsp, Dungeon);
module.exports = Bsp;