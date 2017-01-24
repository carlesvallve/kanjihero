// create and register the wrapper object

var wrapper = {};

module.exports = wrapper;


var plugin = window.giraffe;

wrapper.authenticateAndGetTokens = function (cb) {
	// returns token data, or error 'auth'

	if (plugin) {
		plugin.authenticateAndGetTokens(
			function (data) {
				cb(null, data);
			},
			function (error) {
				console.error('Giraffe authentication failed:', error);
				cb('auth');
			}
		);
	} else {
		// token data passthrough using URL hash parameters

		var hash = window.location.hash.substring(1);
		if (hash) {
			var data = {};

			var m = hash.match(/giraffeUserId=(.+)[&$]/);
			if (m) {
				data.giraffeUserId = m[1];
			}

			var m = hash.match(/tokenSecret=(.+)[&$]/);
			if (m) {
				data.access_secret = m[1];
			}

			if (data.giraffeUserId && data.access_secret) {
				return cb(null, data);
			}
		}

		console.error('No implementation ready for authentication.');
		cb('auth');
	}
};