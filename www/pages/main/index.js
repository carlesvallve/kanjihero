var mageLoader = require('loader');
var WuicCanvas = require('WuicCanvas');
var FRAME_RATE = 60;
var WuicViewManager = require('WuicViewManager');
var DungeonView = require('DungeonView');


// render the initial HTML and the DOM element for this page
var pageElement = mageLoader.renderPage('main');

// set game dimensions
function fitWindow() {
	var gameHeight = 320; // fits to the height of the screen thanks to the viewport set to 320px
	var magePages = document.querySelectorAll('.mage-page');
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var windowRatio = windowWidth / windowHeight;
	window.gameWidth = Math.round(gameHeight * windowRatio);
	window.gameHeight = gameHeight;
	window.canvasWidth = window.gameWidth;
	window.canvasHeight = window.gameHeight;

	document.documentElement.clientWidth = window.gameWidth;
	document.documentElement.clientHeight = window.gameHeight;

	for (var i = 0; i < magePages.length; i++) {
		magePages[i].style.width = window.gameWidth + 'px';
	}
	window.scrollTo(0, 0);

	// log the game dimensions
	console.log('GAME DIMENSIONS:', window.gameWidth, window.gameHeight);
}
fitWindow();


// initialize wuic
var canvas, viewManager;

function setCanvas() {
	// in ejecta, the canvas have to be retrieved
	var wizCanvas;
	if (window.ejecta) {
		wizCanvas = new WuicCanvas(document.getElementById('canvas'));
	// else, we create one
	} else {
		wizCanvas = new WuicCanvas();
		wizCanvas.appendTo(pageElement);
	}

	// set canvas size and framerate
	wizCanvas.setSize(window.gameWidth, window.gameHeight);
	wizCanvas.setFrameRate(FRAME_RATE);

	// remove browser canvas antialiasing
	//var ctx = wizCanvas.getContext();
	//ctx.webkitImageSmoothingEnabled = false;

	// makes everything less blurry
	//ctx.translate(0.5, 0.5);

	return wizCanvas;
}


function initializeWuic() {

	// initialize canvas
	canvas = window.canvas = setCanvas();

	// init wuic viewManager and views
	viewManager = window.viewManager = new WuicViewManager();
	viewManager.register(canvas);

	viewManager.addView('dungeon', new DungeonView());

	// create wuic inspector
	window.createInspector = function () {
		if (!window.inspector) {
			var WuicInspector = require('WuicInspector');
			window.inspector = new WuicInspector(viewManager);
		}
		return window.inspector;
	};
}

initializeWuic();


