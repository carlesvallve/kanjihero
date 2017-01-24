// -------------------------------------------------------
// Fov Helpers
// -------------------------------------------------------

/** Helper methods for calculating distance between 2 points */

function getDistance(p1, p2) {
	var a = Math.abs(p2.x - p1.x);
	var b = Math.abs(p2.y - p1.y);
	var d = Math.sqrt(a * a + b * b);
	return d;
}

/** Helper methods for points. */

function Pt(x, y) { this.x = x; this.y = y; }
Pt.prototype.toString = function () { return '(' + this.x + ',' + this.y + ')'; };
Pt.prototype.copy = function () { return new Pt(this.x, this.y); };

/** Helper methods for lines. */

function Ln(p, q) { this.p = p; this.q = q; }
Ln.prototype.toString = function () { return this.p + '-' + this.q; };
Ln.prototype.copy = function () { return new Ln(this.p.copy(), this.q.copy()); };
Ln.prototype.cw = function (pt) { return this.dtheta(pt) > 0; };
Ln.prototype.ccw = function (pt) { return this.dtheta(pt) < 0; };
Ln.prototype.dtheta = function (pt) {
	var theta = Math.atan2(this.q.y - this.p.y, this.q.x - this.p.x),
		other = Math.atan2(pt.y - this.p.y, pt.x - this.p.x),
		dt = other - theta;
	return ((dt > -Math.PI) ? dt : (dt + 2 * Math.PI)).toFixed(5);
};

/** Helper methods for arcs. */

function Arc(steep, shallow) {
	this.steep = steep;
	this.shallow = shallow;
	this.steepbumps = [];
	this.shallowbumps = [];
}

Arc.prototype.toString = function () {
	return '[' + this.steep + ' : ' + this.shallow + ']';
};

Arc.prototype.copy = function () {
	var c = new Arc(this.steep.copy(), this.shallow.copy());
	var i;
	for (i in this.steepbumps) {
		c.steepbumps.push(this.steepbumps[i].copy());
	}
	for (i in this.shallowbumps) {
		c.shallowbumps.push(this.shallowbumps[i].copy());
	}
	return c;
};

Arc.prototype.hits = function (pt) {
	return (this.steep.ccw(new Pt(pt.x + 1, pt.y)) &&
		this.shallow.cw(new Pt(pt.x, pt.y + 1)));
};

/** Bump this arc clockwise (a steep bump). */

Arc.prototype.bumpCW = function (pt) {
	// Steep bump.
	var sb = new Pt(pt.x + 1, pt.y);
	this.steepbumps.push(sb);
	this.steep.q = sb;
	for (var i in this.shallowbumps) {
		var b = this.shallowbumps[i];
		if (this.steep.cw(b)) { this.steep.p = b; }
	}
};

/** Bump this arc counterclockwise (a shallow bump). */

Arc.prototype.bumpCCW = function (pt) {
	var sb = new Pt(pt.x, pt.y + 1);
	this.shallowbumps.push(sb);
	this.shallow.q = sb;
	for (var i in this.steepbumps) {
		var b = this.steepbumps[i];
		if (this.shallow.ccw(b)) { this.shallow.p = b; }
	}
};

Arc.prototype.shade = function (pt) {
	var steepBlock = this.steep.cw(new Pt(pt.x, pt.y + 1)),
		shallowBlock = this.shallow.ccw(new Pt(pt.x + 1, pt.y));
	if (steepBlock && shallowBlock) {
		// Completely blocks this arc.
		return [];
	} else if (steepBlock) {
		// Steep bump.
		this.bumpCW(pt);
		return [this];
	} else if (shallowBlock) {
		// Shallow bump.
		this.bumpCCW(pt);
		return [this];
	} else {
		// Splits this arc in twain.
		var a = this.copy();
		var b = this.copy();
		a.bumpCW(pt);
		b.bumpCCW(pt);
		return [a, b];
	}
};

/** Helper methods for a collection of arcs covering a quadrant. */

function Light(radius) {
	var wide = new Arc(
		new Ln(new Pt(1, 0), new Pt(0, radius)),
		new Ln(new Pt(0, 1), new Pt(radius, 0)));
	this.arcs = [wide];
}

Light.prototype.hits = function (pt) {
	for (var i in this.arcs) {
		// Cannot just return i, in case it's zero.
		if (this.arcs[i].hits(pt)) { return { i: i }; }
	}
	return false;
};

Light.prototype.shade = function (arci, pt) {
	var arc = this.arcs[arci.i],
		splice = this.arcs.splice;
	// Shade the arc with this point, replace it with new arcs (or none).
	//var sh = arc.shade(pt);
	splice.apply(this.arcs, [arci.i, 1].concat(arc.shade(pt)));
	return this.arcs.length > 0;
};


// ///////////////////////////////////////////////////////
// -------------------------------------------------------
// Fov -> Calculates lines of sight from pos inside radius
// -------------------------------------------------------
// ///////////////////////////////////////////////////////

