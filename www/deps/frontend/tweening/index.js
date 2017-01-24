var inherit = require('inherit');
var EventEmitter = require('EventEmitter');
var DoublyList = require('DoublyList');
var PriorityList = require('PriorityList');
var CircularDoublyList = require('CircularDoublyList');

var interpolations = require('./interpolations.js');
var easing = require('./eases.js');

exports.easing = easing;
exports.interpolations = interpolations;


/**
 *
 * @classdesc Delay
 * When starting a controller with a specified delay value
 * a Delay object is created, it will trigger the starts
 * of the controller after the given duration of the delay.
 *
 * @param {Tweener} tweener Tweener to attach the delay to
 * @param {Controller} controller Controller that is delayed
 * @param {number} duration Duration of the delay
 *
 */

function Delay(tweener, duration, controller) {
	this._playingHead = 0;
	this._duration = duration;
	this._controller = controller;
	this._tweener = tweener;
	this._registrationRef = null;
}
inherit(Delay, EventEmitter);

Delay.prototype._update = function (tweenerSpeed) {
	this._playingHead += tweenerSpeed;
	if (this._playingHead > this._duration) {
		this._tweener._controllers.removeByRef(this._registrationRef);
		if (this._controller) {
			this._controller._start(this._playingHead - this._duration);
			this._controller._delay = null;
		}
		this.emit('finish');
	}
};

Delay.prototype.start = function () {
	this._registrationRef = this._tweener._controllers.add(this);
}

Delay.prototype._stop = function () {
	this._tweener._controllers.removeByRef(this._registrationRef);
	if (this._controller) {
		this._controller._delay = null;
	}
	this.emit('stop');
};

/**
 *
 * @classdesc Controller
 * Controls a playable: wrapper that allows to start, stop, pause
 * or resume a playable. It also has delay, loop and duration options.
 *
 * @param {Tweener} tweener Tweener to attach the controller to
 * @param {Playable} playable Controller playable
 *
 */

function Controller(tweener, playable) {
	EventEmitter.call(this);
	this._playable = playable;
	this._tweener = tweener;
	this._delay = null;

	this._registrationRef = null;
	this._running = false;
	this._active = false;
	this._loop = false;
	this._playingHead = 0;
	this._startingPosition = 0;
	this._duration = Infinity;
	this.speed = 1.0;
}
inherit(Controller, EventEmitter);

Controller.prototype.start = function (options) {
	options = options || {};

	this.speed              = options.speed || 1.0;
	this._loop              = options.loop || false;
	this._duration          = options.duration || Infinity;
	this._startingPosition  = options.position || 0;

	if (options.delay) {
		this._delay = new Delay(this._tweener, options.delay, this);
		this._delay.start();
	} else {
		this._start(0);
	}
};

Controller.prototype.reset = function (playable) {
	this.stop();
	this._playable = playable;
};

Controller.prototype._start = function (position) {
	position = position || 0;
	this._playingHead = 0;
	this._active = true;
	this._running = true;
	this._registrationRef = this._tweener._controllers.add(this);
	this.emit('start');

	this._playable._start(this._startingPosition + position);
};

Controller.prototype.stop = function () {
	if (this._active === true) {
		this._playable._stop();
		this._stop();
	}
	if (this._delay) {
		this._delay._stop();
	}
};

Controller.prototype._stop = function () {
	this._running = false;
	this._active = false;
	this._tweener._controllers.removeByRef(this._registrationRef);
	this.emit('stop');
};

Controller.prototype.goTo = function (position) {
	this._playable._goTo(position);
};

Controller.prototype._update = function (tweenerSpeed) {

	if (this._running === true) {
		this._playingHead += tweenerSpeed;

		var over;
		if (this._playingHead >= this._duration) {
			tweenerSpeed -= this._playingHead - this._duration;
			this._playable._play(tweenerSpeed * this.speed, this._loop);
			over = true;
		} else {
			over = this._playable._play(tweenerSpeed * this.speed, this._loop);
		}

		this.emit('update');

		if (over === true) {
			// The playable has reached its end
			this.emit('finish');
			this._stop();
			return;
		}
	}
};

