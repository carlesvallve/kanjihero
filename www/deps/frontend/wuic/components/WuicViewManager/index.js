var inherit = require('inherit');
var EventEmitter = require('EventEmitter');


/**
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 * @class
 * @classDesc - main manager for canvas views
 * dispatch touch events
 * queueable popup system
 *
 * @augments EventEmitter
 *
 */
function ViewManager() {

	EventEmitter.call(this);

	this.views = {};

	this.activeViews = [];   // current visible views
	this.swapBuffer = false; // used to swap activeViews when closing view to prevent flickering

	this.popupStack = [];
	this.popupId = 0;

	this.activeViewsLength = 0;

	this.historic = [];
}

inherit(ViewManager, EventEmitter);

module.exports = ViewManager;


//██████████████████████████████████████████████████████████████████████████████████████████
//█████▀▀▀█████████████████████████████████████████████████████████▄ ██████████▀████████████
//██▀▀ ▀▀▀█▄ ▀▄▄▄█▀▄▄▄▄▀█▄ ▀▄▀▀▄▀█▀▄▄▄▄▀████████▄ ██▄ ██▄ ▀▄▄▀█▀▄▄▄▀ ██▀▄▄▄▄▀█▄ ▄▄▄██▀▄▄▄▄▀█
//████ █████ █████▀▄▄▄▄ ██ ██ ██ █ ▄▄▄▄▄█████████ ███ ███ ███ █ ████ ██▀▄▄▄▄ ██ █████ ▄▄▄▄▄█
//██▀▀ ▀▀▀█▀ ▀▀▀██▄▀▀▀▄ ▀▀ ▀█ ▀█ █▄▀▀▀▀▀█████████▄▀▀▄ ▀██ ▀▀▀▄█▄▀▀▀▄ ▀█▄▀▀▀▄ ▀█▄▀▀▀▄█▄▀▀▀▀▀█
//██████████████████████████████████████████████████████▀ ▀█████████████████████████████████
//██████████████████████████████████████████████████████████████████████████████████████████


/**
 * register ViewManager to the canvas object for 'frameupdate' and touch events
 */

ViewManager.prototype.register = function (canvas) {
	var that = this;
	canvas.on('frameUpdate', function () {
		that.update();
	});

	this.registerTouchEvents(canvas._canvas);
	this.registerKeyEvents(canvas._canvas);
};

//████████████████████████████████████████████████████████████████████████████████████████████████████████████
//██████████████████████████▄███████████▀████████████████████████████████████████████████████████▀████████████
//██▄ ▀▄▄▄█▀▄▄▄▄▀█▀▄▄▄▀ ▄█▄▄ ███▀▄▄▄▄ █▄ ▄▄▄██▀▄▄▄▄▀█▄ ▀▄▄▄███████▀▄▄▄▄▀█▄ ▄██▄ ▄█▀▄▄▄▄▀█▄ ▀▄▄▀█▄ ▄▄▄██▀▄▄▄▄ █
//███ █████ ▄▄▄▄▄█ ████ ████ ████▄▄▄▄▀██ █████ ▄▄▄▄▄██ ███████████ ▄▄▄▄▄███ ██ ███ ▄▄▄▄▄██ ███ ██ ██████▄▄▄▄▀█
//██▀ ▀▀▀██▄▀▀▀▀▀█▄▀▀▀▄ ██▀▀ ▀▀█ ▀▀▀▀▄██▄▀▀▀▄█▄▀▀▀▀▀█▀ ▀▀▀████████▄▀▀▀▀▀████  ████▄▀▀▀▀▀█▀ ▀█▀ ▀█▄▀▀▀▄█ ▀▀▀▀▄█
//█████████████████▀▀▀▀▄██████████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████████████████████████████████

