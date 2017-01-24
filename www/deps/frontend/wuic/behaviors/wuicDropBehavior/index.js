/**
 * @alias wuicDropBehavior
 * @desc Turn a Sprite into a droppable object
 *
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 *
 * @param {Sprite} drop        - object to turn into a droppable
 * @param {Sprite} registerTo  - Sprite from which draggable get the touch events
 * @param {Sprite} [container] - Sprite to which draggable get the drag event
 */

function dropBehavior(drop, registerTo, container) {

	container = container || registerTo;

	// add private properties

	drop._rollover = [];
	drop._inDrag = {}; // objects currently in drag
	// drop.data = {};

//█████████████████████████████████████████████████
//███████████▀███████████████████████▀█████████████
//██▀▄▄▄▄ ██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▄██▄ ▄▄▄██████████
//███▄▄▄▄▀███ ██████▀▄▄▄▄ ███ ███████ █████████████
//██ ▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀▀▀████▄▀▀▀▄█████████
//█████████████████████████████████████████████████

	container.on('dragstart', function (obj, id) {
		if (!drop._inDrag[id]) {
			drop._inDrag[id] = [];
		}
		drop._inDrag[id].push(obj);
		drop.emit('dragstart', obj);
	});


//█████████████████████████████████████████
//█████████████████████████████████████████
//█▄ ▀▄▀▀▄▀█▀▄▄▄▄▀█▄ ▄██▄ ▄█▀▄▄▄▄▀█████████
//██ ██ ██ █ ████ ███ ██ ███ ▄▄▄▄▄█████████
//█▀ ▀█ ▀█ █▄▀▀▀▀▄████  ████▄▀▀▀▀▀█████████
//█████████████████████████████████████████

	registerTo.on('tapmove', function (e, pos) {
		if (drop._inDrag[pos.id] && drop._inDrag[pos.id].length > 0) {
			var state = drop.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
			if (state.enabled) {
				state.inBounds = (state.localX >= 0 && state.localX <= drop.width && state.localY >= 0 && state.localY <= drop.height);
				var i, len;
				var rolloverIndex = drop._rollover.indexOf(pos.id);
				if (rolloverIndex === -1 && state.inBounds) {
					drop._rollover.push(pos.id);
					for (i = 0, len = drop._inDrag[pos.id].length; i < len; i++) {
						drop.emit('dragenter', e, state, drop._inDrag[pos.id][i]);
					}
				} else if (rolloverIndex !== -1 && !state.inBounds) {
					drop._rollover.splice(rolloverIndex, 1);
					for (i = 0, len = drop._inDrag[pos.id].length; i < len; i++) {
						drop.emit('dragexit', e, state, drop._inDrag[pos.id][i]);
					}
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
		drop._rollover = [];
		if (drop._inDrag[pos.id] && drop._inDrag[pos.id].length > 0) {
			var state = drop.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
			if (state.enabled) {
				state.inBounds = (state.localX >= 0 && state.localX <= drop.width && state.localY >= 0 && state.localY <= drop.height);
				if (state.inBounds) {
					for (var i = 0, len = drop._inDrag[pos.id].length; i < len; i++) {
						var dropState = {
							// copy the state object for each dragged element
							x: state.x,
							y: state.y,
							localX: state.localX,
							localY: state.localY,
							parentX: state.parentX,
							parentY: state.parentY,
							visible: state.visible,
							enabled: state.enabled,
							inBounds: state.inBounds,
							// add drop informations
							dropX: drop._inDrag[pos.id][i]._startX + pos.x,
							dropY: drop._inDrag[pos.id][i]._startY + pos.y,
							originX: drop._inDrag[pos.id][i]._originX,
							originY: drop._inDrag[pos.id][i]._originY
						};
						drop.emit('drop', e, dropState, drop._inDrag[pos.id][i]);
					}
				}
			}
			delete drop._inDrag[pos.id];
		}
	});


//█████████████████████████████████████████████████████████
//████████████████████████████████████████████▄ ███████████
//██▀▄▄▄▀ ██▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▀ ██▀▄▄▄▄▀█████ ███████████
//██ ███████▀▄▄▄▄ ███ ███ ██ ███████ ▄▄▄▄▄█████ ███████████
//██▄▀▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀█▀ ▀█▄▀▀▀▀▄██▄▀▀▀▀▀███▀▀ ▀▀█████████
//█████████████████████████████████████████████████████████

	registerTo.on('tapcancel', function (e) {
		var state = drop.getLocalCoordinate(0, 0);
		if (drop._inDrag.length > 0) {
			if (state.enabled) {
				drop.emit('dropcancel', e, state, drop._inDrag);
			}
			drop._inDrag = {};
		}
		if (drop._rollover.length > 0) {
			drop._rollover = [];
			drop.emit('rollend', e, state);
		}
	});

	return drop;

}

module.exports = dropBehavior;