Controller.prototype.pause = function () {
	this._running = false;
};

Controller.prototype.resume = function () {
	this._running = true;
};


/**
 *
 * @classdesc Tween Manager
 * It manages all the tweeners. Its speed is computed from the frame rate (fps)
 * and the duration since the previous call to its update method.
 *
 * @param {number} fps Frame rate
 *
 */
function TweenManager(fps) {
	this._previousTime = Date.now();
	this._tweeners = new DoublyList();
	this.fps = fps || 60;
	this.speed = 1;
}

exports.TweenManager = TweenManager;

TweenManager.prototype.restart = function () {
	this._previousTime = Date.now();
};

TweenManager.prototype.update = function () {
	var currentTime = Date.now();

	this.speed = (currentTime - this._previousTime) * this.fps / 1000;
	this._previousTime = currentTime;

	// Update every attached tweener
	var tweener = this._tweeners.getFirst();
	while (tweener) {
		tweener.object._update(this.speed);
		tweener = tweener.next;
	}
};

TweenManager.prototype._add = function (tweener) {
	if (tweener._registrationRef === null) {
		tweener._registrationRef = this._tweeners.add(tweener);
	}
};

TweenManager.prototype._remove = function (tweener) {
	this._tweeners.removeByRef(tweener._registrationRef);
	tweener._registrationRef = null;
};

/**
 *
 * @class
 * @classdesc Tweener
 *
 * Starting a tweener does not trigger the start of its children.
 *
 * If children were active and running when the tweener stops, they stop
 * playing. Also, they will keep playing from where they left off when the
 * tweener starts again, unless they have been manually stopped in the meanwhile.
 * Synchronization between controllers sharing a tweener is not guaranteed.
 *
 * @param {number} speed Speed of the tweener, has to be positive
 *
 */

function Tweener(manager, speed) {
	EventEmitter.call(this);

	this._controllers = new DoublyList();
	this._registrationRef = null;
	this._manager = manager;
	this.speed = speed || 1.0;

	return this;
}

inherit(Tweener, EventEmitter);
exports.Tweener = Tweener;

Tweener.prototype.start = function () {
	this._manager._add(this);
};

Tweener.prototype.stopAllControllers = function () {
	var controllerRef = this._controllers.getFirst();
	while (controllerRef) {
		var next = controllerRef.next;
		controllerRef.object._stop();
		controllerRef = next;
	}
};

Tweener.prototype.stop = function () {
	this._manager._remove(this);
};

Tweener.prototype.createDelay = function (duration) {
	return (new Delay(this, duration));
};

Tweener.prototype.createController = function (playable) {
	return (new Controller(this, playable));
};

Tweener.prototype._update = function (globalSpeed) {
	var controllerRef = this._controllers.getFirst();
	while (controllerRef) {
		controllerRef.object._update(globalSpeed * this.speed);
		controllerRef = controllerRef.next;
	}

	this.emit('update', globalSpeed * this.speed);
};


/**
 *
 * @classdesc Playable
 * Generic playable object. Inheriting object should have
 * the following methods: _prepare, _finish and _update
 *
 */

function Playable() {

	EventEmitter.call(this);

	// Duration of the playable
	this._duration = 0;

	// Position of the playing head
	this._playingHead = 0;

	// Number of iterations, if the playable goes reverse the number of iterations will become negative
	this._iteration = 0;

	// Registration reference, used to remove the playable in O(1) from its parent
	this._registrationRef = null;

	// Whether or not the playable has been started but not stopped yet
	this._active = false;

	return this;
}

inherit(Playable, EventEmitter);
exports.Playable = Playable;

/**
 * 
 * @method _play
 * Forward the playing head with respect to a given speed.
 *
 */
