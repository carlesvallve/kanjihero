var fs = require('fs');
var zlib = require('zlib');
var expat = require('node-expat');


function Element(name, attrs) {
	this.name = name;
	this.attrs = attrs || {};
}

function Kanji() {
	this.literal = undefined;
	this.order = {};
	this.group = {}; // jlpt, grade
	this.reading = {
		on: [],
		kun: []
	};
	this.meaning = [];
}


// parsers

// example kanji entry: http://www.csse.monash.edu.au/~jwb/kanjidic2/kd2examph.html

var parse = (function () {
	/*jshint camelcase:false */

	return {
		literal: function (kanji, attrs, text) {
			kanji.literal = text;
		},
		dic_ref: function (kanji, attrs, text) {
			if (attrs.dr_type === 'heisig') {
				kanji.order.heisig = text | 0;
			}
		},
		freq: function (kanji, attrs, text) {
			kanji.order.shinbun = text | 0;
		},
		jlpt: function (kanji, attrs, text) {
			kanji.group.jlpt = text | 0;
		},
		grade: function (kanji, attrs, text) {
			kanji.group.grade = text | 0;
		},
		stroke_count: function (kanji, attrs, text) {
			kanji.group.strokes = text | 0;
		},
		reading: function (kanji, attrs, text) {
			var type = attrs.r_type;

			if (type === 'ja_on') {
				kanji.reading.on.push(text);
			} else if (type === 'ja_kun') {
				kanji.reading.kun.push(text);
			}
		},
		meaning: function (kanji, attrs, text) {
			var lang = attrs.m_lang;

			if (!lang || lang === 'en') {
				kanji.meaning.push(text);
			}
		}
	};

}());



exports.parse = function (path, cb) {
	var file = fs.createReadStream(path);
	var gunzip = zlib.createGunzip();
	var parser = new expat.Parser('UTF-8');

	file.pipe(gunzip).pipe(parser);

	console.time('parse');

	var stack = [];
	var currentElm;  // last on the stack
	var currentKanji;
	var list = [];

	parser.on('text', function (text) {
		var fn = currentElm && parse[currentElm.name];

		if (fn) {
			fn(currentKanji, currentElm.attrs, text);
		}
	});

	parser.on('startElement', function (name, attrs) {
		currentElm = new Element(name, attrs);
		stack.push(currentElm);

		if (name === 'character') {
			currentKanji = new Kanji();
			list.push(currentKanji);
		}
	});

	parser.on('endElement', function (name) {
		stack.pop();
		currentElm = stack.slice(-1);

		if (name === 'character') {
			if (currentKanji.literal === '雨') {
				console.log(currentKanji);
			}
			currentKanji = undefined;
		}
	});

	parser.on('end', function () {
		console.timeEnd('parse');
		cb(null, list);
	});

	parser.on('error', function (error) {
		console.error('error:', error);
		cb(error);
	});
};

