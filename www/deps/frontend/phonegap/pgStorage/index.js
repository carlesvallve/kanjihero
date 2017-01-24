/**
 * @class
 * @classDesc storage engine
 * @param engineName
 * @constructor
 */
function StorageWrapper(engineName) {
	this.engineName = engineName;
	this.engine = null;
}

/**
 * @returns {*}
 */
StorageWrapper.prototype.getEngine = function () {
	// this way we make sure that even if this file is included before onready,
	// window.localStorage is only accessed after onready.

	if (this.engine) {
		return this.engine;
	}

	this.engine = window[this.engineName];
	return this.engine;
};

/**
 * Retrieve a value from a specific key
 * @param key
 * @param alt
 * @returns {*}
 */
StorageWrapper.prototype.get = function (key, alt) {
	var engine = this.getEngine();

	if (!engine) {
		return alt;
	}

	var value = engine.getItem(key);

	if (typeof value !== 'string') {
		return alt;
	}

	try {
		return JSON.parse(value);
	} catch (e) {
		console.warn(e);
		return alt;
	}
};

/**
 * Add or update a key
 * @param key
 * @param value
 */
StorageWrapper.prototype.set = function (key, value) {
	var engine = this.getEngine();

	if (!engine) {
		console.warn('No', this.engineName, 'available. Unable to set:', key);
		return;
	}

	try {
		engine.setItem(key, JSON.stringify(value));
	} catch (e) {
		console.warn(e);
	}
};

/**
 * Delete a specific key
 * @param key
 */
StorageWrapper.prototype.del = function (key) {
	var engine = this.getEngine();
	if (engine) {
		engine.removeItem(key);
	}
};

/**
 * Clear all data from storage
 */
StorageWrapper.prototype.clear = function () {
	var engine = this.getEngine();
	if (engine) {
		engine.clear();
	}
};


// instantiate storage engines

exports.localStorage = new StorageWrapper('localStorage');
exports.sessionStorage = new StorageWrapper('sessionStorage');