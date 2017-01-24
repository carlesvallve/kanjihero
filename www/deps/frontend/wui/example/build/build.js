
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
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
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
require.register("NavTree/index.js", function(exports, require, module){
var inherit = require('inherit');
var EventEmitter = require('EventEmitter');

var STATE_CLOSED = 0;
var STATE_PREPARED = 1;
var STATE_OPENED = 2;


// history object

function NavTreeHistory() {
	EventEmitter.call(this);
	this.nodes = [];
	this.index = -1;
}


inherit(NavTreeHistory, EventEmitter);

NavTreeHistory.prototype._moveTo = function (index) {
	this.index = index;
	this.emit('move', this.index, this.nodes[this.index]);
};


NavTreeHistory.prototype.current = function () {
	return this.nodes[this.index];	// undefined if the list is empty
};


NavTreeHistory.prototype.isEmpty = function () {
	return this.nodes.length === 0;
};


NavTreeHistory.prototype.clear = function () {
	this.nodes = [];
	this._moveTo(-1);
};


NavTreeHistory.prototype.clearPast = function () {
	if (this.index > 0) {
		this.nodes.splice(0, this.index);
		this._moveTo(0);
	}
};


NavTreeHistory.prototype.clearFuture = function () {
	this.nodes.splice(this.index + 1);
};


NavTreeHistory.prototype.resetToCurrent = function () {
	var node = this.nodes[this.index];

	if (node) {
		this.nodes = [node];
		this._moveTo(0);
	} else {
		this.clear();
	}
};


NavTreeHistory.prototype.add = function (node) {
	var index = this.index + 1;

	// drop all nodes starting at the new index, and add the node to the end

	this.nodes.splice(index, this.nodes.length, node);

	// increment the index

	this._moveTo(index);
};


NavTreeHistory.prototype.replace = function (node, protectFuture) {
	var index = this.index;

	if (index < 0) {
		// if there were no elements before, we want to write to index 0

		index = 0;
	}

	if (protectFuture) {
		this.nodes[index] = node;
	} else {
		// drop all nodes starting at index, and add the node to the end

		this.nodes.splice(index, this.nodes.length, node);
	}

	this._moveTo(index);
};


NavTreeHistory.prototype.back = function () {
	var index = this.index - 1;
	var node = this.nodes[index];

	if (index >= -1) {
		this._moveTo(index);

		if (node) {
			return node;
		}
	}

	// else undefined
};


NavTreeHistory.prototype.forward = function () {
	var index = this.index + 1;
	var node = this.nodes[index];

	if (node) {
		this._moveTo(index);

		return node;
	}

	// else undefined
};


/**
 * @class
 * @classDesc nav tree implementation
 * @param {Object} options
 * @param {Object} [creationOptions]
 */
function NavTree(options, creationOptions) {
	EventEmitter.call(this);

	this.tree = {};             // collection of objects to which we can navigate, indexed by name
	this.nodeQueue = [];        // FIFO
	this.stack = new NavTreeHistory();

	this.options = options || {};
	this.creationOptions = creationOptions || {};

	if (!this.options.hasOwnProperty('createOnRegister')) {
		this.options.createOnRegister = false;
	}
}


inherit(NavTree, EventEmitter);
module.exports = NavTree;


NavTree.prototype.branch = function (creationOptions, cbCollapse) {
	// create a new NavTree

	var subTree = new NavTree(this.options, creationOptions);

	// give the new tree access to the same items that the source tree has access to

	subTree.tree = this.tree;
	subTree.cbCollapse = cbCollapse;

	return subTree;
};


NavTree.prototype.register = function (name, item, options) {
	this.tree[name] = item;
	options = options || {};
	if ((this.options.createOnRegister && options.create !== false) || options.create) {
		this._createItem(name);
	}
};


NavTree.prototype.getItem = function (name) {
	return this.tree[name];
};


NavTree.prototype._createNode = function (name, params, closeCb) {
	var item = this.tree[name];

	if (!item) {
		console.error('NavTree item', name, 'not found.');
		return null;
	}

	if (!item._isCreated) {
		this._createItem(name);
	}

	return {
		name: name,
		params: params,
		item: item,
		state: STATE_CLOSED,
		closeCb: closeCb
	};
};


NavTree.prototype.rebindItem = function (item) {
	var navTree = this;

	item.getNavTree = function () {
		return navTree;
	};
};


NavTree.prototype._createItem = function (name) {
	var item = this.tree[name];
	this.rebindItem(item);

	if (item.create) {
		item.create(this.creationOptions, name);
	}

	item._isCreated = true;
};


NavTree.prototype._closeNode = function (node, response) {
	if (node && node.state !== STATE_CLOSED) {
		// only non-closed nodes can be closed

		this.emit('close', node.name);

		if (node.item.close) {
			node.item.close(response);
		}

		node.state = STATE_CLOSED;

		if (node.closeCb) {
			node.closeCb(response);
			node.closeCb = null;
		}
	}
};


NavTree.prototype._closeCurrentNode = function (response) {
	this._closeNode(this.stack.current(), response);
};


NavTree.prototype._openNode = function (node) {
	// call the beforeopen event if the node wasn't prepared yet

	var replacement, replacementNode;

	if (node.state === STATE_CLOSED && node.item.beforeopen) {
		// replacement is an object { name: 'item name', params: { anything } }

		replacement = node.item.beforeopen(node.params);

		if (replacement) {
			replacementNode = this._createNode(replacement.name, replacement.params);
		}
	}

	// beforeopen event handlers could have injected a node, meaning we have to postpone opening this node

	if (replacementNode) {
		// enqueue the node (first in line), and tag it as prepared, since beforeopen() has been called

		node.state = STATE_PREPARED;

		this.nodeQueue.unshift(node);

		node = this._openNode(replacementNode);

	} else {
		// call item.open() and set the node state to opened.

		node.state = STATE_OPENED;

		this.rebindItem(node.item);

		node.item.open(node.params);

		this.emit('open', node.name, node.params);
	}

	return node;
};


function defaultTransition(from, to, cb) {
	window.setTimeout(cb, 0);
}


NavTree.prototype._transitionNodes = function (from, to, transition) {
	if (!from) {
		to.item.emit('opening', to.params);

		this._openNode(to);
		to.item.open(to.params);

		return window.setTimeout(function () {
			to.item.emit('opened', to.params);
		}, 0);
	}

	var self = this;

	from.item.emit('closing', from.params);
	to.item.emit('opening', to.params);

	window.setTimeout(function () {
		from.item.emit('moving');
		to.item.emit('moving');

		transition = transition || defaultTransition;

		transition(from.item, to.item, function () {
			from.item.emit('moved', from.params);
			to.item.emit('moved', to.params);

			window.setTimeout(function () {
				from.item.emit('closed', from.params);
				to.item.emit('opened', to.params);

				self._closeNode(from);
			}, 0);
		});

		self._openNode(to);
	}, 0);
};


/**
* NavTree.open opens a node with the given parameters.
* If there is an active node, it will be closed automatically.
* If cb is given, it will be called on close.
*/

NavTree.prototype.open = function (name, params, transition, cb) {
	var from = this.stack.current();
	var to = this._createNode(name, params, cb);

	if (from && from.name === to.name) {
		from = null;
	}

	if (to) {
		this._transitionNodes(from, to, transition);
		this.stack.add(to);

	}
};


NavTree.prototype.enqueue = function (name, params, transition, cb) {
	if (this.stack.isEmpty()) {
		// nothing is active now, so we instantly open the node

		this.open(name, params, transition, cb);
	} else {
		// something is already active, so we append to the end of the queue

		var node = this._createNode(name, params, cb);

		if (node) {
			this.nodeQueue.push({ node: node, transition: transition });
		}
	}
};


NavTree.prototype.replace = function (name, params, transition, cb) {
	// like open, but replaces the current node in the history stack
	// ignores the queue

	var from = this.stack.current();
	var to = this._createNode(name, params, cb);

	if (to) {
		this._transitionNodes(from, to, transition);
		this.stack.replace(to);

	}
};


NavTree.prototype.back = function (transition) {
	var from = this.stack.current();
	var to = this.stack.back();

	if (to) {
		this._transitionNodes(from, to, transition);
		return true;
	}

	return false;
};


NavTree.prototype.forward = function (transition) {
	var from = this.stack.current();
	var to = this.stack.forward();

	if (to) {
		this._transitionNodes(from, to, transition);
		return true;
	}

	return false;
};


NavTree.prototype.close = function (response) {
	// manual close
	// that means we open the first queued node, or if none are available, we consider this a "back" request.

	// try to open a queued node

	var queue = this.nodeQueue.shift();

	if (queue) {

		this.replace(queue.node.name, null, queue.transition);

	} else {
		// there was no queued node, so we execute a back() request

		this._closeCurrentNode(response);
		var wentBack = this.back();

		// drop everything after the current node (if there is no current node, it will just clear all)

		this.stack.clearFuture();

		if (!wentBack) {
			// if there was no node to go back to, the navTree can be considered empty

			if (this.cbCollapse) {
				// call the collapse callback

				this.cbCollapse();
			}
		}
	}
};


NavTree.prototype.clearHistory = function () {
	// cleanup function to be called whenever hitting a point
	// where no back-option is available, like a main-screen.

	this.stack.resetToCurrent();
};

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


/**
 * Fixes for unsupported dom events
 * @private
 * @param {DomEvent} domEventName
 */
function translateDomEventName(domEventName) {
	if (!canTouch && touchToMouseMap.hasOwnProperty(domEventName)) {
		return touchToMouseMap[domEventName];
	}

	return domEventName;
}


/**
 * HTML creation helper
 * @private
 * @param {String} tagName
 * @param {Object} [options]
 */
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

	}

	return elm;
}


