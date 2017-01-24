var mage = require('mage');

exports.access = 'user';

exports.params = ['indexes', 'sort'];

exports.execute = function (state, indexes, sort, cb) {
	try {
		state.respond(mage.kanji.query(indexes, sort));
	} catch (error) {
		return state.error(null, error, cb);
	}

	cb();
};

