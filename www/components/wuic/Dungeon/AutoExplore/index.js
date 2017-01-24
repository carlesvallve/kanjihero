// ///////////////////////////////////////////////////////
// -------------------------------------------------------
// AutoExplore -> Goes to best suited unexplored tile
// -------------------------------------------------------
// ///////////////////////////////////////////////////////

function AutoExplore() { // dungeon

	var Tiles = window.Tiles;

	// TODO: Implement this or similar on Ent/Hero class
	this.autoExplore = function () {
		// choose nearest unexplored tile
		var goalTile = parent.getNearestUnexploredTile();
		
		if (goalTile) {
			goalTile.hasBeenSeen = true;
			goalTile.canBeenSeen = true;
			console.log('autoExplore to', goalTile.gridx, goalTile.gridy);
			this.findPath(goalTile);
		} else {
			console.log('autoExplore: no tile found!');
		}
	};
		

	// TODO: doesnt work yet... find the reason and fix it!
	this.getNearestUnexploredTile = function () {
		var center = { x: this.hero.gridx, y: this.hero.gridy };
		var d = 0;
		var tile;

		console.log(this.tiles);
		var tiles = this.tiles.floors;

		var c = 0;
		while (!tile) {
			d++;
			var x1 = Math.min(0, center.x - d);
			var y1 = Math.min(0, center.y - d);
			var x2 = Math.max(tiles[0].length - 1, center.x + d);
			var y2 = Math.max(tiles.length - 1, center.y + d);
			for (var y = y1; y <= y2; y++) {
				//console.log(c);
				if (c >= tiles.length * tiles[0].length) { break; }

				for (var x = x1; x <= x2; x++) {
					c++;
					//console.log(c, '/', tiles.length * tiles[0].length);
					if (c >= tiles.length * tiles[0].length) { break; }

					var temp = this.getTile(x, y);

					if (!temp) { continue; }
					if (temp.hasBeenSeen) { continue; }

					//if (temp.type !== Tiles.Floor || temp.type !== Tiles.Item) { continue; }

					console.log(temp.type, temp.gridx, temp.gridy);
					if (temp.type === Tiles.Floor) {
						temp.hasBeenSeen = true;
						temp.canBeSeen = true;
						return temp;
					}
					
				}

			}

			tile = this.stairsUp;
		}

		return tile;
	};


	// TODO: Doesnt work either...
	/*this.getNearestUnexploredTile2 = function () {
		var tiles = this.tiles.floors;

		var distMax = 1000;

		var selectedTile = null;

		for (var y = 0; y < tiles.length; y++) {
			for (var x = 0; x < tiles[0].length; x++) {
				var tile = this.getTile(x, y);
				if (!tile) { continue; }
				if (tile.hasBeenSeen) { continue; }

				var dist = utils.getDistance(this, tile);
				if (dist < distMax) { 
					distMax = dist; 
					selectedTile = tile;
				}
			}
		}

		return selectedTile;
	}*/

}

module.exports = AutoExplore;







