var doc = window.document;

// event handler helper

function runAll(handlers, args) {
	for (var i = 0, len = handlers.length; i < len; i++) {
		if (args) {
			handlers[i].apply(null, args);
		} else {
			handlers[i]();
		}
	}
}


// core.restart(), restarts the application

var restartHandlers = [];

exports.restart = function () {
	runAll(restartHandlers);
	restartHandlers = [];

	window.setTimeout(function () {
		if (window.wizUtils) {
			window.wizUtils.restart();
		} else {
			console.info('Restart triggered');
			window.location.reload();
		}
	}, 1000);
};

exports.onrestart = function (fn) {
	restartHandlers.push(fn);
};


// core.onready(fn), for registering device ready handlers

var readyHandlers = [];

function ready() {
	runAll(readyHandlers);
	readyHandlers = [];
}

exports.onready = function (fn) {
	readyHandlers.push(fn);
};

if (window.cordova) {
	doc.addEventListener('deviceready', ready, false);
} else {
	window.setTimeout(ready, 0);
}

// core.onpause(fn) and core.onresume(fn), for background/resume management

var backgroundSince, pauseHandlers = [], resumeHandlers = [];

function pause() {
	backgroundSince = Date.now() / 1000;

	runAll(pauseHandlers);
}

function resume() {
	if (backgroundSince) {
		runAll(resumeHandlers, [Date.now() / 1000 - backgroundSince]);
	} else {
		runAll(resumeHandlers);
	}
}

if (window.cordova) {
	doc.addEventListener('pause', pause, false);
	doc.addEventListener('resume', resume, false);
}


exports.onpause = function (fn) {
	pauseHandlers.push(fn);
};

exports.onresume = function (fn) {
	resumeHandlers.push(fn);
};


// core.simulatePause() and core.simulateResume(), for testing purposes

exports.simulatePause = pause;
exports.simulateResume = resume;