ViewManager.prototype.registerTouchEvents = function (canvas) {

	var that = this;


	//----------------------------------
	// touch event support

	function _touchstart(e) {
		e.preventDefault();
		for (var i = 0; i < e.changedTouches.length; i++) {
			that.tapstart(e, { x: e.changedTouches[i].pageX, y: e.changedTouches[i].pageY, id: e.changedTouches[i].identifier });
		}
	}

	function _touchend(e) {
		e.preventDefault();
		for (var i = 0; i < e.changedTouches.length; i++) {
			that.tapend(e, { x: e.changedTouches[i].pageX, y: e.changedTouches[i].pageY, id: e.changedTouches[i].identifier });
		}
	}

	function _touchmove(e) {
		e.preventDefault();
		for (var i = 0; i < e.changedTouches.length; i++) {
			that.tapmove(e, { x: e.changedTouches[i].pageX, y: e.changedTouches[i].pageY, id: e.changedTouches[i].identifier });
		}
	}

	function _touchcancel(e) {
		for (var i = 0; i < e.changedTouches.length; i++) {
			that.tapcancel(e, { x: 0, y: 0, id: -1 });
		}
	}


	//----------------------------------
	// mouse event support

	var mouseData = { x: 0, y: 0, id: 1 };

	function _mousestart(e) {
		e.preventDefault();
		mouseData.x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX - e.currentTarget.offsetLeft;
		mouseData.y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY - e.currentTarget.offsetTop;
		that.tapstart(e, mouseData);
	}

	function _mouseend(e) {
		e.preventDefault();
		mouseData.x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX - e.currentTarget.offsetLeft;
		mouseData.y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY - e.currentTarget.offsetTop;
		that.tapend(e, mouseData);
	}

	function _mousemove(e) {
		e.preventDefault();
		mouseData.x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX - e.currentTarget.offsetLeft;
		mouseData.y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY - e.currentTarget.offsetTop;
		that.tapmove(e, mouseData);
	}

	//----------------------------------
	// gesture support

	function _gesturestart(e) {
		that.gesturestart(e);
	}

	function _gesturechange(e) {
		that.gesturechange(e);
	}

	function _gestureend(e) {
		that.gestureend(e);
	}

	var canTouch = ('ontouchstart' in window && 'ontouchend' in window && 'ontouchmove' in window);
	var canGesture = ('ongesturestart' in window && 'ongesturechange' in window && 'ongestureend' in window);

	if (canTouch) {
		canvas.addEventListener('touchstart', _touchstart, false);
		canvas.addEventListener('touchend', _touchend, false);
		canvas.addEventListener('touchmove', _touchmove, false);
		canvas.addEventListener('touchcancel', _touchcancel, false);
	} else {
		canvas.addEventListener('mousedown', _mousestart, false);
		canvas.addEventListener('mouseup', _mouseend, false);
		canvas.addEventListener('mousemove', _mousemove, false);
	}

	if (canGesture) {
		canvas.addEventListener('gesturestart', _gesturestart, false);
		canvas.addEventListener('gesturechange', _gesturechange, false);
		canvas.addEventListener('gestureend', _gestureend, false);
	}

};


//█████████████████████████████████████████████████████████████████████████
//███▀███████████████████████████████████████████████████████████████▀█████
//██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▀██████████▀▄▄▄▄▀█▄ ▄██▄ ▄█▀▄▄▄▄▀██▄ ▀▄▄▀██▄ ▄▄▄██
//███ ██████▀▄▄▄▄ ███ ███ ██████████ ▄▄▄▄▄███ ██ ███ ▄▄▄▄▄███ ███ ███ █████
//███▄▀▀▀▄██▄▀▀▀▄ ▀██ ▀▀▀▄██████████▄▀▀▀▀▀████  ████▄▀▀▀▀▀██▀ ▀█▀ ▀██▄▀▀▀▄█
//██████████████████▀ ▀████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████


ViewManager.prototype.tapstart = function (e, pos) {
	this.emit('tapstart', e, pos);
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].emit('tapstart', e, pos);
	} else {
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('tapstart', e, pos);
		}
	}
};

ViewManager.prototype.tapmove = function (e, pos) {
	this.emit('tapmove', e, pos);
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].emit('tapmove', e, pos);
	} else {
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('tapmove', e, pos);
		}
	}
};

ViewManager.prototype.tapend = function (e, pos) {
	this.emit('tapend', e, pos);
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].emit('tapend', e, pos);
	} else {
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('tapend', e, pos);
		}
	}
};