Playable.prototype._play = function (speed, loop) {

	this._playingHead += speed;
	if (speed > 0 && this._duration <= this._playingHead) {
		if (loop) {
			while (this._duration <= this._playingHead) {
				this._playingHead -= this._duration;
				this._iteration += 1;
				this.emit('restart', this._iteration);
			}
			this._prepare(this._playingHead);
		} else {
			this._playingHead = this._duration;
			this._stop();
			return true;
		}
	}

	if (speed < 0 && this._playingHead <= 0) {
		if (loop) {
			while (this._playingHead <= 0) {
				this._playingHead += this._duration;
				this._iteration -= 1;
				this.emit('restart', this._iteration);
			}
			this._prepare(this._playingHead);
		} else {
			this._playingHead = 0;
			this._stop();
			return true;
		}
	}

	this._update();
	this.emit('update', this._playingHead);
	return false;
};

/**
 * 
 * @method _goTo
 * Position the playing head at the given position
 *
 */
Playable.prototype._goTo = function (position) {

	if (position > this._duration) {
		this._playingHead = this._duration;
	} else if (position < 0) {
		this._playingHead = 0;
	} else {
		this._playingHead = position;
	}

	this._update();
	this.emit('update', this._playingHead);
};

Playable.prototype._start = function (position) {

	if (position > this._duration) {
		this._playingHead = this._duration;
	} else if (position < 0) {
		this._playingHead = 0;
	} else {
		this._playingHead = position;
	}

	this.emit('start', this._playingHead);
	this._prepare(this._playingHead);

	this._active = true;

	return true;
};

Playable.prototype._stop = function () {
	this._finish();
	this.emit('stop');

	this._active = false;
};

// Overwritable methods (to facilitate the implementation of inheriting classes)
Playable.prototype._prepare = function () {
};

Playable.prototype._finish = function () {
};

Playable.prototype._update = function () {
};



/**
 *
 * @classdesc PlayableGroup
 * Manages playables run in parallel.
 *
 */

function PlayableGroup() {
	Playable.call(this);

	this._children = new PriorityList(function (a, b) {
		return a.end - b.end;
	});
}

inherit(PlayableGroup, Playable);
exports.Group = PlayableGroup;

PlayableGroup.prototype.add = function (playable, delay) {
	delay = delay || 0;

	var child = {
		playable: playable,
		start: delay,
		end: playable._duration + delay
	};

	playable._registrationRef = this._children.add(child);

	// updating the duration
	this._duration = this._children.getLast().object.end;
};

PlayableGroup.prototype.remove = function (playable) {
	this._children.removeByRef(playable._registrationRef);

	// updating the duration
	this._duration = this._children.getLast().object.end;
};

PlayableGroup.prototype._prepare = function (startingPosition) {
	var playableRef = this._children.getFirst();
	while (playableRef) {
		playableRef.object.playable._start(startingPosition);
		playableRef = playableRef.next;
	}
};

PlayableGroup.prototype._finish = function () {
	var playableRef = this._children.getFirst();
	while (playableRef) {
		var child = playableRef.object;
		child.playable._goTo(this._playingHead - child.start);
		child.playable._stop();
		playableRef = playableRef.next;
	}
};

PlayableGroup.prototype._update = function () {
	var playableRef = this._children.getFirst();
	while (playableRef) {
		var child = playableRef.object;
		child.playable._goTo(this._playingHead - child.start);
		playableRef = playableRef.next;
	}
};


/**
 *
 * @classdesc PlayableSequence
 * Manages playables run sequentially.
 *
 */

function PlayableSequence() {
	Playable.call(this);

	this._children = new CircularDoublyList();
	this._currentRef = null;
	this._currentPlayable = null;
	this._previousPosition = 0;
	this._forward = true;
}

inherit(PlayableSequence, Playable);
exports.Sequence = PlayableSequence;

PlayableSequence.prototype.add = function (playable, delay) {
	delay = delay || 0;

	var child = {
		playable: playable,
		start: this._duration + delay,
		end: this._duration + playable._duration + delay
	};

	this._duration += playable._duration;
	this._children.add(child);
};