/**
 * @class
 * @classDesc blah
 * @augments EventEmitter
 */
function WuiDom() {
	EventEmitter.call(this);
	this.elementIsVisible = true;
	this.currentTextContent = null;
	this.text = null;
}

inherit(WuiDom, EventEmitter);
module.exports = WuiDom;


/**
 * Makes the given element the rootElement for this component.
 * If instead of an HTML element, a tagName and options are given, the element is created and assigned.
 * The logic for HTML creation follows the rules of the private createHtmlElement function.
 * @param {String} tagName
 * @param {Object} [options]
 */
WuiDom.prototype.assign = function (tagName, options) {
	if (typeof tagName === 'string') {
		// if tagName is a real tag name, create the HTML Element with it

		this.rootElement = createHtmlElement(tagName, options);
		if (options && options.hasOwnProperty('text')) {
			this.setText(options.text);
		}
	} else if (tagName instanceof window.Element) {
		// the first passed argument already is a real HTML Element

		this.rootElement = tagName;
	} else {
		throw new Error('WuiDom.assign requires the given argument to be a DOM Element or tagName.');
	}

	if (options && options.hidden) {
		// start hidden
		this.hide();
	}

	return this.rootElement;
};


/**
 * Creates an instance of WuiDom and assigns a newly built HTML element to it,
 * following the logic of the private createHtmlElement function.
 * @param {String} tagName
 * @param {Object} [options]
 * @returns {WuiDom}
 */