//█████████████████████████████████████████████████████████████████████████████████████████████████████████
//███████████████████████████▀███████████████████████████████████████████████████████████████████████▀█████
//██▀▄▄▄▀ ▄█▀▄▄▄▄▀██▀▄▄▄▄ ██▄ ▄▄▄███▄ ██▄ ██▄ ▀▄▄▄██▀▄▄▄▄▀██████████▀▄▄▄▄▀█▄ ▄██▄ ▄█▀▄▄▄▄▀██▄ ▀▄▄▀██▄ ▄▄▄██
//██ ████ ██ ▄▄▄▄▄███▄▄▄▄▀███ ███████ ███ ███ ██████ ▄▄▄▄▄██████████ ▄▄▄▄▄███ ██ ███ ▄▄▄▄▄███ ███ ███ █████
//██▄▀▀▀▄ ██▄▀▀▀▀▀██ ▀▀▀▀▄███▄▀▀▀▄███▄▀▀▄ ▀█▀ ▀▀▀███▄▀▀▀▀▀██████████▄▀▀▀▀▀████  ████▄▀▀▀▀▀██▀ ▀█▀ ▀██▄▀▀▀▄█
//███▀▀▀▀▄█████████████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████

ViewManager.prototype.gesturestart = function (e) {
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].emit('gesturestart', e);
	} else {
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('gesturestart', e);
		}
	}
};

ViewManager.prototype.gesturechange = function (e) {
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].emit('gesturechange', e);
	} else {
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('gesturechange', e);
		}
	}
};


ViewManager.prototype.gestureend = function (e) {
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].emit('gestureend', e);
	} else {
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('gestureend', e);
		}
	}
};


//█████████████████████████████████████████████████████████████████████████████████████████
//██▄ ███████████████████████████████████████████████████████████████▀█████████████████████
//███ █▄ ▄▄█▀▄▄▄▄▀██▄ ▄█▄ ▄█████████▀▄▄▄▄▀█▄ ▄██▄ ▄█▀▄▄▄▄▀██▄ ▀▄▄▀██▄ ▄▄▄███▀▄▄▄▄ █████████
//███ ▄ ████ ▄▄▄▄▄███▄▀█▀▄██████████ ▄▄▄▄▄███ ██ ███ ▄▄▄▄▄███ ███ ███ ███████▄▄▄▄▀█████████
//██▀ ██ ▀▀█▄▀▀▀▀▀████▄▀▄███████████▄▀▀▀▀▀████  ████▄▀▀▀▀▀██▀ ▀█▀ ▀██▄▀▀▀▄██ ▀▀▀▀▄█████████
//███████████████████▀▀ ███████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████

ViewManager.prototype.registerKeyEvents = function () {

	var that = this;

	window.onkeydown = function (e) {
		e.preventDefault();
		that.emit('keydown', e, e.keyCode);
		if (that.popupStack.length !== 0) {
			that.views[that.popupStack[0].view].emit('keydown', e, e.keyCode);
		} else {
			for (var i = 0; i < that.activeViewsLength; i++) {
				that.views[that.activeViews[i]].emit('keydown', e, e.keyCode);
			}
		}
	};

	window.onkeyup = function (e) {
		e.preventDefault();
		that.emit('keyup', e, e.keyCode);
		if (that.popupStack.length !== 0) {
			that.views[that.popupStack[0].view].emit('keyup', e, e.keyCode);
		} else {
			for (var i = 0; i < that.activeViewsLength; i++) {
				that.views[that.activeViews[i]].emit('keyup', e, e.keyCode);
			}
		}
	};
};


//█████████████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████▄ ▄██▄ ▄████▄███████████████████████████
//█▄ ▀▄▀▀▄▀█▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▄▀██▀▄▄▄▀ ▄█▀▄▄▄▄▀██████████▄▀██▀▄███▄▄ ████▀▄▄▄▄▀██▄ ▄█▄ ▄█▀▄▄▄▄ █
//██ ██ ██ █▀▄▄▄▄ ███ ███ ██▀▄▄▄▄ ██ ████ ██ ▄▄▄▄▄███████████ ██ ██████ ████ ▄▄▄▄▄███ █ █ ███▄▄▄▄▀█
//█▀ ▀█ ▀█ █▄▀▀▀▄ ▀█▀ ▀█▀ ▀█▄▀▀▀▄ ▀█▄▀▀▀▄ ██▄▀▀▀▀▀████████████  █████▀▀ ▀▀██▄▀▀▀▀▀███▄▀▄▀▄██ ▀▀▀▀▄█
//███████████████████████████████████▀▀▀▀▄█████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████


