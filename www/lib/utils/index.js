var mage = require('mage');
var ImgLoader = require('ImgLoader');
window.assets = {};


// -------------------------------------------------
// Javascript functions
// -------------------------------------------------

exports.isArray = function (o) {
	return Object.prototype.toString.call(o) === Object.prototype.toString.call([]);
};


exports.swapItemsInArray = function (arr, a, b) {
	arr[a] = arr.splice(b, 1, arr[a])[0];
	return arr;
};

exports.insertAtArrayIndex = function (arr, elm, index) {
	return arr.splice(index, 0, elm);
};


// -------------------------------------------------
// Tileset functions
// -------------------------------------------------

exports.getTilesetById = function (tilesetName, id) {
	if (!id) { return null; }
	var tileset = window.tilesets[tilesetName];
	/*if (!tileset.data || !tileset.data.frames) {
		return console.log('Error retrieving tileset by id:', tilesetName, id);
	}*/
	var item = tileset.data.frames[id];
	if (!item) {
		return console.log('Error retrieving tileset by id:', tilesetName, id);
	}
	return { id: id, img: tileset.img, black: tileset.black, rect: item.frame };
};


exports.getTileset = function (tileset, item) {
	return { id: item.id, img: tileset.img, black: tileset.black, rect: item.value.frame };
};


exports.getRandomTileset = function (tilesetType) {
	function getRandomProp(obj) {
		var keys = Object.keys(obj);
		var key = keys[keys.length * Math.random() << 0];
		return { key: key, value: obj[key] };
	}

	var tileset = window.tilesets[tilesetType];
	var item = getRandomProp(tileset.data.frames);
	return { id: item.key, img: tileset.img, black: tileset.black, rect: item.value.frame };
};


exports.searchInTileset = function (tilesetData, keyArr, mode) { // AND, OR
	var arr = [];

	for (var n in tilesetData) {
		var str = n.toLowerCase();
		var c = 0;

		for (var i = 0; i < keyArr.length; i++) {
			var key = keyArr[i].toLowerCase();

			// search if term is in string
			if (str.indexOf(key) >= 0) {
				// search if id string contains ALL given words
				if (mode === 'AND') {
					c++;
					if (c === keyArr.length) {
						arr.push({ id: n, value: tilesetData[n] });
					}
				// check if id string contains A given word	
				} else {
					arr.push({ id: n, value: tilesetData[n] });
				}
				
			}
		}
	}

	return arr;
};


exports.splitCamelCase = function (str) {
	str = str.replace(/([A-Z0-9]+)/g, " $1").replace(/([A-Z0-9][a-z0-9])/g, " $1");
	var splitted = str.split(' ');
	var arr = [];
	for (var i = 0; i < splitted.length; i++) {
		if (splitted[i] !== '') { arr.push(splitted[i]); }
	}
	return arr; //.join(' ');
};


exports.wordifyCamelCase = function (str) {
	str = str.replace(/([A-Z0-9]+)/g, " $1").replace(/([A-Z0-9][a-z0-9])/g, " $1");
	var splitted = str.split(' ');
	var arr = [];
	for (var i = 0; i < splitted.length; i++) {
		if (splitted[i] !== '') { arr.push(splitted[i]); }
	}
	return arr.join(' ');
};


// -------------------------------------------------
// Loading functions
// -------------------------------------------------

// bash rename files:
// for file in *.PNG; do mv -- "$file" "$(expr "$file" : '\(.*\)\.PNG').png"; done;

