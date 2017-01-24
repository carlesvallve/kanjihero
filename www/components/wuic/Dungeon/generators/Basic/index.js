var inherit = require('inherit');
var Dungeon = require('Dungeon');
var Tile = require('Tile');


/**
 * @class
 * @classDesc Basic dungeon with only one room with borders and random walls
 */
function Basic(parent, width, height) {
	Dungeon.call(this, parent, width, height);

	// get globals
	var Tiles = window.Tiles;
	console.log('generating Basic dungeon level...', width, height);


	this.generate = function () {
		// create random tiles
		for (var layer in this.tiles) {
			for (var y = 0; y < this.mapW; y++) {
				this.tiles[layer][y] = new Array(this.mapW);
				
				for (var x = 0; x < this.mapW; x++) {
					//bottom layer: floors
					if (layer === 'floors') {
						this.tiles[layer][y][x] = new Tile(x, y, Tiles.Floor);
					}
					//medium layer: walls
					if (layer === 'walls') {
						//border walls
						if (x === 0 || y === 0 || x === this.mapW - 1 || y === this.mapH - 1) {
							this.tiles[layer][y][x] = new Tile(x, y, Tiles.Wall);
						}
						//random walls
						var r = Math.rand(0, 100);
						if (r < 15) { this.tiles[layer][y][x] = new Tile(x, y, Tiles.Wall); }
					}
				}
			}

		}

		//create stairs
		this.stairsUp = this.createStairs(Tiles.StairsUp);
		this.stairsDown = this.createStairs(Tiles.StairsDown);
	};

}

inherit(Basic, Dungeon);
module.exports = Basic;