ViewManager.prototype.addView = function (name, view) {

	var that = this;

	// add the view

	if (this.views[name]) {
		console.error('[ViewManager] view ' + name + ' cannot be added, a same named view already exists');
		return false;
	}
	this.views[name] = view;
	this.views[name].name = name;

	// init the view (closed by default)

	view.hide();
	view.disable();

	// register the 'opened' , 'closed' , 'udated' events

	var finalizeOpen = function (targetView) {
		return function () {
			// TODO: wait for all currently opening views to open before enabling (BUG !)
			targetView.enable();
		};
	};

	var finalizeClose = function (targetView) {
		return function () {

			var index;

			// was the closed view a popup ?
			if (that.popupStack.length !== 0 && that.popupStack[0].view === targetView.name) {

				// we are closing the current popup
				that.views[that.popupStack[0].view].hide();

				var previousPopup = that.popupStack[0].view;

				// remove the popup from the stack
				that.popupStack.shift();

				if (that.popupStack.length !== 0) {
					// open the next popup in the stack
					that.popupStack[0].options.previousPopup = previousPopup;
					that.views[that.popupStack[0].view].open(that.popupStack[0].data, that.popupStack[0].options);
					that.views[that.popupStack[0].view].show();
				}

				return;
			}

			// remove the view from the activeView array

			targetView.hide();

			// use a second array buffer to avoid view flickering when removing view

			if (that.swapBuffer) {
				index = that.swapBuffer.indexOf(targetView.name);
				if (index === -1) {
					return console.warn('[ViewManager] received a closed event from a non active view');
				}
				that.activeViews.splice(index, 1);
			} else {
				that.swapBuffer = [];
				index = that.activeViews.indexOf(targetView.name);
				if (index === -1) {
					return console.warn('[ViewManager] received a closed event from a non active view');
				}
				for (var i = 0, len = that.activeViewsLength; i < len; i++) {
					if (i !== index) {
						that.swapBuffer.push(that.activeViews[i]);
					}
				}
			}

			// TODO: store the view parameters in historic ? <-- this has to be done somewhere else

		};
	};

	var finalizeRefresh = function (/*targetView*/) {
		return function () {
			// TODO: do we need something ? <-- historic ?
		};
	};

	view.on('opened', finalizeOpen(view));
	view.on('closed', finalizeClose(view));
	view.on('refreshed', finalizeRefresh(view));
};

ViewManager.prototype.reorderView = function () {
	var that = this;
	this.activeViews.sort(function (a, b) {
		return that.views[a].zIndex - that.views[b].zIndex;
	});
};


//█████████████████████████████████████████████████████████
//██▄ ▀▄▄▀██▀▄▄▄▄▀██▄ ▀▄▄▀██▄ ██▄ ██▄ ▀▄▄▀██▀▄▄▄▄ █████████
//███ ███ ██ ████ ███ ███ ███ ███ ███ ███ ███▄▄▄▄▀█████████
//███ ▀▀▀▄██▄▀▀▀▀▄███ ▀▀▀▄███▄▀▀▄ ▀██ ▀▀▀▄██ ▀▀▀▀▄█████████
//██▀ ▀█████████████▀ ▀█████████████▀ ▀████████████████████
//█████████████████████████████████████████████████████████


