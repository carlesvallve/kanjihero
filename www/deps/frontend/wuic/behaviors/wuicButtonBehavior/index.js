/**
 * @alias wuicButtonBehavior
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 *
 * @param {WuicSprite} button     - object to turn into a button
 * @param {WuicSprite} registerTo - object from which button get the touch events
 * @return {WuicSprite}           - button, the same object after conversion
 *
 * @desc :
 * With knob behavior, a Sprite may emit the following events :
 * - 'tapstart' - when touchstart occurs in sprite boundaries. the sprite is then tapped
 * - 'tapmove'  - if sprite is tapped, and touchmove event occurs
 * - 'tapmoveinside'  - if tapmove is emitted and touchmove occurs inside sprite boundaries
 * - 'tapmoveoutside' - if tapmove is emitted and touchmove occurs outside sprite boundaries
 * - 'tapend' - when touchend event occurs in sprite boundaries
 * - 'tapendoutside' - when touchend event occurs outside sprite boundaries
 * - 'rollover' - if sprite isn't tapped and touchmove event enter in sprite boundaries (emitted once)
 * - 'rollout' - after a rollover, if a touchmove event exit the sprite boundaries
 *
 * Events are emitted with two objects :
 * - e : original touchevent
 * - pos : a set of values relative to the sprite and occured touchevent = {
 *    x : touch absolute coordinate (unchanged from e)
 *    y : touch absolute coordinate (unchanged from e)
 *    localX : touch coordinate relative to the sprite
 *    localY : touch coordinate relative to the sprite
 *    parentX : touch coordinate relative to Sprite direct parent
 *    parentY : touch coordinate relative to Sprite direct parent
 *    enabled : true if sprite and all parents are enabled
 *    visible : true if sprite and all parents are visible
 *    inBounds : true if touch event occurs in sprite boundaries
 * }
 */

function buttonBehavior(button, registerTo) {

	// add private properties

	button._tapped = 0;
	button._rollover = [];


//█████████████████████████████████████████████████
//███████████▀███████████████████████▀█████████████
//██▀▄▄▄▄ ██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▄██▄ ▄▄▄██████████
//███▄▄▄▄▀███ ██████▀▄▄▄▄ ███ ███████ █████████████
//██ ▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀▀▀████▄▀▀▀▄█████████
//█████████████████████████████████████████████████

	registerTo.on('tapstart', function (e, pos) {
		// forbid button to be tapped two times by different touchevent
		if (button._tapped) {
			return;
		}

		var state = button.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= button.width && state.localY >= 0 && state.localY <= button.height);
			if (state.inBounds) {
				button._tapped = pos.id;
				button.emit('tapstart', e, state);
				// also emit a rollover event for touchstart event
				if (button._rollover.length === 0) {
					button.emit('rollover', e, state);
				}
				button._rollover.push(pos.id);
				// NOTA : we don't need to check if this id isn't already in _rollover array
				// since a touchstart event can't be triggered after a touchmove of same id
			}
		}
	});


//█████████████████████████████████████████
//█████████████████████████████████████████
//█▄ ▀▄▀▀▄▀█▀▄▄▄▄▀█▄ ▄██▄ ▄█▀▄▄▄▄▀█████████
//██ ██ ██ █ ████ ███ ██ ███ ▄▄▄▄▄█████████
//█▀ ▀█ ▀█ █▄▀▀▀▀▄████  ████▄▀▀▀▀▀█████████
//█████████████████████████████████████████

	registerTo.on('tapmove', function (e, pos) {
		var state = button.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= button.width && state.localY >= 0 && state.localY <= button.height);
			var rolloverIndex = button._rollover.indexOf(pos.id);
			// tapmove events
			if (pos.id === button._tapped) {
				button.emit('tapmove', e, state);
				if (state.inBounds) {
					button.emit('tapmoveinside', e, state);
				} else {
					button.emit('tapmoveoutside', e, state);
				}
			}
			// roll event
			if (rolloverIndex === -1 && state.inBounds) {
				if (button._rollover.length === 0) {
					button.emit('rollover', e, state);
				}
				button._rollover.push(pos.id);
			} else if (rolloverIndex !== -1 && !state.inBounds) {
				button._rollover.splice(rolloverIndex, 1);
				if (button._rollover.length === 0) {
					button.emit('rollout', e, state);
				}
			}
		}
	});


//█████████████████████████████████
//██████████████████████▄ █████████
//██▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▀ █████████
//██ ▄▄▄▄▄███ ███ ██ ████ █████████
//██▄▀▀▀▀▀██▀ ▀█▀ ▀█▄▀▀▀▄ ▀████████
//█████████████████████████████████

	registerTo.on('tapend', function (e, pos) {
		var state = button.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === button._tapped) {
				state.inBounds = (state.localX >= 0 && state.localX <= button.width && state.localY >= 0 && state.localY <= button.height);
				if (state.inBounds) {
					button.emit('tapend', e, state);
				} else {
					button.emit('tapendoutside', e, state);
				}
				button._tapped = 0;
			}
			if (button._rollover.length > 0) {
				button._rollover = [];
				button.emit('rollend', e, state);
			}
		}
	});


//█████████████████████████████████████████████████████████
//████████████████████████████████████████████▄ ███████████
//██▀▄▄▄▀ ██▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▀ ██▀▄▄▄▄▀█████ ███████████
//██ ███████▀▄▄▄▄ ███ ███ ██ ███████ ▄▄▄▄▄█████ ███████████
//██▄▀▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀█▀ ▀█▄▀▀▀▀▄██▄▀▀▀▀▀███▀▀ ▀▀█████████
//█████████████████████████████████████████████████████████

	registerTo.on('tapcancel', function () {
		var state = button.getLocalCoordinate(0, 0);
		if (state.enabled) {
			if (button._rollover.length > 0) {
				button._rollover = [];
				button.emit('rollend', null, state);
			}
			if (button._tapped) {
				button.emit('tapcancel', null, state);
				button._tapped = 0;
			}
		}
	});

	return button;
}

module.exports = buttonBehavior;