exports.loadTilesets = function (tilesetsObject, label, cb) {


	function generateBlackAsset(tileset) {
		// create buffer canvas
		var canvas = document.createElement('canvas');
		canvas.width = tileset.img.width;
		canvas.height = tileset.img.height;
		var context = canvas.getContext('2d');

		// draw tileset image to buffer
		context.drawImage(tileset.img, 0, 0, canvas.width, canvas.height);

		// get image data
		var data = context.getImageData(0, 0, canvas.width, canvas.height);
		var buffer = data.data;
		var len = buffer.length;
		// var threshold = 127;
		var i = 0;
		var lum;

		// change pixels to black and white
		for (; i < len; i += 4) {
			//lum = buffer[i] * 0.3 + buffer[i+1] * 0.59 + buffer[i+2] * 0.11;
			//lum = lum < threshold ? 0 : 255;

			lum = 0;

			buffer[i] = lum;
			buffer[i + 1] = lum;
			buffer[i + 2] = lum;
		}

		// put image data
		context.putImageData(data, 0, 0);

		// return the buffer canvas
		return canvas;
	}


	// generate suitable data for loading both images and json files
	var fileList = [];
	var assetList = { img: {} };

	for (var n in tilesetsObject) {
		// generate an array of json file paths from the tilesets object
		if (tilesetsObject[n].json) {
			tilesetsObject[n].json = '../assets/img/default/' + tilesetsObject[n].json;
			fileList.push(tilesetsObject[n]);
		}
		// generate appropiate object for loading the tileset assets
		assetList.img[n] = tilesetsObject[n].img;
	}


	// load all tileset json files
	function loadTilesetData(cb) {
		// loads the given json file
		function loadJSON(filename, cb) {
			//console.log('loading', filename);
			if (!filename) { console.log('file not found'); return cb(null); }

			var xobj = new XMLHttpRequest();
			xobj.overrideMimeType("application/json");
			xobj.open('GET', filename + '.json?' + new Date().getTime(), true);
			xobj.onreadystatechange = function () {
				if (xobj.readyState === 4 && xobj.status === 200) {
					// .open will NOT return a value but simply returns undefined in async mode so use a callback
					cb(xobj.responseText);
				}
			};
			xobj.send(null);
		}


		// parse the given json file, and loads th next one in files array
		function parseJSON(response) {
			// parse json file and put it into tilesets object
			tilesets[fileList[i].id] = {
				id: fileList[i].id,
				img: null,
				data: JSON.parse(response)
			};

			// check if we loaded all the files in fileList
			i++;
			if (i < fileList.length) {
				//load next file in files array
				loadJSON(fileList[i].json, parseJSON);
			} else {
				// we loaded all the files, so execute final callback
				if (cb) { cb(tilesets); }
			}
		}

		// start loading the json files
		var i = 0;
		loadJSON(fileList[0].json, parseJSON);
	}


	// load all tileset png images
	var assets = [];
	function loadAssets(assetList, label, cb) {
		// { id, json, img}
		var imgLoader = new ImgLoader(assetList.img, cb, assets);
		imgLoader.setOnFileLoad(function (src, loaded, total) {
			// display percent loaded message
			if (label) { label.setText(Math.round(100 * (loaded + 1) / total) + '%'); }
		});
		imgLoader.start();
	}


	// begin loading the tileset json files
	var tilesets = {};
	loadTilesetData(function (tilesets) {
		// once we loaded all the jsn files, we begin loading the tileset images
		loadAssets(assetList, label, function () {
			// display all assets loaded message
			//if (label) { label.setText('100%'); }
			// put returned image assets into tilesets img object
			for (var n in tilesets) {
				tilesets[n].img = assets[n];
				tilesets[n].black = generateBlackAsset(tilesets[n]); // .img
			}
			if (label) { label.setText('100%'); }
			// finish loading process: 
			// return to callback function passing the final tilests object
			if (cb) { cb(tilesets); }
		});
	});
};


// TODO: replace this with the new loadTilesets function
exports.preloadCanvasAssets = function (fileList, label, cb) {
	// load images for using in canvas
	function loadAssets(fileList, label, cb) {
		var imgLoader = new ImgLoader(fileList.img, cb, window.assets);
		// progress bar
		imgLoader.setOnFileLoad(function (src, loaded, total) {
			//console.log('loading asset ' + src + ' (' + loaded + '/' + total + ')');
			if (label) { label.setText(Math.round(100 * loaded / total) + '%)'); }
		});
		imgLoader.start();
	}

	// load assets and get necessary data to run the simulation
	loadAssets(fileList, label, function () {
		// show canvas and hide preloader
		if (label) { if (label) { label.setText('100%'); } }

		// return to callback function
		if (cb) { cb(); }
	});
};


// -------------------------------------------------
// Isometric functions
// -------------------------------------------------

exports.isoToCartesian = function (x, y) {
	var p = {
		x: Math.floor((2 * y + x) / 2),
		y: Math.floor((2 * y - x) / 2)
	};

	return p;
};

exports.cartesianToIso = function (x, y) {
	var p = {
		x: x - y,
		y: (x + y) / 2
	};

	return p;
};


exports.isoToCoords = function (x, y, zoom) {
	var p = {
		x: Math.floor((2 * y + x) / 2),
		y: Math.floor((2 * y - x) / 2)
	};

	var tileSize = window.tileSize;
	p.x = Math.floor(p.x / (tileSize  * zoom));
	p.y = Math.floor(p.y / (tileSize  * zoom));

	return p;
};


