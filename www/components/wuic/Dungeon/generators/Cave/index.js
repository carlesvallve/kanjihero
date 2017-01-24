var inherit = require('inherit');
var Dungeon = require('Dungeon');

/**
 * @class
 * @classDesc Cave generation algorithm
 */
function Cave(parent, width, height) {
	Dungeon.call(this, parent, width, height);

}

inherit(Cave, Dungeon);
module.exports = Cave;