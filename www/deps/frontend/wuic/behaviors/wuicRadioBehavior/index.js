/**
 * @alias wuicRadioBehavior
 * @class
 * @classDesc Apply radio behavior on a list of sprites
 *
 * @author Brice Chevalier <bchevalier@wizcorp.jp>
 *
 * @param {Sprite[]} optionSprites  - Sprites that form the options of the radio behavior
 * @param {Sprite} registerTo       - Object from which the options get the touch events
 * @param {Number} defaultSelection - Initial selection of the radio
 */

function _RadioBehavior(optionSprites, registerTo, defaultSelection) {

	// radio properties
	var nbOptions = optionSprites.length;
	var options = optionSprites;
	var tapped = 0;
	var self = this;
	var selection = defaultSelection || -1;

	for (var i = 0; i < nbOptions; i += 1) {
		if (i === selection) {
			options[i].emit('radioselect', selection, options);
		} else {
			options[i].emit('radiounselect', selection, options);
		}
	}

	// Public setter
	this.setSelection = function (newSelection) {
		if (selection !== newSelection) {
			if (selection >= 0) {
				options[selection].emit('radiounselect', newSelection, options);
			}
			options[newSelection].emit('radioselect', newSelection, options);
			selection = newSelection;
		}
	};

	// Public getter
	this.getSelection = function () {
		return selection;
	};

	// Events registered: tap start, move, end and cancel
	registerTo.on('tapstart', function (e, pos) {
		// forbid behavior to be tapped two time by different touchevent
		if (tapped) {
			return;
		}

		for (var i = 0; i < nbOptions; i += 1) {
			var option = options[i];
			var state = option.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
			if (state.enabled) {
				state.inBounds = (state.localX >= 0 && state.localX <= option.width && state.localY >= 0 && state.localY <= option.height);
				if (state.inBounds) {
					self.setSelection(i);
					tapped = pos.id;
					option.emit('tapstart', e, state);
					option.emit('radiotapstart', e, state, selection);
					break;
				}
			}
		}
	});

	registerTo.on('tapmove', function (e, pos) {
		if (selection < 0) {
			return;
		}
		var option = options[selection];
		var state = option.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === tapped) {
				option.emit('tapmove', e, state);
				option.emit('radiotapmove', e, state, selection);
			}
		}
	});

	registerTo.on('tapend', function (e, pos) {
		if (selection < 0) {
			return;
		}
		var option = options[selection];
		var state = option.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === tapped) {
				state.inBounds = (state.localX >= 0 && state.localX <= option.width && state.localY >= 0 && state.localY <= option.height);
				if (state.inBounds) {
					option.emit('tapend', e, state);
				} else {
					option.emit('tapendoutside', e, state);
				}
				option.emit('radiotapend', e, state, selection);
				tapped = 0;
			}
		}
	});

	registerTo.on('tapcancel', function (e, pos) {
		if (selection < 0) {
			return;
		}
		if (tapped) {
			var option = options[selection];
			var state = option.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
			option.emit('tapcancel', e, state);
			option.emit('radiotapend', e, state, selection);
			tapped = 0;
		}
	});
}

function radioBehavior(options, registerTo, defaultSelection) {
	return new _RadioBehavior(options, registerTo, defaultSelection);
}

module.exports = radioBehavior;
