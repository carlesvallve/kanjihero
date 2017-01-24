/**
 * @alias wuicDragBehavior
 * @desc Turn a Sprite into a draggable object
 *
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 *
 * @param {Sprite} drag        - Sprite to turn into a draggable
 * @param {Sprite} registerTo  - Sprite from which draggable get the touch events
 * @param {Sprite} [container] - Sprite to which draggable emit the drag event
 */
function dragBehavior(drag, registerTo, container) {

	container = container || registerTo;

	// add private properties

	drag._tapped = false;
	drag._rollover = false;

	drag._originX = 0;
	drag._originY = 0;

	drag._startX = 0;
	drag._startY = 0;


//█████████████████████████████████████████████████
//███████████▀███████████████████████▀█████████████
//██▀▄▄▄▄ ██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▄██▄ ▄▄▄██████████
//███▄▄▄▄▀███ ██████▀▄▄▄▄ ███ ███████ █████████████
//██ ▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀▀▀████▄▀▀▀▄█████████
//█████████████████████████████████████████████████

	registerTo.on('tapstart', function (e, pos) {
		if (drag._tapped) {
			// forbid behavior to be tapped two time by different touchevent
			return;
		}

		var state = drag.getLocalCoordinate(pos.x, pos.y, e.timeStamp);

		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= drag.width && state.localY >= 0 && state.localY <= drag.height);
			if (state.inBounds) {
				drag._tapped = pos.id;
				drag._originX = drag.x;
				drag._originY = drag.y;
				drag._startX = drag.x - state.parentX;
				drag._startY = drag.y - state.parentY;
				// emit an event to self
				drag.emit('tapstart', e, state);
				// emit a drag event to the register object
				container.emit('dragstart', drag, pos.id);
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
		var state = drag.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		state.originX = drag._originX;
		state.originY = drag._originY;
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= drag.width && state.localY >= 0 && state.localY <= drag.height);
			if (pos.id === drag._tapped) {
				// move the element to follow tap movement
				drag.x = drag._startX + state.parentX;
				drag.y = drag._startY + state.parentY;
				// emit event
				drag.emit('tapmove', e, state);
			} else if (!drag._rollover && state.inBounds) {
				drag._rollover = true;
				drag.emit('rollover', e, state);
			} else if (drag._rollover && !state.inBounds) {
				drag._rollover = false;
				drag.emit('rollout', e, state);
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
		var state = drag.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		state.originX = drag._originX;
		state.originY = drag._originY;
		if (state.enabled) {
			if (pos.id === drag._tapped) {
				state.inBounds = (state.localX >= 0 && state.localX <= drag.width && state.localY >= 0 && state.localY <= drag.height);
				// wait for the droppable element to update self
				// TODO: find a clever way of doing this, we may have bug if we spam tapstart
				window.setTimeout(function () {
					drag.emit('tapend', e, state);
					drag._tapped = false;
				}, 10);
			}
		}
	});


//█████████████████████████████████████████████████████████
//████████████████████████████████████████████▄ ███████████
//██▀▄▄▄▀ ██▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▀ ██▀▄▄▄▄▀█████ ███████████
//██ ███████▀▄▄▄▄ ███ ███ ██ ███████ ▄▄▄▄▄█████ ███████████
//██▄▀▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀█▀ ▀█▄▀▀▀▀▄██▄▀▀▀▀▀███▀▀ ▀▀█████████
//█████████████████████████████████████████████████████████

	registerTo.on('touchcancel', function (e) {
		var state = drag.getLocalCoordinate(0, 0);
		state.originX = drag._originX;
		state.originY = drag._originY;
		if (state.enabled) {
			if (drag._tapped) {
				drag.emit('tapcancel', e, state);
				drag._tapped = false;
			}
		}
	});
}

module.exports = dragBehavior;