PlayableSequence.prototype._startNext = function () {

	if (this._currentRef === null) {
		this._currentRef = this._children.getFirst();
	} else {
		this._currentPlayable._stop();
	}

	var nOps = 0;
	if (this._forward === true) {
		while (this._playingHead > this._currentRef.object.end || this._playingHead < this._currentRef.object.start) {
			this._currentRef = this._currentRef.next;
			nOps += 1;
		}
	} else {
		while (this._playingHead > this._currentRef.object.end || this._playingHead < this._currentRef.object.start) {
			this._currentRef = this._currentRef.previous;
			nOps += 1;
		}
	}
	if (nOps >= this._children.getCount() / 2) {
		this._forward = !this._forward;
	}

	this._currentPlayable = this._currentRef.object.playable;
	this._currentPlayable._start(this._playingHead - this._currentRef.object.start);
};

PlayableSequence.prototype._prepare = function () {
	this._currentRef = null;
	if (this._children.getCount() > 0) {
		this._startNext();
	} else {
		console.error('PlayableSequence._prepare: trying to start a Sequence that has no children');
	}
};

PlayableSequence.prototype._finish = function () {
	if (this._currentRef) {
		this._currentPlayable._goTo(this._playingHead);
		this._currentPlayable._stop();
		this._currentRef = null;
	}
};

PlayableSequence.prototype._update = function () {
	if (this._currentRef.object.start > this._playingHead || this._playingHead > this._currentRef.object.end) {
		// The current playing head is out of the bounds of the current playable

		// Making a last update
		if (this._playingHead > this._currentRef.object.end) {
			this._currentPlayable._goTo(this._currentRef.object.end - this._currentRef.object.start);
		} else {
			this._currentPlayable._goTo(0);
		}

		// Starting the next one
		this._startNext();
	}
	this._currentPlayable._goTo(this._playingHead - this._currentRef.object.start);
};

/**
 *
 * @classdesc StateTween
 * Manages property states of an object with respect to durations.
 *
 * @param {object} element Object to tween
 * @param {number} duration Duration of the first state
 * @param {anything} initialState Initial state of the property of the element
 *
 */

function StateTween(element, duration, property, initialState) {

	Playable.call(this);

	this._states = [];
	this._stateIdx = 0;
	this._property = property;

	this.state = null;
	this.element = element;

	// Generating the first state of the tween
	this.addState(duration, initialState);
}

inherit(StateTween, Playable);
exports.StateTween = StateTween;

// Overwriting the setDuration method of class Playable
StateTween.prototype.setDuration = function () {
	console.warn("StateTween.setDuration: It is not possible to explicitly set the duration of a tween");
};

StateTween.prototype._prepare = function () {
	// initial update
	this._forceUpdate();
	this.emit('update', this._playingHead);
};

StateTween.prototype._finish = function () {
	// last update
	this._update();
	this.emit('update', this._playingHead);
};

StateTween.prototype._update = function () {
	var stateIdx = this._stateIdx;
	var state = this._states[stateIdx];

	while (this._playingHead < state.start) {
		stateIdx -= 1;
		state = this._states[stateIdx];
	}

	while (state.end < this._playingHead) {
		stateIdx += 1;
		state = this._states[stateIdx];
	}

	if (stateIdx !== this._stateIdx) {
		this._stateIdx = stateIdx;
		this.element[this._property] = state.value;
		this.state = state.value;
		this.emit('change', this._playingHead);
	}
};

StateTween.prototype._forceUpdate = function () {
	var stateIdx = this._stateIdx;
	var state = this._states[stateIdx];

	while (this._playingHead < state.start) {
		stateIdx -= 1;
		state = this._states[stateIdx];
	}

	while (state.end < this._playingHead) {
		stateIdx += 1;
		state = this._states[stateIdx];
	}

	this._stateIdx = stateIdx;
	this.element[this._property] = state.value;
	this.state = state.value;
	this.emit('change', this._playingHead);
};

/**
 *
 * @method addState
 * Add a state to the tween
 *
 * @param {number} duration Duration of the new state
 * @param {anything} state State of the element
 *
 */
StateTween.prototype.addState = function (duration, state) {

	// Creating the state
	var newState = {
		start: this._duration,
		end: this._duration + duration,
		duration: duration,
		value: state
	};

	// Updating the tween with the new duration
	this._duration = this._duration + duration;
	this._states.push(newState);
};

