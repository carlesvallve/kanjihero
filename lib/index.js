var mage = require('mage');
var logger = mage.core.logger.context('game-boot');


mage.addModulesPath('./lib/modules');
mage.useModules(
	'archivist',
	'assets',
	'dashboard',
	'logger',
	'session',
	'time',
	'kanji'
);


function createGame(app) {
	logger.info('Creating the game app');

	// creating the game app

	app.assetMap.setup({
		cacheability: {
			img: ['.', 0]
		},
		profiles: {}
	});

	app.assetMap.addFolder('./assets');

	// create loader page

	var loaderPage = app.addIndexPage('loader', './www/pages/gameLoader');

	// mage pages for the game

	loaderPage.registerComponent('landing', './www/pages/landing', { assetMap: true });
	loaderPage.registerComponent('main', './www/pages/main');

	// set up less (css)

	var less = require('component-less');

	app.on('build-component', function (builder) {
		builder.use(function (componentBuilder) {
			less(componentBuilder, { cssConfig: { compress: false } });
		});
	});

	// start mage

	mage.start();
}


mage.setup(function (error, apps) {
	if (error) {
		process.exit(1);
	} else {
		createGame(apps.game);
	}
});
