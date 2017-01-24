exports.tween = function (dom, props, options, cb) {
	// set default params

	options = options || {};
	var time = options.time || 500;
	var delay = options.delay || 0;
	var ease = options.easing || 'ease-in-out';
	var elm = dom.rootElement;

	var transition = 'all ' + time + 'ms ' + ease;
	if (delay) {
		transition += ' ' + delay + 'ms';
	}

	// listen for animation end
	var hasFinished = false;
	var endTimeout = null;

	var handleTransitionEnd;

	function cleanup() {
		if (!hasFinished) {
			elm.removeEventListener('webkitTransitionEnd', handleTransitionEnd);
			window.clearTimeout(endTimeout);
			endTimeout = null;
			elm.style.webkitTransition = null;
			hasFinished = true;
		}
	}

	handleTransitionEnd = function (e) {
		if (e) {
			e.stopPropagation();
		}

		cleanup();

		if (cb) {
			cb(e);
			cb = null;
		}
	};

	window.setTimeout(function () {
		elm.style.webkitTransition = transition;

		for (var n in props) {
			elm.style[n] = props[n];
		}

		// Normal transition end handler, however doesn't trigger if the element is not visible (e.g. if we switch view before the transition ends)
		elm.addEventListener('webkitTransitionEnd', handleTransitionEnd);

		// backup plan for handling transition end. If the 'webkitTransitionEnd' event didn't fire, this one will
		endTimeout = window.setTimeout(handleTransitionEnd, (delay + time)); // * 1000); // Fixed:  This looks like a bug after someone refactored thi script to use ms instead of s
	}, 0);

	return {
		cancel: cleanup
	};
};