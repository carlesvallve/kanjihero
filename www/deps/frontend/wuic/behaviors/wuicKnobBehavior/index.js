/**
 * @alias wuicKnobBehavior
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 *
 * @param {Sprite} knob       - object to turn into a knob
 * @param {Sprite} registerTo - object from which knob get the touch events
 * @return {Sprite}           - knob, the same object after conversion
 *
 * @desc
 * With knob behavior, a Sprite may emit the following events :
 * - 'tapstart'
 * - 'turn'
 * - 'tapend'
 *
 * Events are emitted with 2 objects :
 * - e (touchevent)
 * - state (Object)
 */
function knobBehavior(knob, registerTo) {

	// new properties

	knob.value = 0.5;     // output value of the knob (float between 0 and 1)
	knob.amplitude = 100; // maximum amount of pixel we can move verticaly

	// add private properties

	knob._tapped = 0;
	knob._startPos = 0;
	knob._startVal = 0.5;

//█████████████████████████████████████████████████
//███████████▀███████████████████████▀█████████████
//██▀▄▄▄▄ ██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▄██▄ ▄▄▄██████████
//███▄▄▄▄▀███ ██████▀▄▄▄▄ ███ ███████ █████████████
//██ ▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀▀▀████▄▀▀▀▄█████████
//█████████████████████████████████████████████████

	registerTo.on('tapstart', function (e, pos) {
		// forbid behavior to be tapped two time by different touchevent
		if (knob._tapped) {
			return;
		}

		var state = knob.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= knob.width && state.localY >= 0 && state.localY <= knob.height);
			if (state.inBounds) {
				knob._tapped = pos.id;
				knob._startPos = knob.y - state.parentY;
				knob._startVal = knob.value;
				state.value = knob.value;
				knob.emit('tapstart', e, state);
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
		var state = knob.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= knob.width && state.localY >= 0 && state.localY <= knob.height);
			if (pos.id === knob._tapped) {
				knob.value = Math.max(0, Math.min(1, knob._startVal - (knob._startPos - knob.y + state.parentY) / knob.amplitude));
				state.value = knob.value;
				knob.emit('turn', e, state);
				knob.emit('tapmove', e, state);
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
		var state = knob.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === knob._tapped) {
				state.inBounds = (state.localX >= 0 && state.localX <= knob.width && state.localY >= 0 && state.localY <= knob.height);
				state.value = knob.value;
				knob.emit('tapend', e, state);
				knob._tapped = 0;
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
		var state = knob.getLocalCoordinate(0, 0);
		if (state.enabled) {
			if (knob._tapped) {
				state.value = knob.value;
				knob.emit('tapend', null, state);
				knob._tapped = 0;
			}
		}
	});

	return knob;
}

module.exports = knobBehavior;
