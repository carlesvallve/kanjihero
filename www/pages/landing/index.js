var mage = require('mage');
var mageLoader = require('loader');

var WuiDom = require('WuiDom');
var utils = require('utils');
var tweener = require('tweener');
var DefaultButton = require('DefaultButton');
var landingPage;


/**
 * This function checks off an item from the checklist on the screen
 */

function done(n) {
	var elm = document.getElementById('chk' + n);
	if (elm) {
		elm.textContent = '☑';
	}
}


mage.useModules(require,
	'logger',
	'time',
	'assets',
	'archivist',
	'session'
);


function setupErrorHandlers() {
	mage.msgServer.on('io.error.auth', function () {
		// We are trying to do something on the server that we are not allowed to do.
		// Should we re-authenticate?

		mage.logger.debug('Authentication error');
	});

	mage.msgServer.on('io.error.busy', function () {
		// You can't run two user commands in parallel, in order to protect ourselves from race
		// conditions on our servers and databases.

		mage.logger.error('IO busy error');
	});

	mage.msgServer.on('io.error.network', function () {
		// We could not complete the user command call to the server due to a network glitch,
		// let's retry in 4 seconds.

		window.setTimeout(function () {
			mage.logger.verbose('Resending...');

			mage.msgServer.resend();
		}, 4000);
	});
}


// Set up all loaded modules. This will allow these modules to hit the server once to sync up.

mageLoader.renderPage('landing');
done(1);

setupErrorHandlers();
done(2);

mage.setup(function () {
	done(3);

	// once our modules' needs have been satisfied, show this screen

	mageLoader.displayPage('landing');
	done(4);

	// download the rest of the game

	mageLoader.loadPage('main');
});


// ----------------------------------
// Start the game
// ----------------------------------

function startGame(viewName) {
	// display main page
	mageLoader.displayPage('main');

	window.viewManager.open(viewName, { initialize: true });
	//window.viewManager.open('ui', { viewName: viewName });

	// destroy landing page
	window.setTimeout(function () {
		landingPage.destroy();
	}, 1000);
}


// ----------------------------------
// Render the landing page
// ----------------------------------

function renderLandingPage() {
	window.require('main');

	// disable scroll
	utils.disableScroll();

	// display the landing page
	var pageElm = mageLoader.renderPage('landing');

	landingPage = new WuiDom();
	landingPage.assign(pageElm);
	landingPage.addClassNames('LandingPage');

	// Start button
	var startButton = landingPage.appendChild(new DefaultButton('START', { className: 'btnStart' }));
	startButton.once('tap', function () {
		// display resulting filter images
		var displayFilters = false;
		if (displayFilters) {
			for (var i in window.tilesets) {
				var img = window.tilesets[i].black.toDataURL('image/png');
				var win = window.open(img, '_blank');
				win.focus();
				console.log('>>>', img);
			}
		}

		// fade landing page and start game
		tweener.tween(landingPage, { opacity: 0 }, { time: 500, delay: 0, easing: 'ease-in-out' }, function () {
			startGame('dungeon');
		});
	});

	// preload tilesets (png and json files)
	utils.loadTilesets(require('./tilesets.js').tilesets, startButton.label, function (tilesets) {
		window.tilesets = tilesets;
		console.log('Tilesets:', Object.keys(tilesets), tilesets);
		startButton.label.setText('START');
	});

	utils.preloadCanvasAssets(require('./assets.js'), startButton.label, function () {
		//startButton.label.setText('START');
	});

	// transition in
	landingPage.setStyle('opacity', 0);
	tweener.tween(landingPage, { opacity: 1 }, { time: 500, delay: 0, easing: 'ease-in-out' }, function () {
	});

	mage.logger.verbose('Page: landing ready');
}


// Commence downloading and execution of the "main" page.

mageLoader.once('main.loaded', function () {
	done(5);
	renderLandingPage();
	done(6);
});