WuiDom.prototype.createElement = function (tagName, options) {
	var instance = new WuiDom();

	instance.assign(tagName, options);

	return instance;
};


/**
 * Creates an instance of WuiDom and assigns a newly built HTML element to it,
 * following the logic of the private createHtmlElement function. It is then appended to
 * this component.
 * @param {String} tagName
 * @param {Object} [options]
 * @returns {WuiDom}
 */
WuiDom.prototype.createChild = function (tagName, options) {
	var instance = this.createElement(tagName, options);

	this.appendChild(instance);

	return instance;
};

/**
 * @param {WuiDom} newParent
 */
WuiDom.prototype.appendTo = function (newParent) {
	newParent.appendChild(this);
};


// override this function to implement custom appendChild behavior
/**
 * @param {WuiDom} newChild
 */
WuiDom.prototype.appendChild = function (newChild) {
	this.rootElement.appendChild(newChild.rootElement);

	// touch events are known to get lost, so rebind them

	newChild.rebindTouchListeners();

	return newChild;
};


// override this function to implement custom insertBefore behavior
/**
 * @param {WuiDom} newNextSibling
 */
WuiDom.prototype.insertBefore = function (newNextSibling) {
	newNextSibling.rootElement.parentNode.insertBefore(this.rootElement, newNextSibling.rootElement);

	// touch events are known to get lost, so rebind them

	this.rebindTouchListeners();
};

/**
 * @param {WuiDom} newChild
 * @param {WuiDom} newNextSibling
 */
WuiDom.prototype.insertChildBefore = function (newChild, newNextSibling) {
	this.rootElement.insertBefore(newChild.rootElement, newNextSibling.rootElement);

	// touch events are known to get lost, so rebind them

	newChild.rebindTouchListeners();
};


/**
 * Timers (for internal use)
 * @param {Number} id
 * @param {Function} fn
 * @param {Number} interval
 */
WuiDom.prototype.setTimer = function (id, fn, interval) {
	this.clearTimer(id);

	this.timers = this.timers || {};

	var handle = window.setTimeout(function (that) {
		delete that.timers[handle];

		fn.call(that);
	}, interval, this);

	this.timers[id] = handle;
};

/**
 * Timers (for internal use)
 * @param {Number} id
 */
WuiDom.prototype.clearTimer = function (id) {
	if (!this.timers) {
		return;
	}

	var handle = this.timers[id];

	if (handle) {
		window.clearTimeout(handle);

		delete this.timers[id];
	}
};


