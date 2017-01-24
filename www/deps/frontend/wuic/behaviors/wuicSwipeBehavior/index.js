/**
 * @alias wuicSwipeBehavior
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 *
 * @swipe {WuicSprite}      - object to add the swipe
 * @registerTo (WuicSprite) - object from which swipe get the touch events
 * @return {WuicSprite}     - swipe, the same object after conversion
 *
 * @desc : with swipe behavior, a Sprite may emit the following events :
 * 'swipestart'
 * 'swipe'
 * 'swipeend'
 */

function swipeBehavior(swipe, registerTo) {

	// add private properties

	swipe._tapped = 0;

	swipe.position = {x: 0, y: 0, velocityX: 0, velocityY: 0};

	swipe._start = {
		pos: {x: 0, y: 0},
		tap: {x: 0, y: 0}
	};
	swipe._last = {};


//█████████████████████████████████████████████████
//███████████▀███████████████████████▀█████████████
//██▀▄▄▄▄ ██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▄██▄ ▄▄▄██████████
//███▄▄▄▄▀███ ██████▀▄▄▄▄ ███ ███████ █████████████
//██ ▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀▀▀████▄▀▀▀▄█████████
//█████████████████████████████████████████████████

	registerTo.on('tapstart', function (e, pos) {
		// forbid behavior to be tapped two time by different touchevent
		if (swipe._tapped) {
			return;
		}

		var state = swipe.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= swipe.width && state.localY >= 0 && state.localY <= swipe.height);
			if (state.inBounds) {
				swipe._tapped = pos.id;

				// initialize swipe calculation
				swipe._last = {
					x: state.localX,
					y: state.localY,
					t: new Date().getTime(),
					velocityX: 0,
					velocityY: 0
				};

				//initialize position velocity
				swipe.position.velocityX = 0;
				swipe.position.velocityY = 0;

				// emit swipestart event
				swipe.emit('swipestart', e, state, swipe.position);

				// store starting value and tap coordinates
				swipe._start = {
					pos: {
						x: swipe.position.x,
						y: swipe.position.y
					},
					tap: {
						x: state.localX,
						y: state.localY
					}
				};
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
		var state = swipe.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === swipe._tapped) {

				// compute swipe velocity

				var t = new Date().getTime();
				var d = (t - swipe._last.t) || 1;
				var vx = (state.localX - swipe._last.x) / d;
				var vy = (state.localY - swipe._last.y) / d;

				// loss of energy
				e = Math.pow(0.99, ~~(1 + d * 0.1));

				vx = (vx + swipe._last.velocityX * e) / 2;
				vy = (vy + swipe._last.velocityY * e) / 2;

				swipe._last = {
					x: state.localX,
					y: state.localY,
					t: t,
					velocityX: vx,
					velocityY: vy
				};

				// new position relative to move
				swipe.position = {
					x: swipe._start.pos.x - state.localX + swipe._start.tap.x,
					y: swipe._start.pos.y - state.localY + swipe._start.tap.y,
					velocityX: vx,
					velocityY: vy
				};

				// bound position if needed
				// this.position = this.boundPosition(this.position);

				// emit swipe event
				swipe.emit('swipe', e, state, swipe.position);
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
		var state = swipe.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === swipe._tapped) {
				swipe.emit('swipeend', e, state, swipe.position);
				swipe._tapped = 0;
			}
		}
	});


//█████████████████████████████████████████████████████████
//████████████████████████████████████████████▄ ███████████
//██▀▄▄▄▀ ██▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▀ ██▀▄▄▄▄▀█████ ███████████
//██ ███████▀▄▄▄▄ ███ ███ ██ ███████ ▄▄▄▄▄█████ ███████████
//██▄▀▀▀▀▄██▄▀▀▀▄ ▀█▀ ▀█▀ ▀█▄▀▀▀▀▄██▄▀▀▀▀▀███▀▀ ▀▀█████████
//█████████████████████████████████████████████████████████

	registerTo.on('touchcancel', function () {
		var state = swipe.getLocalCoordinate(0, 0);
		if (state.enabled) {
			if (swipe._tapped) {
				swipe.emit('swipeend', null, state, swipe.position);
				swipe._tapped = 0;
			}
		}
	});

	return swipe;
}

module.exports = swipeBehavior;
