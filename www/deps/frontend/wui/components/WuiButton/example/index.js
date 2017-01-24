
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("Wizcorp-eventemitter/src/EventEmitter.js", function(exports, require, module){
function EventEmitter () { }

EventEmitter.prototype.listeners = function (type) {
  return this.hasOwnProperty.call(this._events || (this._events = {}), type) ? this._events[type] : this._events[type] = [];
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener = function (type, f) {
  if (this._maxListeners !== 0 && this.listeners(type).push(f) > (this._maxListeners || 10)) {
    console && console.warn('Possible EventEmitter memory leak detected. ' + this._events[type].length + ' listeners added. Use emitter.setMaxListeners() to increase limit.');
  }
  this.emit("newListener", type, f);
  return this;
};

EventEmitter.prototype.once = function (type, f) {
  this.on(type, function g () { f.apply(this, arguments); this.removeListener(type, g) });
};

EventEmitter.prototype.removeListener = function (type, f) {
  var i;
  (i = this.listeners(type).indexOf(f)) != -1 && this.listeners(type).splice(i, 1);
  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  for (var k in this._events) {
    (!type || type == k) && this._events[k].splice(0, this._events[k].length);
  }
  return this;
};

EventEmitter.prototype.emit = function (type) {
  var args = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, fns = this.listeners(type).slice(); i < fns.length; i++) {
    fns[i].apply(this, args);
  }
  return fns.length;
};

EventEmitter.prototype.setMaxListeners = function (maxListeners) {
  this._maxListeners = maxListeners;
};

module.exports = EventEmitter;
});
require.register("WuiDom/index.js", function(exports, require, module){
var inherit = require('inherit');
var EventEmitter = require('EventEmitter');

var document = window.document;

// non-touch enabled browser workarounds

var canTouch = ('ontouchstart' in window && 'ontouchend' in window && 'ontouchmove' in window);

var touchToMouseMap = {
	touchstart: 'mousedown',
	touchmove: 'mousemove',
	touchend: 'mouseup',
	touchcancel: false
};


// fixes for unsupported dom events

function translateDomEventName(domEventName) {
	if (!canTouch && touchToMouseMap.hasOwnProperty(domEventName)) {
		return touchToMouseMap[domEventName];
	}

	return domEventName;
}


// HTML creation helper

function createHtmlElement(tagName, options) {
	var key, elm = document.createElement(tagName);

	if (options) {
		if (options.className) {
			elm.className = options.className;
		}

		if (options.style) {
			for (key in options.style) {
				elm.style[key] = options.style[key];
			}
		}

		if (options.attr) {
			for (key in options.attr) {
				elm.setAttribute(key, options.attr[key]);
			}
		}

		if (options.text) {
			elm.innerText = options.text;
		}
	}

	return elm;
}


// Dom class

function Dom() {
	EventEmitter.call(this);
	this.elementIsVisible = true;
}

inherit(Dom, EventEmitter);
module.exports = Dom;


// DOM API:

// Dom#assign makes the given element the rootElement for this component.
// If instead of an HTML element, a tagName and options are given, the element is created and assigned.
// The logic for HTML creation follows the rules of the private createHtmlElement function.

Dom.prototype.assign = function (tagName, options) {
	if (typeof tagName === 'string') {
		// if tagName is a real tag name, create the HTML Element with it

		this.rootElement = createHtmlElement(tagName, options);
	} else if (tagName instanceof window.Element) {
		// the first passed argument already is a real HTML Element

		this.rootElement = tagName;
	} else {
		throw new Error('Dom.assign requires the given argument to be a DOM Element or tagName.');
	}

	if (options && options.hidden) {
		// start hidden
		this.hide();
	}

	return this.rootElement;
};


// Dom#createElement creates an instance of Dom and assigns a newly built HTML element to it,
// following the logic of the private createHtmlElement function.

Dom.prototype.createElement = function (tagName, options) {
	var instance = new Dom();

	instance.assign(tagName, options);

	return instance;
};


// Dom#createChild creates an instance of Dom and assigns a newly built HTML element to it,
// following the logic of the private createHtmlElement function. It is then appended to
// this component.

Dom.prototype.createChild = function (tagName, options) {
	var instance = this.createElement(tagName, options);

	this.appendChild(instance);

	return instance;
};


Dom.prototype.appendTo = function (newParent) {
	newParent.appendChild(this);
};


// override this function to implement custom appendChild behavior

Dom.prototype.appendChild = function (newChild) {
	this.rootElement.appendChild(newChild.rootElement);

	// touch events are known to get lost, so rebind them

	newChild.rebindTouchListeners();

	return newChild;
};


// override this function to implement custom insertBefore behavior

Dom.prototype.insertBefore = function (newNextSibling) {
	newNextSibling.rootElement.parentNode.insertBefore(this.rootElement, newNextSibling.rootElement);

	// touch events are known to get lost, so rebind them

	this.rebindTouchListeners();
};


Dom.prototype.insertChildBefore = function (newChild, newNextSibling) {
	this.rootElement.insertBefore(newChild.rootElement, newNextSibling.rootElement);

	// touch events are known to get lost, so rebind them

	newChild.rebindTouchListeners();
};


// timers (for internal use)

Dom.prototype.setTimer = function (id, fn, interval) {
	this.clearTimer(id);

	this.timers = this.timers || {};

	var handle = window.setTimeout(function (that) {
		delete that.timers[handle];

		fn.call(that);
	}, interval, this);

	this.timers[id] = handle;
};


Dom.prototype.clearTimer = function (id) {
	if (!this.timers) {
		return;
	}

	var handle = this.timers[id];

	if (handle) {
		window.clearTimeout(handle);

		delete this.timers[id];
	}
};


// content: html and text

Dom.prototype.setHtml = function (value, interval) {
	// if value is a function, execute it and use the return value as text
	// if an interval is given, repeat the given function every N msec until setHtml is called again, or the component is destroyed
	// if value is not a function, use its string representation as html string

	if (typeof value === 'function') {
		var fn = value;
		value = fn();

		if (interval) {
			this.setTimer('content', function () {
				this.setHtml(fn, interval);
			}, interval);
		} else {
			this.clearTimer('content');
		}
	} else {
		this.clearTimer('content');
	}

	this.rootElement.innerHTML = value;
};


Dom.prototype.setText = function (value, interval) {
	// if value is a function, execute it and use the return value as text
	// if an interval is given, repeat the given function every N msec until setText is called again, or the component is destroyed
	// if value is not a function, use its string representation as text

	if (value === null || value === undefined) {
		return;
	}

	value = value.valueOf();

	if (typeof value === 'function') {
		var fn = value;
		value = fn();

		if (interval) {
			this.setTimer('content', function () {
				this.setText(fn, interval);
			}, interval);
		} else {
			this.clearTimer('content');
		}
	} else {
		this.clearTimer('content');
	}

	if (value !== this.currentTextContent) {
		this.currentTextContent = value;
		this.rootElement.innerText = value;
	}
};


Dom.prototype.getText = function () {
	return this.currentTextContent;
};


// style accessors

Dom.prototype.setStyle = function (property, value) {
	this.rootElement.style[property] = value;
};


Dom.prototype.setStyles = function (map) {
	var s = this.rootElement.style;

	for (var key in map) {
		s[key] = map[key];
	}
};


Dom.prototype.unsetStyle = function (property) {
	this.rootElement.style[property] = null;
};


Dom.prototype.getStyle = function (property) {
	return this.rootElement.style[property];
};


Dom.prototype.getComputedStyle = function (property) {
	var cssValue = window.getComputedStyle(this.rootElement).getPropertyCSSValue(property);

	return cssValue ? cssValue.cssText : undefined;
};


// className accessors

function parseClassNames(str) {
	return (str.indexOf(' ') === -1) ? [str] : str.trim().split(/\s+/);
}


function joinArgumentsAsClassNames(base, args) {
	var str = base;

	if (!str) {
		str = args[0];
	} else {
		str += ' ' + args[0];
	}

	for (var i = 1, len = args.length; i < len; i++) {
		str += ' ' + args[i];
	}

	return str;
}


function uniqueClassNames(str) {
	var classNames = parseClassNames(str);
	var uniqueClassNames = {};

	for (var i = 0, len = classNames.length; i < len; i++) {
		var className = classNames[i];
		uniqueClassNames[className] = null;
	}

	return Object.keys(uniqueClassNames).join(' ');
}


function removeClassNames(baseList, args) {
	// removes the (unparsed) class names in args from baseList
	// baseList is required to be an array (not a string)
	// args is expected to be an arguments object or array

	for (var i = 0, len = args.length; i < len; i++) {
		var parsed = parseClassNames(args[i]);

		for (var j = 0, jlen = parsed.length; j < jlen; j++) {
			var index = baseList.indexOf(parsed[j]);

			if (index !== -1) {
				baseList.splice(index, 1);
			}
		}
	}

	return baseList.join(' ');
}


Dom.prototype.getClassNames = function () {
	// returns an array of all class names

	return parseClassNames(this.rootElement.className);
};


Dom.prototype.hasClassName = function (className) {
	// returns true/false depending on the given className being present

	return this.getClassNames().indexOf(className) !== -1;
};


Dom.prototype.setClassNames = function (className) {
	// allows for adding multiples in separate arguments, space separated or a mix

	if (arguments.length > 1) {
		className = joinArgumentsAsClassNames('', arguments);
	}

	this.rootElement.className = className;
};


Dom.prototype.addClassNames = function () {
	// allows for adding multiples in separate arguments, space separated or a mix

	var classNames = joinArgumentsAsClassNames(this.rootElement.className, arguments);
	this.rootElement.className = uniqueClassNames(classNames);
};


Dom.prototype.replaceClassNames = function (delList, addList) {
	// adds all classNames in addList and removes the ones in delList

	var current = parseClassNames(joinArgumentsAsClassNames(this.rootElement.className, addList));

	this.rootElement.className = removeClassNames(current, delList);
};


Dom.prototype.delClassNames = function () {
	// allows for deleting multiples in separate arguments, space separated or a mix

	this.rootElement.className = removeClassNames(this.getClassNames(), arguments);
};


// finding sub-elements

Dom.prototype.query = function (selector) {
	var elm;

	if (this._queryCache) {
		elm = this._queryCache[selector];
	} else {
		this._queryCache = {};
	}

	if (!elm) {
		elm = this._queryCache[selector] = this.rootElement.querySelector(selector);
	}

	return elm;
};


Dom.prototype.queryAll = function (selector) {
	var elm;

	if (this._queryAllCache) {
		elm = this._queryAllCache[selector];
	} else {
		this._queryAllCache = {};
	}

	if (!elm) {
		elm = this._queryAllCache[selector] = this.rootElement.querySelectorAll(selector);
	}

	return elm;
};


// cleanup

Dom.prototype.destroy = function () {
	this.emit('destroy');

	// destroy caches

	delete this._queryCache;
	delete this._queryAllCache;

	// cleanup DOM tree

	var elm = this.rootElement;

	if (elm) {
		// release DOM from parent element

		if (elm.parentElement) {
			elm.parentElement.removeChild(elm);
		}

		// drop DOM references

		this.rootElement = null;
	}

	// drop any built-in timers

	if (this.timers) {
		for (var id in this.timers) {
			this.clearTimer(id);
		}
	}

	// drop any remaining event listeners

	this.removeAllListeners();
};


// default show/hide implementation

Dom.prototype.showMethod = function () {
	this.rootElement.style.display = '';
};

Dom.prototype.hideMethod = function () {
	this.rootElement.style.display = 'none';
};

Dom.prototype.show = function (data) {
	this.emit('show', data);
	this.elementIsVisible = true;
	this.showMethod();
};

Dom.prototype.hide = function (data) {
	this.emit('hide', data);
	this.elementIsVisible = false;
	this.hideMethod();
};

Dom.prototype.isVisible = function () {
	return this.elementIsVisible;
};


// DOM events

var domEventPrefix = 'dom';


Dom.prototype.rebindTouchListeners = function () {
	if (this.domListeners) {
		var elm = this.rootElement;

		for (var domEventName in this.domListeners) {
			if (!domEventName.match(/^touch/)) {
				continue;
			}

			var fn = this.domListeners[domEventName];

			elm.removeEventListener(domEventName, fn);
			elm.addEventListener(domEventName, fn);
		}
	}
};


Dom.prototype.allowDomEvents = function () {
	if (this.domListeners) {
		// already set
		return;
	}

	var that = this;
	this.domListeners = {};


	this.on('newListener', function (evt) {
		var evtNameParts = evt.split('.');

		if (evtNameParts[0] !== domEventPrefix) {
			return;
		}

		// translate the dom event name for compatibility reasons

		var domEventName = translateDomEventName(evtNameParts[1]);

		// if we're not yet listening for this event, add a dom event listener that emits dom events

		if (domEventName && !that.domListeners[domEventName]) {
			var fn = function (e) {
				that.emit(evt, e);
			};

			if (domEventName === 'mousedown' || domEventName === 'mousemove') {
				// on desktop, only allow left-mouse clicks to fire events

				fn = function (e) {
					if (e.which === 1) {
						that.emit(evt, e);
					}
				};
			}

			that.domListeners[domEventName] = fn;

			that.rootElement.addEventListener(domEventName, fn);
		}
	});

	this.on('removeListener', function (evt) {
		// when the last event listener for this event gets removed, we stop listening for DOM events

		if (that.listeners(evt).length === 0) {
			var evtNameParts = evt.split('.');

			if (evtNameParts[0] !== domEventPrefix) {
				return;
			}

			var domEventName = translateDomEventName(evtNameParts[1]);

			var fn = that.domListeners[domEventName];

			if (fn) {
				that.rootElement.removeEventListener(domEventName, fn);

				delete that.domListeners[domEventName];
			}
		}
	});

	this.on('destroy', function () {
		// destroy DOM event listeners

		for (var domEventName in that.domListeners) {
			var fn = that.domListeners[domEventName];

			that.rootElement.removeEventListener(domEventName, fn);
		}

		that.domListeners = {};
	});
};



});
require.register("wuiButtonBehavior/index.js", function(exports, require, module){
// system wide, can't tap another button

var disableAll = false;

// system wide, one can only tap one button at a time

var current = null;

function getTouchPos(domEvent) {
	var targetTouch = domEvent.targetTouches ? domEvent.targetTouches[0] : null;

	if (targetTouch) {
		return [targetTouch.pageX, targetTouch.pageY];
	}

	return [domEvent.pageX, domEvent.pageY];
}


function setActiveButton(button) {
	if (current) {
		current.emit('tapend', true);
	}

	current = button;
}

function setDisableAll(repeatDelay) {
	if (repeatDelay !== null && repeatDelay >= 0) {
		disableAll = true;
		window.setTimeout(function () {
			disableAll = false;
		}, repeatDelay);
	}
}


// buttonBehavior is wuiButtonBehavior
// arguments:
//   button: a component to turn into a button
//   options: a map with the following (all optional) properties:
//     - disabled (boolean):           the button starts as unresponsive (call .enable() to turn it on)
//     - maxDeviation (int):           the maximum distance in px in both X and Y axis that
//                                     the finger may move before the tap is cancelled.
//     - tapDelay (int):               the delay in msec before tap is emitted (disabled by default).
//     - repeatDelay (int):            the delay before which a button is tappable again (disabled by default).
//     - isRepeatable (boolean):         the button emits tap events when held down (default: false).
//     - repeatableInitialDelay (int): the delay in msec before the button begins repeating (default: 500).
//     - repeatableDelay (int):        the delay in msec for subsequent repeats (default: 200).
//     - toggle (object):
//       - values (array):             all values the button can toggle between, which are emitted through the
//                                     toggle event that fires immediately after the tap event.
//       - defaultValue (mixed):       the value that the toggle-button starts with.

function buttonBehavior(button, options) {
	// parse options

	if (!options) {
		options = {};
	}

	// option: disabled (off by default, can be true in order to disable the button from the start)

	var isEnabled = !options.disabled;

	// option: maxDeviation (20 by default, max N pixels finger movement for a tap to be considered successful)

	var maxDeviation = options.maxDeviation || 20;

	// option: tapDelay (delay in msec after which tap events are emitted)

	var tapDelay = (typeof options.tapDelay === 'number') ? options.tapDelay : null;

	var repeatDelay = (typeof options.repeatDelay === 'number') ? options.repeatDelay : null;

	var isRepeatable = options.isRepeatable ? options.isRepeatable : false;

	var repeatableInitialDelay = (typeof options.repeatableInitialDelay === 'number') ? options.repeatableInitialDelay : 500;

	var repeatableDelay = (typeof options.repeatableDelay === 'number') ? options.repeatableDelay : 200;

	// This holds our repeatable timer so we can cancel it on tapend.
	var repeatableTimeout;

	// option: toggle (emits "togggle" event and iterates through given values)
	// eg: { values: [1,2,3,4], defaultValue: 3 }

	if (options.toggle) {
		var toggle = options.toggle;
		var selectedIndex = toggle.hasOwnProperty('defaultValue') ? toggle.values.indexOf(toggle.defaultValue) : 0;

		button.on('tap', function () {
			selectedIndex += 1;

			if (selectedIndex >= toggle.values.length) {
				selectedIndex = 0;
			}

			button.emit('toggle', toggle.values[selectedIndex]);
		});
	}

	// set up button-wide variables and start the Dom event system

	var startPos;
	var fnOverride;

	button.allowDomEvents();


	// enabling/disabling the button

	button.enable = function () {
		isEnabled = true;

		button.emit('enabled');
	};


	button.disable = function () {
		// disabling while being tapped should trigger a cancel

		if (current === button) {
			button.emit('tapend', true);
		}

		isEnabled = false;

		var argLen = arguments.length;

		if (argLen === 0) {
			button.emit('disabled');
		} else if (argLen === 1) {
			button.emit('disabled', arguments[0]);
		} else {
			var args = new Array(argLen + 1);

			args[0] = 'disabled';

			for (var i = 0; i < argLen; i++) {
				args[i + 1] = arguments[i];
			}

			button.emit.apply(button, args);
		}
	};


	// tap override callback management

	button.startTapOverride = function (fn) {
		fnOverride = fn;
	};


	button.stopTapOverride = function () {
		fnOverride = null;
	};


	button.on('dom.touchstart', function touchstart(domEvent) {
		if (!isEnabled || disableAll) {
			return;
		}

		// if another button was active, cancel it and make this button the active one
		setActiveButton(button);

		// prevent other buttons to fire during a certain time (repeatDelay)
		setDisableAll(repeatDelay);

		startPos = getTouchPos(domEvent);

		button.emit('tapstart');
	});


	button.on('dom.touchmove', function touchmove(domEvent) {
		if (!isEnabled) {
			return;
		}

		if (startPos) {
			var pos = getTouchPos(domEvent);
			var x = Math.abs(pos[0] - startPos[0]);
			var y = Math.abs(pos[1] - startPos[1]);

			if (x > maxDeviation || y > maxDeviation) {
				button.emit('tapend', true);
			}
		}
	});


	button.on('dom.touchend', function touchend() {
		if (!isEnabled) {
			return;
		}

		if (current) {
			button.emit('tapend', false);
		}
	});


	button.on('dom.touchcancel', function touchcancel() {
		if (!isEnabled) {
			return;
		}

		button.emit('tapend', true);
	});

	button.on('tapstart', function () {
		if (isRepeatable) {
			// We do an initial tap and then wait for the initial delay.
			button.emit('tap');
			repeatableTimeout = window.setTimeout(repeatTap, repeatableInitialDelay);
		}
	});

	function repeatTap() {
		// Send another tap and wait for the shorter delay.
		button.emit('tap');
		repeatableTimeout = window.setTimeout(repeatTap, repeatableDelay);
	}

	button.on('tapend', function (wasCancelled) {
		// could be called by other sources, or multiple times

		current = null;
		startPos = null;

		if (isRepeatable) {
			window.clearTimeout(repeatableTimeout);
			repeatableTimeout = null;
			return;
		}

		if (wasCancelled) {
			return;
		}

		// tap success!

		if (fnOverride) {
			fnOverride();
		} else {
			if (tapDelay === null) {
				button.emit('tap');
			} else {
				window.setTimeout(function () {
					button.emit('tap');
				}, tapDelay);
			}
		}
	});
}

module.exports = buttonBehavior;

});
require.register("WuiButton/script.js", function(exports, require, module){
var inherit = require('inherit');
var Dom = require('WuiDom');
var buttonBehavior = require('wuiButtonBehavior');

var wui = window.wui;

/**
 * @param {String} caption
 * @class
 * @augment Dom
 */
function WuiButton(caption) {
	Dom.call(this);
	this.assign('div', { className: 'WuiButton', text: caption });
	buttonBehavior(this);
}

inherit(WuiButton, Dom);
module.exports = WuiButton;

});
require.alias("component-inherit/index.js", "WuiButton/deps/inherit/index.js");

require.alias("WuiDom/index.js", "WuiButton/deps/WuiDom/index.js");
require.alias("component-inherit/index.js", "WuiDom/deps/inherit/index.js");

require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "WuiDom/deps/EventEmitter/src/EventEmitter.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "WuiDom/deps/EventEmitter/index.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "Wizcorp-eventemitter/index.js");

require.alias("wuiButtonBehavior/index.js", "WuiButton/deps/wuiButtonBehavior/index.js");

require.alias("WuiButton/script.js", "WuiButton/index.js");