/**
 * Content: html and text
 * - if value is a function, execute it and use the return value as text
 * - if an interval is given, repeat the given function every N msec until setHtml is called again, or the component is destroyed
 * - if value is not a function, use its string representation as html string
 * @param {String|Function} value
 * @param {Number} [interval]
 */
WuiDom.prototype.setHtml = function (value, interval) {

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

/**
 * - if value is a function, execute it and use the return value as text
 * - if an interval is given, repeat the given function every N msec until setText is called again, or the component is destroyed
 * - if value is not a function, use its string representation as text
 * @param {String|Function} value
 * @param {Number} [interval]
 */
WuiDom.prototype.setText = function (value, interval) {
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

	if (this.currentTextContent === null) {
		this.text = document.createTextNode("");
		this.rootElement.appendChild(this.text);
	}

	if (value !== this.currentTextContent) {
		this.currentTextContent = value;
		this.text.nodeValue = value;
	}
};

/**
 * @returns {String}
 */
WuiDom.prototype.getText = function () {
	return this.currentTextContent;
};


/**
 * style accessors
 * @param {String} property
 * @param {String|Number} value
 */
WuiDom.prototype.setStyle = function (property, value) {
	this.rootElement.style[property] = value;
};

/**
 * @param {Object} map - CSS properties
 */
WuiDom.prototype.setStyles = function (map) {
	var s = this.rootElement.style;

	for (var key in map) {
		s[key] = map[key];
	}
};

/**
 * @param {String} property
 */
WuiDom.prototype.unsetStyle = function (property) {
	this.rootElement.style[property] = null;
};

/**
 * @param {String} property
 * @returns {String}
 */
WuiDom.prototype.getStyle = function (property) {
	return this.rootElement.style[property];
};

/**
 * @param {String} property
 * @returns {String}
 */
WuiDom.prototype.getComputedStyle = function (property) {
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

/**
 * @returns {Array}
 */
WuiDom.prototype.getClassNames = function () {
	// returns an array of all class names

	return parseClassNames(this.rootElement.className);
};

/**
 * @param {String} className
 * @returns {Boolean}
 */
WuiDom.prototype.hasClassName = function (className) {
	// returns true/false depending on the given className being present

	return this.getClassNames().indexOf(className) !== -1;
};

/**
 * @param {...String} className
 */
WuiDom.prototype.setClassNames = function (className) {
	// allows for adding multiples in separate arguments, space separated or a mix

	if (arguments.length > 1) {
		className = joinArgumentsAsClassNames('', arguments);
	}

	this.rootElement.className = className;
};

/**
 * @param {...String} classNames
 */
WuiDom.prototype.addClassNames = function (classNames) {
	// allows for adding multiples in separate arguments, space separated or a mix

	classNames = joinArgumentsAsClassNames(this.rootElement.className, arguments);
	this.rootElement.className = uniqueClassNames(classNames);
};

/**
 * @param {Array} delList
 * @param {Array} addList
 */
WuiDom.prototype.replaceClassNames = function (delList, addList) {
	// adds all classNames in addList and removes the ones in delList

	var current = parseClassNames(joinArgumentsAsClassNames(this.rootElement.className, addList));

	this.rootElement.className = removeClassNames(current, delList);
};

/**
 * Allows for deleting multiples in separate arguments, space separated or a mix
 * @param {...String} classNames
 */
WuiDom.prototype.delClassNames = function (classNames) {
	classNames = classNames;
	this.rootElement.className = removeClassNames(this.getClassNames(), arguments);
};


/**
 * Finding sub-elements
 * @param {String} selector
 * @returns {*}
 */
WuiDom.prototype.query = function (selector) {
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

/**
 * @param {String} selector
 * @returns {*}
 */
WuiDom.prototype.queryAll = function (selector) {
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


/**
 * Cleanup
 */
WuiDom.prototype.destroy = function () {
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


/**
 * Default show implementation
 */
WuiDom.prototype.showMethod = function () {
	this.rootElement.style.display = '';
};

/**
 * Default hide implementation
 */
WuiDom.prototype.hideMethod = function () {
	this.rootElement.style.display = 'none';
};

/**
 * @param {*} data
 */
WuiDom.prototype.show = function (data) {
	this.emit('show', data);
	this.elementIsVisible = true;
	this.showMethod();
};

/**
 * @param {*} data
 */
WuiDom.prototype.hide = function (data) {
	this.emit('hide', data);
	this.elementIsVisible = false;
	this.hideMethod();
};

/**
 * @returns {Boolean}
 */
WuiDom.prototype.isVisible = function () {
	return this.elementIsVisible;
};


// DOM events

var domEventPrefix = 'dom';

/**
 * rebindTouchListeners
 */
WuiDom.prototype.rebindTouchListeners = function () {
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

/**
 * @param {Tome} tome
 * @param {Function} cb - Update function. Receive current and old value
 */
WuiDom.prototype.bindToTome = function (tome, cb) {

	var self = this;

	if (!cb) {
		cb = function (value) {
			self.setText(value);
		}
	}

	function update(was) {
		cb(this.valueOf(), was);
	}

	tome.on('readable', update);
	cb(tome.valueOf());

	this.on('destroy', function () {
		tome.removeListener('readable', update);
	});
};


/**
 * allowDomEvents
 */
WuiDom.prototype.allowDomEvents = function () {
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
require.register("WuiView/index.js", function(exports, require, module){
var inherit = require('inherit');
var WuiDom = require('WuiDom');

/**
 * @class
 * @classDesc
 * @augments WuiDom
 */
function WuiView() {
	WuiDom.call(this);
	this.assign('div', { className: 'WuiView' });
	this.hideMethod();
}

inherit(WuiView, WuiDom);
module.exports = WuiView;

/**
 * @param options
 * @param itemName
 */
WuiView.prototype.create = function (options, itemName) {

	options.parentElement.appendChild(this.rootElement);
	this.emit('created', options, itemName);
};

/**
 * @param params
 */
WuiView.prototype.open = function (params) {
	var that = this;
	window.document.documentElement.scrollIntoView(true);
	this.show();
};

/**
 * close
 */
WuiView.prototype.close = function () {
	this.hide();
};

/**
 * disableScrolling
 */
WuiView.prototype.disableScrolling = function () {
	this.allowDomEvents();

	this.scrollingDisabled = true;
	var that = this;

	this.on('dom.touchmove', function (e) {
		// note: this does not work on a desktop

		if (that.scrollingDisabled) {
			e.preventDefault();
		}
	});
};

/**
 * enableScrolling
 */
WuiView.prototype.enableScrolling = function () {
	this.scrollingDisabled = false;
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
require.register("WuiButton/index.js", function(exports, require, module){
var inherit = require('inherit');
var Dom = require('WuiDom');
var buttonBehavior = require('wuiButtonBehavior');

var wui = window.wui;

/**
 * @param {String} caption
 * @class
 * @classDesc Generic button for Wui
 * @augments WuiDom
 */
function WuiButton(caption) {
	Dom.call(this);
	this.assign('div', { className: 'WuiButton', text: caption });
	buttonBehavior(this);
}

inherit(WuiButton, Dom);
module.exports = WuiButton;

});
require.alias("component-inherit/index.js", "wui_example/deps/inherit/index.js");
require.alias("component-inherit/index.js", "inherit/index.js");

require.alias("NavTree/index.js", "wui_example/deps/NavTree/index.js");
require.alias("NavTree/index.js", "NavTree/index.js");
require.alias("component-inherit/index.js", "NavTree/deps/inherit/index.js");

require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "NavTree/deps/EventEmitter/src/EventEmitter.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "NavTree/deps/EventEmitter/index.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "Wizcorp-eventemitter/index.js");

require.alias("WuiView/index.js", "wui_example/deps/WuiView/index.js");
require.alias("WuiView/index.js", "WuiView/index.js");
require.alias("component-inherit/index.js", "WuiView/deps/inherit/index.js");

require.alias("WuiDom/index.js", "WuiView/deps/WuiDom/index.js");
require.alias("component-inherit/index.js", "WuiDom/deps/inherit/index.js");

require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "WuiDom/deps/EventEmitter/src/EventEmitter.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "WuiDom/deps/EventEmitter/index.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "Wizcorp-eventemitter/index.js");

require.alias("WuiButton/index.js", "wui_example/deps/WuiButton/index.js");
require.alias("WuiButton/index.js", "WuiButton/index.js");
require.alias("component-inherit/index.js", "WuiButton/deps/inherit/index.js");

require.alias("WuiDom/index.js", "WuiButton/deps/WuiDom/index.js");
require.alias("component-inherit/index.js", "WuiDom/deps/inherit/index.js");

require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "WuiDom/deps/EventEmitter/src/EventEmitter.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "WuiDom/deps/EventEmitter/index.js");
require.alias("Wizcorp-eventemitter/src/EventEmitter.js", "Wizcorp-eventemitter/index.js");

require.alias("wuiButtonBehavior/index.js", "WuiButton/deps/wuiButtonBehavior/index.js");

