var hepburn = require('hepburn');
var SimpleFilter = require('simple-filter');
var filter;

var dbPath = './db/kanjidic2.xml.gz';
var kanjiList;


exports.setup = function (state, cb) {
	var parser = require('./parser');

	console.time('parserSetup');

	parser.parse(dbPath, function (error, list) {
		if (error) {
			return state.error(null, error, cb);
		}

		console.timeEnd('parserSetup');

		kanjiList = list;

		// example data

		console.time('filterSetup');

		filter = new SimpleFilter(list);

		filter.addIndex('literal', function (kanji) {
			return kanji.literal;
		});

		filter.addIndex('onyomi', function (kanji) {
			return '\n' + kanji.reading.on.join('\n') + '\n';
		});

		filter.addIndex('kunyomi', function (kanji) {
			return '\n' + kanji.reading.kun.join('\n') + '\n';
		});

		filter.addIndex('meaning', function (kanji) {
			return '\n' + kanji.meaning.join('\n') + '\n';
		});

		filter.addIndex('heisig', function (kanji) {
			return kanji.order.heisig || 0;
		});

		filter.addIndex('shinbun', function (kanji) {
			return kanji.order.shinbun || 0;
		});

		console.timeEnd('filterSetup');

		cb();
	});
};


function parseTextQuery(query, fn) {
	if (typeof query !== 'string') {
		return;
	}

	query = query.trim();

	if (!query) {
		return;
	}

	if (query[0] === '*') {
		query = query.slice(1);
	} else {
		query = '\n' + query;
	}

	if (query.slice(-1) === '*') {
		query = query.slice(0, -1);
	} else {
		query += '\n';
	}

	if (fn) {
		query = fn(query);
	}

	return query;
}


exports.query = function (indexes, sortIndex) {
	var on = parseTextQuery(indexes.onyomi, hepburn.toKatakana); // will hopefully become available in an upcoming release
	var kun = parseTextQuery(indexes.kunyomi, hepburn.toHiragana);
	var meaning = parseTextQuery(indexes.meaning);

	if (on) {
		indexes.onyomi = function (reading) {
			return reading.indexOf(on) !== -1;
		};
	}

	if (kun) {
		indexes.kunyomi = function (reading) {
			return reading.indexOf(kun) !== -1;
		};
	}

	if (meaning) {
		indexes.meaning = function (meanings) {
			return meanings.indexOf(meaning) !== -1;
		};
	}

	return filter.get(indexes, sortIndex);
};