exports.coordsToIso = function (x, y) { //, zoom
	var tileSize = window.tileSize;
	x = x * tileSize;
	y = y * tileSize;
	
	var p = {
		x: x - y,
		y: (x + y) / 2
	};
	return p;
};


// -------------------------------------------------
// Random functions
// -------------------------------------------------

// seeded random function
Math.seed = 9;
Math.randomSeed = function (max, min) {
	max = max || 1;
	min = min || 0;

	Math.seed = (Math.seed * 9301 + 49297) % 233280;
	var rnd = Math.seed / 233280;

	var r = min + rnd * (max - min);

	return r;
};

// better rand function that takes min/max and integer between them, much like Random.Next in .NET
Math.rand = function (min, max) {
	return Math.floor(Math.random() * (max - min) + min);
};

// basic clamp function
Math.clamp = function (val, min, max) {
	return Math.min(Math.max(val, min), max);
};

// random integer
exports.randomInt = function (min, max, excludeZero) {
	var num = Math.floor(Math.random() * (max - min + 1) + min);

	if (excludeZero) {
		while (num === 0) {
			num = Math.floor(Math.random() * (max - min + 1) + min);
		}
	}

	return num;
};

// returns a random item from an array
exports.randomArr = function (arr) {
    return arr[Math.rand(0, arr.length)];
};

// returns a random color in given format (hex, rgb, int)
exports.randomColor = function (format) {
	format = 'hex';
	var rint = Math.round(0xffffff * Math.random());
	switch (format) {
		case 'hex':
			return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
		case 'rgb':
			return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';
		default:
			return rint;
	}
};


exports.randomProp = function (obj) {
    var keys = Object.keys(obj);
    var key = keys[keys.length * Math.random() << 0];
    console.log(key);
    return { key: key, value: obj[key] };
};


// -------------------------------------------------
// Geometry functions
// -------------------------------------------------

exports.Point = function (x, y) {
    x = x || 0;
    y = y || 0;
    return { x: x, y: y };
};

exports.Rectangle = function (x, y, width, height) {
    x = parseInt(x, 10) || 0;
    y = parseInt(y, 10) || 0;
    width = parseInt(width, 10) || 0;
    height = parseInt(height, 10) || 0;
    return { x: x, y: y, width: width, height: height };
};

exports.radianToDegree = function (radians) {
	return (radians * 180 /  Math.PI);
};


exports.degreeToRadian = function (degrees) {
	return (degrees * Math.PI / 180);
};


exports.getDistance = function (p1, p2) {
	var a = Math.abs(p2.x - p1.x);
	var b = Math.abs(p2.y - p1.y);
	var d = Math.sqrt(a * a + b * b);
	return d;
};


// -------------------------------------------------
// Canvas Drawing functions
// -------------------------------------------------

// TODO: Lint doesnt like CanvasRenderingContext2D.prototype (?)
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) { r = w / 2; }
	if (h < 2 * r) { r = h / 2; }
	this.beginPath();
	this.moveTo(x + r, y);
	this.arcTo(x + w, y,   x + w, y + h, r);
	this.arcTo(x + w, y + h, x, y + h, r);
	this.arcTo(x, y + h, x, y, r);
	this.arcTo(x, y, x + w, y, r);
	this.closePath();

	return this;
};

CanvasRenderingContext2D.prototype.isoTile = function (x, y, w, h) {
	var w2 = Math.ceil(w / 2);
	var h2 = Math.ceil(h / 2);
	var h4 = Math.floor(h / 4);

	this.beginPath();
	this.moveTo(x + w2, y);
	this.lineTo(x + w, y + h4);
	this.lineTo(x + w2, y + h2);
	this.lineTo(x, y + h4);
	this.lineTo(x + w2, y);
	this.closePath();

	return this;
};


// -------------------------------------------------
// UI Functions
// -------------------------------------------------

exports.drawBox = function (context, x, y, w, h, fillColor, radius) {
	context.save();
	//context.globalAlpha = 0.6;
	context.fillStyle = fillColor || 'rgba(50, 50, 50, 0.8)';
	context.radius = radius || 5;
	if (context.fillStyle) { context.roundRect(x, y, w, h, radius).fill(); }
	context.restore();
};