ViewManager.prototype.openPopup = function (view, data, options) {
	// check if the view isn't already open in normal mode
	var index = this.activeViews.indexOf(view);

	if (index !== -1) {
		return console.warn('[ViewManager] try to open a popup already opened in normal mode');
	}

	// nb : if the view is opened in popup mode, it's ok to add it in the popup stack

	// get a new popud id

	if (this.popupId === Number.MAX_VALUE) {
		this.popupId = 0;
	}
	this.popupId += 1;
	var id = this.popupId;

	// add the popup in the stack

	this.popupStack.push({view: view, data: data, options: options, id: id});

	// if the stack was empty, then open the popup
	if (this.popupStack.length === 1) {

		// emit a tapcancel event to all active views
		for (var i = 0; i < this.activeViewsLength; i++) {
			this.views[this.activeViews[i]].emit('tapcancel');
			// this.views[this.activeViews[i]].disable();
		}

		// open the popup view
		this.views[this.popupStack[0].view].emit('opening');
		this.views[this.popupStack[0].view].open(this.popupStack[0].data, this.popupStack[0].options);
		this.views[this.popupStack[0].view].show();
	}

	// return popup ID if we need to cancel it later
	return id;
};


ViewManager.prototype.closePopup = function (view, options) {

	options = options || {};

	// check that a popup is open
	if (this.popupStack.length === 0) {
		return console.warn('[ViewManager] try to close a popup but popup stack is empty');
	}

	// check that the view is opened as popup
	if (this.popupStack[0].view !== view) {
		return console.warn('[ViewManager] try to close a popup that is not opened');
	}

	// next popup in the stack
	if (this.popupStack.length > 1) {
		options.nextPopup = this.popupStack[1].view;
	}

	// close the actual popup

	this.views[this.popupStack[0].view].emit('closing');
	this.views[this.popupStack[0].view].emit('tapcancel');
	this.views[this.popupStack[0].view].close(options);
	this.views[this.popupStack[0].view].disable();


};

ViewManager.prototype.cancelPopup = function (id) {
	// we can't cancel a popup at index 0, because it is already opened

	for (var i = 1, len = this.popupStack.length; i < len; i++) {
		if (this.popupStack[i].id === id) {

			// remove popup from the stack

			this.popupStack.splice(i, 1);
			return true;
		}
	}
	return false; // popup isn't in the stack or couldn't be canceled
};


//███████████████████████████████████████▀█████████████████████████████████████████████████
//██████████████████████████████████████▀▄████████████▄ ███████████████████████████████████
//██▀▄▄▄▄▀██▄ ▀▄▄▀██▀▄▄▄▄▀██▄ ▀▄▄▀█████▀▄███▀▄▄▄▀ █████ ████▀▄▄▄▄▀██▀▄▄▄▄ ██▀▄▄▄▄▀█████████
//██ ████ ███ ███ ██ ▄▄▄▄▄███ ███ ████▀▄████ ██████████ ████ ████ ███▄▄▄▄▀██ ▄▄▄▄▄█████████
//██▄▀▀▀▀▄███ ▀▀▀▄██▄▀▀▀▀▀██▀ ▀█▀ ▀██▀▄█████▄▀▀▀▀▄███▀▀ ▀▀██▄▀▀▀▀▄██ ▀▀▀▀▄██▄▀▀▀▀▀█████████
//██████████▀ ▀██████████████████████▄█████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████

/**
 * @view : the name of the view
 * @params (Object) : params of the view want to get back when navigating prev, next
 *           or values the views want to pass to themselves
 * @options (Object) : how the view is opened / closed ; do ViewManager need to keep historic, etc.
 */

ViewManager.prototype.open = function (view, data, options) {
	// check if the view isn't opened in normal mode
	var index = this.activeViews.indexOf(view);

	if (index !== -1) {
		console.log(this.activeViews);
		return console.warn('[ViewManager] try to open a view already active : ', view);
	}

	// check if the view isn't opened in popup mode
	index = this.popupStack.indexOf(view);

	if (index !== -1) {
		return console.warn('[ViewManager] try to open a view already opened as popup');
	}

	this.views[view].emit('opening');
	this.views[view].open(data, options);
	this.views[view].show();

	// store view in activeView buffer or swapBuffer
	if (this.swapBuffer) {
		this.swapBuffer.push(view);
	} else {
		this.activeViews.push(view);
		this.activeViewsLength = this.activeViews.length;
	}

	// sort activeView array according to views zIndex
	this.reorderView();
};

ViewManager.prototype.close = function (view, options) {
	// check if the view is open
	var index = this.activeViews.indexOf(view);

	if (index === -1) {
		return console.warn('[ViewManager] try to close a non active view');
	}

	this.views[view].emit('closing');
	this.views[view].emit('tapcancel');
	this.views[view].disable();
	this.views[view].close(options);
};

