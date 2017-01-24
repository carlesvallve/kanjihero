var mage = require('mage');
var mageLoader = require('loader');

mage.useModules(require, 'kanji');

var tblBody;

function row() {
	var tr = document.createElement('tr');

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];

		var td = document.createElement('td');
		td.textContent = arg === undefined ? '' : arg;
		tr.appendChild(td);
	}

	return tr;
}

function query(indexes, sort) {
	if (!tblBody) {
		return;
	}

	mage.kanji.query(indexes, sort, function (error, result) {
		if (error) {
			return window.alert(error);
		}

		tblBody.innerHTML = '';

		result.forEach(function (kanji) {
			tblBody.appendChild(row(
				kanji.literal,
				kanji.reading.on.join(', '),
				kanji.reading.kun.join(', '),
				kanji.meaning.join(', ')
			));
		});
	});
}


mageLoader.on('kanji.display', function () {
	var f = document.getElementById('formKanjiLookup');

	tblBody = document.getElementById('tblKanjiLookup').querySelector('tbody');

	function parse(val) {
		if (!val) {
			return;
		}

		val = val.trim();

		var m = val.match(/^([0-9]+)-([0-9]+)$/);
		if (m) {
			return [m[1] | 0, m[2] | 0];
		}

		return val;
	}

	f.onsubmit = function (evt) {
		var indexes = {
			literal: parse(f.literal.value),
			heisig: parse(f.heisig.value),
			shinbun: parse(f.shinbun.value),
			onyomi: parse(f.onyomi.value),
			kunyomi: parse(f.kunyomi.value),
			meaning: parse(f.meaning.value)
		};

		query(indexes);

		evt.preventDefault();
		return false;
	};
});