function Fov(dungeon) {

	// init vars
	var Tiles = window.Tiles;
	var useGradientLight = true; // true -> gradient intensity, false -> fixed intensity
	var minIntensity = 0.3; // -> darkness of the darkest tile affected by light


	// This is all we have to call each time we move an entity to a new cell
	// passing the ent grid position, maximum cells of visibility, 
	// and a boolean defining if we want or not to render the outcome

	this.updateFov = function (pos, radius, render, tileBecameVisibleCb) {
		var tiles = this.fieldOfView(pos.x, pos.y, radius, this.visitTile, this.blockTile);
		if (render) {
			this.renderFov(pos, radius, tiles, tileBecameVisibleCb);
		}
		return tiles;
	};


	// Sets all tiles in map to not visible, mantaining the visited states

	this.resetFov = function (pos, radius) {
		// get tiles around given coords (tiles in visor)
		var minX = pos.x - (radius + 1);
		if (minX < 0) { minX = 0; }
		var minY = pos.y - (radius + 1);
		if (minY < 0) { minY = 0; }
		var maxX = pos.x + (radius + 1);
		if (maxX > dungeon.mapW - 1) { maxX = dungeon.mapW - 1; }
		var maxY = pos.y + (radius + 1);
		if (maxY > dungeon.mapH - 1) { maxY = dungeon.mapH - 1; }

		// reset visibility of all tiles
		for (var layer in dungeon.tiles) {
			for (var y = minY; y < maxY; y++) {
				for (var x = minX; x < maxX; x++) {
					var tile = dungeon.getTile(x, y, layer);
					if (tile) {
						if (tile.type !== Tiles.Blank) {
							tile.canBeSeen = false;
							tile.lightIntensity = minIntensity;
						}
					}
				}
			}
		}
	};


	// sets canBeSeen and hasBeenSeen of all visible tiles to true
	// if the tile has been seen, show it (is hidden by default)

	this.renderFov = function (pos, radius, vis, tileBecameVisibleCb) {
		// set all tiles to invisible
		this.resetFov(pos, radius);

		// render all visible tiles
		for (var i in vis) {
			var tileX = vis[i].x;
			var tileY = vis[i].y;
			for (var layer in dungeon.tiles) {
				var tile = dungeon.getTile(tileX, tileY, layer);
				if (tile) {
					// set tile's hasBeenSeen (show/hide)
					tile.hasBeenSeen = true;

					if (!tile._visible) {
						// execute individual tile callback (for trigerring discovery events)
						if (tileBecameVisibleCb) {
							tileBecameVisibleCb(tile);
						}
						// show the tile
						tile.show();
					}

					// set tile's canBeSeen
					tile.canBeSeen = true;

					// set tile's light intensity
					if (useGradientLight) {
						// calculate light intensity gradient
						var d = getDistance(pos, { x: tile.gridx, y: tile.gridy });
						tile.lightIntensity = Math.max((1.0 + minIntensity) - ((d / (radius + 1)) * (1.0 + minIntensity)), minIntensity);
					} else {
						tile.lightIntensity = 1;
					}
				}
			}
		}
	};


	// Sets the tile at given map coord to visited.
	// This function is given as visitTile parameter when calling fieldOfView algorithm

	this.visitTile = function (tileX, tileY) {
		// check that position is inside map bounds
		if (tileX < 0 || tileY < 0 || tileX >= dungeon.mapY || tileY >= dungeon.mapX) {
			return false;
		}

		return true;
	};


	// Determines if tile at given map coord blocks the vision ray.
	// This function is given as blockTile parameter when calling fieldOfView algorithm

	this.blockTile = function (tileX, tileY) {
		// check that position is inside map bounds
		if (tileX < 0 || tileY < 0 || tileX >= dungeon.mapH || tileY >= dungeon.mapW) {
			return;
		}

		// check if tile at coords is a blocking tile
		var tile = dungeon.getTile(tileX, tileY);
		if (tile) {
			switch (tile.type) {
				case Tiles.Wall:
					return true;
				case Tiles.Door:
					if (tile.state === 'open') {
						return false;
					}
					return true;
			}
		}

		return false;
	};


	//Compute the field of view from (ox, oy) out to radius r. 
	//two functions which take (x, y) coordinates and either visits the coordinate 
	//for the user or test whether the coordinate blocks sight.

	this.fieldOfView = function (ox, oy, r, visit, blocked) {
		var tiles = [];

		visit(ox, oy); // origin always visited.

		tiles.push({ x : ox, y: oy });

		function quadrant(dx, dy) {

			var light = new Light(r);
			for (var dr = 1; dr <= r; dr += 1) {
				for (var i = 0; i <= dr; i++) {
					// Check for light hitting this cell.
					var cell = new Pt(dr - i, i),
						arc = light.hits(cell);
					if (!arc) { continue; }  // unlit

					// Show the lit cell, check if blocking.
					var ax = ox + cell.x * dx,
						ay = oy + cell.y * dy;
					
					var vis = visit(ax, ay);

					if (vis) { tiles.push({ x: ax, y: ay }); }

					if (!blocked(ax, ay)) {  continue; }  // unblocked

					// Blocking cells cast shadows.
					if (!light.shade(arc, cell)) { return; }  // no more light   

				}
			}
		}

		quadrant(-1, +1);
		quadrant(+1, +1);
		quadrant(-1, -1);
		quadrant(+1, -1);

		return tiles;
	};

}

module.exports = Fov;