ViewManager.prototype.refreshView = function (view, data, options) {
	// if we want to change parameters of a view
	// and we want this to be keept in the historic
	// e.g. : translate the same background, foreground of different view

	this.views[view].refresh(data, options);
};


//█████████████████████████████████████████████████████████████████████████
//██▄ █████████▄█████████████▀█████████████████████████▄███████████████████
//███ ▀▄▄▀███▄▄ ████▀▄▄▄▄ ██▄ ▄▄▄███▀▄▄▄▄▀██▄ ▀▄▄▄███▄▄ ████▀▄▄▄▀ █████████
//███ ███ █████ █████▄▄▄▄▀███ ██████ ████ ███ █████████ ████ ██████████████
//██▀ ▀█▀ ▀██▀▀ ▀▀██ ▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▀▄██▀ ▀▀▀████▀▀ ▀▀██▄▀▀▀▀▄█████████
//█████████████████████████████████████████████████████████████████████████

ViewManager.prototype.goNext = function () {
	// go to next state in historic

	// TODO
};

ViewManager.prototype.goBack = function () {
	// go to the previous state in historic

	// TODO
};


ViewManager.prototype.saveState = function () {
	// save the current state as a "stable" state and save it in historic

	// TODO
};

//█████████████████████████████████████████████████████████████████████████████████████████
//██████▄ █████████████████████████████████████████████▄███████████████████████████████████
//██▀▄▄▄▀ ██▄ ▀▄▄▄██▀▄▄▄▄▀██▄ ▄█▄ ▄████████▄ ▄██▄ ▄██▄▄ ████▀▄▄▄▄▀██▄ ▄█▄ ▄█▀▄▄▄▄ █████████
//██ ████ ███ ██████▀▄▄▄▄ ███ █ █ ███████████ ██ ██████ ████ ▄▄▄▄▄███ █ █ ███▄▄▄▄▀█████████
//██▄▀▀▀▄ ▀█▀ ▀▀▀███▄▀▀▀▄ ▀██▄▀▄▀▄████████████  █████▀▀ ▀▀██▄▀▀▀▀▀███▄▀▄▀▄██ ▀▀▀▀▄█████████
//█████████████████████████████████████████████████████████████████████████████████████████


ViewManager.prototype.update = function () {
	this.emit('updating');

	// draw active views
	for (var i = 0; i < this.activeViewsLength; i++) {
		this.views[this.activeViews[i]].render();
	}

	// if there is a popup in the stack, draw it
	if (this.popupStack.length !== 0) {
		this.views[this.popupStack[0].view].render();
	}

	// if view(s) have been closed, swap the activeView buffer
	if (this.swapBuffer) {
		this.activeViews = this.swapBuffer;
		this.activeViewsLength = this.swapBuffer.length;
		this.swapBuffer = false;
	}

	this.emit('updated');
};


//█████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████
//██▀▄▄▄▄▀██▀▄▄▄▀ ██▀▄▄▄▀ ██▀▄▄▄▄▀██▀▄▄▄▄ ██▀▄▄▄▄ ██▀▄▄▄▄▀██▄ ▀▄▄▄██▀▄▄▄▄ █████████████████
//██▀▄▄▄▄ ██ ███████ ███████ ▄▄▄▄▄███▄▄▄▄▀███▄▄▄▄▀██ ████ ███ ███████▄▄▄▄▀█████████████████
//██▄▀▀▀▄ ▀█▄▀▀▀▀▄██▄▀▀▀▀▄██▄▀▀▀▀▀██ ▀▀▀▀▄██ ▀▀▀▀▄██▄▀▀▀▀▄██▀ ▀▀▀███ ▀▀▀▀▄█████████████████
//█████████████████████████████████████████████████████████████████████████████████████████


ViewManager.prototype.getCurrentViews = function () {
	var currentViews = [];
	for (var i = 0; i < this.activeViewsLength; i++) {
		currentViews.push(this.views[this.activeViews[i]]);
	}
	return currentViews;
};


ViewManager.prototype.getView = function (name) {
	var view = this.views[name];
	if (view) {
		return view;
	} else {
		return null;
	}
};