exports.drawBar = function (context, stat, statMax, color, x, y, w, h) {
	context.save();
	context.globalAlpha = 0.6;
	context.fillStyle = '#000';
	context.fillRect(x, y, w, h);
	context.fillStyle = color;
	var value = w * stat / statMax;
	context.fillRect(x, y, value, h);
	context.restore();
};


exports.drawText = function (context, caption, x, y, color, alignment, fontSize, fontWeight, shadow) {
	context.save();
	fontWeight = fontWeight || 'normal';
	if (shadow) {
		context.shadowColor = 'black';
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 1;
		context.shadowBlur = 1;
	}
	context.font = fontWeight + ' ' + (fontSize || 8) + 'pt Verdana';
	context.textAlign = alignment || 'left';
	context.fillStyle = color;
	var width = context.measureText(caption).width;
	context.fillText(caption, x, y);
	context.restore();
	return width;
};


// ----------------------------------------------------
// FPS debugger
// ----------------------------------------------------

var prevTime = Date.now();
var fpsHistory = [];
var historyLength = 60;
for (var n = 1, len = historyLength; n < len; n++) {
	fpsHistory.push(60);
}

exports.drawFPS = function (ctx) {
	//if(!options.showFps) { return; }

	// get fps
	var now = Date.now();
	var duration = now - prevTime;
	var fps = 1000 / duration;

	var newFpsHistory = [];
	for (var i = 1, len = historyLength; i < len; i++) {
		newFpsHistory.push(fpsHistory[i]);
	}
	newFpsHistory.push(fps);

	var averageFps = 0;
	for (i = 0, len = historyLength; i < len; i++) {
		averageFps += newFpsHistory[i];
	}
	averageFps /= historyLength;
	averageFps = Math.round(averageFps);

	// render fps
	var canvasWidth = window.canvasWidth;
	if (averageFps > 0) {
		ctx.font = '9px Verdana';
		ctx.fillStyle = '#ddd';
		ctx.textAlign = 'right';
		ctx.textBaseLine = 'bottom';
		ctx.fillText('fps ' + averageFps, canvasWidth - 12, 28);
	}

	// update vars
	prevTime = now;
	fpsHistory = newFpsHistory;
};


// -------------------------------------------------
// Html functions
// -------------------------------------------------

// enables html page scrolling
exports.enableScroll = function () {
	document.ontouchmove = function () { // e
		return true;
	};
};

// disables html page scrolling
exports.disableScroll = function () {
	document.ontouchmove = function (e) {
		e.preventDefault();
	};
};

// returns css integer value of html element
exports.getCss = function (elm, prop) {
    return parseInt(window.getComputedStyle(elm, null).getPropertyValue(prop), 10);
};


// -------------------------------------------------
// Mage/Wui functions
// -------------------------------------------------

/**
 * Popup Management
 * Set of helper functions to open/close stackable popup views on popupNavTree
 *
 */
var stack = [];
var popupDisplayed = false;

exports.openPopup = function (params) {
	params = params || {};

	// close the popup
	params.closeCb = function closeCb() {
		if (stack.length > 0) {
			window.popupNavTree.open('popup', stack.shift());
		} else {
			window.popupNavTree.close('popup');
			popupDisplayed = false;
		}
	};

	// if another popup is already opened push the new one in the stack and return
	if (popupDisplayed) {
		stack.push(params);
		return;
	}

	// else, open the popup
	popupDisplayed = true;
	window.popupNavTree.open('popup', params);
};


/**
 * View Asset loader
 * To use whenever we enter in a view, to make sure all required assets are loaded before initializing it
 *
 */
exports.preloadAssets = function (assets, cb) {
	var debug = false;
	var i = 0;

	function allLoaded() {
		cb();
	}

	function loadNextImage() {
		i++;
		if (i === assets.length) {
			allLoaded();
		} else {
			window.setTimeout(function () {
				loadImage();
			}, 0);
		}
	}

	// load current image in layer
	function loadImage() {
		var path = 'img/' + assets[i];
		var url = mage.assets.get(path);
		var asset = new Image();
		asset.onload = function () {
			var percent = Math.ceil(100 * i / assets.length);
			if (debug) {
				mage.logger.info(i, 'loaded asset:', path, percent + '%');
			}
			loadNextImage();
		};
		asset.onerror = loadNextImage;
		asset.src = url;
	}

	// start loading the images
	window.setTimeout(function () {
		loadImage();
	}, 0);
};