/**
 *
 * @classdesc Tween
 * Manages property transitions of an object with respect to eases,
 * durations, initial and final values.
 *
 * @param {object} element Object to tween
 * @param {number} duration Duration of the first transition
 * @param {object[]} propertyParams Property parameters of the first transition
 * @param {ease} ease Ease of the first transition
 *
 */

function Tween(element, duration, propertyParams, ease) {

	Playable.call(this);

	this._interpolate = interpolations.discrete;
	this.element = element;

	this._transitions = [];
	this._transitionIdx = 0;

	this._initialValue = {};
	this._finalValue = {};
	this.evaluation = {};

	for (var p = 0; p < propertyParams.length; p += 1) {
		var param = propertyParams[p];
		var property = param.property;
		var a;
		if (param.a === undefined) {
			a = this.element[property];
			propertyParams[p].a = a;
		} else {
			a = param.a;
		}
		this._initialValue[property] = a;
		this._finalValue[property] = param.b;
		this.evaluation[property] = a;
	}

	// Generating the first transition of the tween
	this.addTransition(duration, propertyParams, ease);
};

inherit(Tween, Playable);
exports.Tween = Tween;

Tween.prototype._prepare = function () {
	for (var p in this.evaluation) {
		this.element[p] = 0;
		this.evaluation[p] = 0;
	}

	// initial update
	this._update();
	this.emit('update', this._playingHead);
};

Tween.prototype._finish = function () {
	// last update
	this._update();
	this.emit('update', this._playingHead);
};

Tween.prototype.reset = function (duration, propertyParams, ease) {
	this._duration = 0;
	this._transitions = [];
	this._transitionIdx = 0;

	this._initialValue = {};
	this._finalValue = {};
	this.evaluation = {};

	for (var p = 0; p < propertyParams.length; p += 1) {
		var param = propertyParams[p];
		var property = param.property;
		var a;
		if (param.a === undefined) {
			a = this.element[property];
			propertyParams[p].a = a;
		} else {
			a = param.a;
		}
		this._initialValue[property] = a;
		this._finalValue[property] = param.b;
		this.evaluation[property] = a;
	}

	// Generating the first transition of the tween
	this.addTransition(duration, propertyParams, ease);
};

Tween.prototype._update = function () {
	var transition = this._transitions[this._transitionIdx];

	while (this._playingHead < transition.start) {
		this._transitionIdx -= 1;
		transition = this._transitions[this._transitionIdx];
	}

	while (transition.end < this._playingHead) {
		this._transitionIdx += 1;
		transition = this._transitions[this._transitionIdx];
	}

	// Interpolation of the property values with respect to the current transition
	var evaluation = this._interpolate(this._playingHead - transition.start, transition.duration, transition.propertyParams, transition.ease);

	for (var p in evaluation) {
		this.element[p] += evaluation[p] - this.evaluation[p];
		this.evaluation[p] = evaluation[p];
	}
};


/**
 *
 * @method addTransition
 * Add a transition to the tween
 *
 * @param {number} duration Duration of the new transition
 * @param {object[]} propertyParams Property parameters of the new transition
 * @param {ease} ease Ease of the new transition
 *
 */
Tween.prototype.addTransition = function (duration, propertyParams, ease) {

	// Augmenting the property parameters with additional properties:
	// - c: the change in the property value (b - a)
	// - discretization: if not defined, the discretization is 0
	var discrete = false;
	for (var p = 0; p < propertyParams.length; p += 1) {

		var param = propertyParams[p];
		var a;
		if (param.a === undefined) {
			var property = propertyParams[p].property;
			var lastTranstionParams = this._transitions[this._transitions.length - 1].propertyParams;
			for (var i = 0; i < lastTranstionParams.length; i += 1) {
				if (lastTranstionParams[i].property === property) {
					a = lastTranstionParams[i].b;
					param.a = a;
					break;
				}
			}
		} else {
			a = param.a;
		}
		param.c = param.b - a;
		if (param.discretization === null || param.discretization === undefined) {
			param.discretization = 0;
		} else {
			discrete = true;
		}

		// updating the final value of the tween
		this._finalValue[param.property] = param.b;
	}

	// Creating the transition
	var transition = {
		start: this._duration,
		end: this._duration + duration,
		duration: duration,
		propertyParams: propertyParams,
		ease: ease
	};

	// Updating the tween with the new duration
	this._duration = this._duration + duration;

	this._transitions.push(transition);
};


/**
 *
 * @classdesc Tween
 * Manages property transitions of an object with respect to eases,
 * durations, initial and final values.
 *
 * @param {object} element Object to tween
 * @param {number} duration Duration of the first transition
 * @param {object[]} propertyParams Property parameters of the first transition
 * @param {ease} ease Ease of the first transition
 *
 */

function SingleTween(element, duration, params, ease) {

	Playable.call(this);

	this.element = element;
	this.property = params.property;

	this._transitions = [];
	this._transitionIdx = 0;

	params.a = params.a || this.element[params.property];
	this._initialValue = params.a;
	this._finalValue = params.b || params.a;
	this.evaluation = params.a;

	// Generating the first transition of the tween
	this.addTransition(duration, params, ease);
}

inherit(SingleTween, Playable);
exports.SingleTween = SingleTween;

// Overwriting the setDuration method of class Playable
SingleTween.prototype.setDuration = function () {
	console.warn("Tween.setDuration: It is not possible to explicitly set the duration of a tween");
};

SingleTween.prototype._prepare = function () {
	this.element[this.property] = 0;
	this.evaluation = 0;

	// initial update
	this._update();
	this.emit('update', this._playingHead);
};

SingleTween.prototype._finish = function () {
	// last update
	this._update();
	this.emit('update', this._playingHead);
};

SingleTween.prototype.reset = function (duration, params, ease) {
	this.property = params.property;
	this._duration = 0;
	this._transitions = [];
	this._transitionIdx = 0;

	params.a = params.a || this.element[params.property];
	this._initialValue = params.a;
	this._finalValue = params.b || params.a;
	this.evaluation = params.a;

	// Generating the first transition of the tween
	this.addTransition(duration, params, ease);
};

SingleTween.prototype._update = function () {
	var transition = this._transitions[this._transitionIdx];

	while (this._playingHead < transition.start) {
		this._transitionIdx -= 1;
		transition = this._transitions[this._transitionIdx];
	}

	while (transition.end < this._playingHead) {
		this._transitionIdx += 1;
		transition = this._transitions[this._transitionIdx];
	}

	// Interpolation of the property values with respect to the current transition
	// console.log(transition.a, transition.c, transition.ease);
	var eval = transition.a + transition.c * transition.ease.fn((this._playingHead - transition.start) / transition.duration, transition.ease);
	this.element[this.property] += eval - this.evaluation;
	this.evaluation = eval;
};


/**
 *
 * @method addTransition
 * Add a transition to the tween
 *
 * @param {number} duration Duration of the new transition
 * @param {object[]} propertyParams Property parameters of the new transition
 * @param {ease} ease Ease of the new transition
 *
 */
SingleTween.prototype.addTransition = function (duration, params, ease) {

	if (params.a === undefined) {
		if (this._transitions.length > 0) {
			params.a = this._transitions[this._transitions.length - 1].b;
		}
	}

	params.c = params.b - params.a;

	// updating the final value of the tween
	this._finalValue = params.b;

	// Creating the transition
	var transition = {
		start: this._duration,
		end: this._duration + duration,
		duration: duration,
		a: params.a,
		b: params.b,
		c: params.c,
		ease: ease
	};

	// console.log(params);
	// console.log(params.a, params.b, params.c);

	// Updating the tween with the new duration
	this._duration = this._duration + duration;

	this._transitions.push(transition);
};


/**
 *
 * @classdesc Relative tween
 * Manages property transitions of an object with respect to eases,
 * durations, initial and final values.
 * The properties of the element are tweened relatively to its current property values.
 *
 */

function RelativeTween() {
	Tween.apply(this, arguments);
}

inherit(RelativeTween, Tween);
exports.RelativeTween = RelativeTween;

RelativeTween.prototype._prepare = function () {
	for (var p in this.evaluation) {
		this.evaluation[p] = 0;
	}

	// initial update
	this._update();
	this.emit('update', this._playingHead);
};