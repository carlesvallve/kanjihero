var Sprite = require('WuicSprite');
var inherit = require('inherit');

/**
 * @class
 * @classDesc Display text using an fontmap image
 * @augments WuicSprite
 *
 * @param {Image} fontImage - Image object
 * @param {Object} fontMap   - Font definition
 * @param {Object} fontMap.chars
 * @param {Object} fontMap.meta
 */

function BitmapText(fontImage, fontMap) {
	Sprite.call(this);

	var that = this;

	this._fontImage = fontImage;
	this._fontMap = fontMap;
	this._string = "";
	this._original_string = "";
	this._xalign = 'left';
	this._yalign = 'top';
	this._fontSize = 10;
	this._data = [];
	this._offset = {
		x: [],
		y: 0
	};
	this._kerning = 0.9;
	this._lineHeight = 1.2;
	this._firstLineOffsetY = 0;
	this._maxWidth = null;
	this._maxLines = null;
	this._truncator = '[...]';

	this.textWidth = 0;
	this.textHeight = 0;

	this.setRenderMethod(function (ctx) {
		for (var i = 0; i < that._data.length; i++) {
			var dat = that._data[i];
			if (dat) {
				ctx.drawImage(
					that._fontImage,
					dat.sourceX,
					dat.sourceY,
					dat.sourceWidth,
					dat.sourceHeight,
					dat.x + that._offset.x[dat.line]/* + this.textWidth / 2*/,
					dat.y + that._offset.y + this._firstLineOffsetY,
					dat.width,
					dat.height);
			}
		}
	});
}

inherit(BitmapText, Sprite);
module.exports = BitmapText;


/**
 * @param {Image} fontImage
 * @param {Object} fontMap
 */

BitmapText.prototype.setFont = function (fontImage, fontMap) {
	this._fontImage = fontImage;
	this._fontMap = fontMap;
};


/**
 * @param {Number} [fontSize]
 */
BitmapText.prototype.setFontSize = function (fontSize) {
	this._fontSize = fontSize || this._fontSize;
	this._updateTxt();
};


/**
 * @param {String} [xalign] - Valid value: 'left' || 'center' || 'right'
 * @param {String} [yalign] - Valid value: 'top'  || 'middle' || 'baseline-middle' || 'bottom'
 */
BitmapText.prototype.setPosition = function (xalign, yalign) {
	this._xalign = xalign || this._xalign;
	this._yalign = yalign || this._yalign;
	this._updateTxt();
};


/**
 * @param {String} str - Text to render
 * @param {Number} [fontSize]
 * @param {String} [xalign]
 * @param {String} [yalign]
 */
BitmapText.prototype.setText = function (str, fontSize, xalign, yalign) {
	this._fontSize = fontSize || this._fontSize;
	this._xalign = xalign || this._xalign;
	this._yalign = yalign || this._yalign;
	this.setString(str);
};


/**
 * @param {Number} nb
 */
BitmapText.prototype.setMaxLines = function (nb) {
	if (nb === null) {
		this._maxLines = null;
	} else if (!isNaN(nb)) {
		this._maxLines = parseInt(nb, 10);
	}
	this._updateTxt();
};


/**
 * @param {Number} val
 */
BitmapText.prototype.setKerning = function (val) {
	if (this._kerning === val) {
		return;
	}
	this._kerning = val;
	this._updateTxt();
};


/**
 * @param {String} str - Text to render
 */
BitmapText.prototype.setString = function (str) {
	str = (typeof str !== 'undefined' && str !== null) ? str.toString() : '';
	str = this._sanitize(str);
	if (str === this._original_string) {
		return;
	}
	this._original_string = str;
	this._string = str;
	this._updateTxt();
};


/**
 * @param {Number} val
 */
BitmapText.prototype.setLineHeight = function (val) {
	if (this._lineHeight === val) {
		return;
	}
	this._lineHeight = val;
	this._updateTxt();
};


/**
 * @param {Number} val
 */
BitmapText.prototype.setMaxWidth = function (val) {
	if (this._maxWidth === val) {
		return;
	}
	this._maxWidth = val;
	this._updateTxt();
};


/**
 * @param {String} val
 */
BitmapText.prototype.setTruncator = function (val) {
	if (val && val.toString) {
		this._truncator = val.toString();
	}
	this._updateTxt();
};


/**
 * @param {String} str
 * @returns {String}
 * @private
 */
BitmapText.prototype._addTruncator = function (str) {

	var fontData = this._fontMap.chars;
	var sz = 1 / this._fontMap.meta.info.size * this._fontSize;
	var i = null;

	// calculate the truncator terminaison length
	var truncatorLength = 0;
	for (i = 0; i < this._truncator.length; i++) {
		truncatorLength += fontData[this._truncator.charCodeAt(i)].xadvance * sz;
	}

	// remove trailing characters to leave enough space for the truncator
	while (str.length > 0 && truncatorLength > 0) {
		var removedChar = str.charAt(str.length - 1);
		str = str.substr(0, str.length - 1);
		truncatorLength -= fontData[removedChar.charCodeAt(0)].xadvance * sz;
	}

	// append the truncator to the string
	str += this._truncator;

	return str;
};

/**
 * @private
 * @desc Add line breaks to the current string if this._maxWidth is defined
 * and also trim/truncate too long parts
 */
BitmapText.prototype._addCarriageReturn = function () {
	// if there is no max width defined, no change
	if (!this._maxWidth) {
		return;
	}

	var fontData = this._fontMap.chars;
	var sz = 1 / this._fontMap.meta.info.size * this._fontSize;
	var dx = null;
	var spaceLength = fontData[(' ').charCodeAt(0)].xadvance * sz;
	var txt = this._original_string;
	var i, len;

	// splitting the mandatory (user defined) carriage returns
	txt = txt.split('\n');

	// splitting the words
	for (i = 0, len = txt.length; i < len; i++) {
		txt[i] = txt[i].split(' ');
	}

	// the lines (strings) array
	var lines = [];

	// for each user defined line
	for (i = 0, len = txt.length; i < len; i++) {

		var currentLine = '';
		var lineWidth = 0;
		var truncated = false;

		// for each word inside the line
		for (var word = 0, wlen = txt[i].length; word < wlen; word++) {
			var wordLength = 0;
			var processedWord = '';
			truncated = false;
			// for each character inside the word

			for (var character = 0, clen = txt[i][word].length; character < clen; character++) {
				// we calculate the character width
				var charCode = txt[i][word].charCodeAt(character);
				var fchar = fontData[charCode];
				if (character > 0) {
					var bchar = fontData[txt[i][word].charCodeAt(character - 1)];
					if (bchar) {
						dx += bchar.xadvance;
					}
				} else {
					dx = 0;
				}
				var xx = (dx + fchar.xoffset) * sz * this._kerning;
				var w = fchar.width * sz;

				// Truncate conditions..
				//   if this word is added with current letter on current line it will exceed the maximum size
				var condition1 = (lineWidth + spaceLength + xx + w > this._maxWidth);
				//   if this word is added with curent letter on a new line it will also exceed the maximum size
				//   or we are already on the last allowed line
				var condition2 = (xx + w > this._maxWidth || lines.length === this._maxLines - 1);

				if (condition1 && condition2) {
					// truncate
					truncated = true;
				} else {
					processedWord += txt[i][word].charAt(character);
					wordLength = xx + w;
				}
			}

			// we now know the size of the latest word, let's see what we are going to do with it:
			//  keep it in the current line or create a new one ?
			if (currentLine === '') {
				if (truncated) {
					processedWord = this._addTruncator(processedWord);
				}
				currentLine += processedWord;
				lineWidth += wordLength;
			} else if (lineWidth + spaceLength + wordLength > this._maxWidth && (this._maxLines === null || lines.length < this._maxLines - 1)) {
				lines.push(currentLine);
				if (truncated) {
					processedWord = this._addTruncator(processedWord);
				}
				truncated = false;
				currentLine = processedWord;
				lineWidth = wordLength;
			} else {
				currentLine += ' ' + processedWord;
				lineWidth += spaceLength + wordLength;
			}
		}

		// end of a user defined line: we create a new one
		if (truncated) {
			currentLine = this._addTruncator(currentLine);
		}
		lines.push(currentLine);
		truncated = false;
		currentLine = '';
		lineWidth = 0;
	}

	// set the string with the array of lines splitted by \n
	this._string = lines.join('\n');
};

/**
 * @private
 * @desc Remove all characters that are not defined in the current bitmap font
 */
BitmapText.prototype._sanitize = function (str) {
	var fontData = this._fontMap.chars;
	var sanitized = '';
	for (var i = 0; i < str.length; i++) {
		if (fontData[str.charCodeAt(i)] || str.charAt(i) === '\n') {
			sanitized += str.charAt(i);
		}
	}
	return sanitized;
};


/**
 * @private
 */
BitmapText.prototype._updateTxt = function () {
	this._addCarriageReturn();

	this.textWidth = 0;
	this.textHeight = 0;
	this._firstLineOffsetY = 0;

	var str = this._string.split('\n');
	var fontSize = this._fontSize;
	var xalign = this._xalign;
	var yalign = this._yalign;
	var data = [];
	var maxLines = this._maxLines;

	if (str.length === 1 && str[0] === '') {
		this._data = data;
		return;
	}

	// vars that we should get also from the font file

	// init vars
	var fontData = this._fontMap.chars;
	var offsetX = 0;
	var sz = 1 / this._fontMap.meta.info.size * fontSize;
	var dx = 0, dy = 0;
	var xx = 0;
	var yy = 0;
	var lineHeight = fontSize * this._lineHeight;

	// remove unnecessary lines
	if (maxLines !== null && maxLines < str.length) {
		str = str.slice(0, maxLines);
	}

	for (var line = 0; line < str.length; line += 1) {

		var subString = str[line]; // this line's string

		// if line is empty we still want to calculate
		// TODO: this is a little hacky
		if (subString === '') {
			subString = ' ';
		}

		var lineTopHeight = 0;         // size over the character base for this line
		var lineCenterHeight = 0;         // size inside the character base for this line
		var lineBottomHeight = 0;         // size under the text bottom for this line

		var isFirstLine = (line === 0);
		var isLastLine = (line === str.length - 1);

		for (var character = 0; character < subString.length; character++) {

			var charCode = subString.charCodeAt(character);
			var fchar = fontData[charCode];

			if (fchar) {
				// update next char pos offset from last char width
				if (character > 0) {
					var bchar = fontData[subString.charCodeAt(character - 1)];
					if (bchar) {
						dx += bchar.xadvance;
					}
				} else {
					dx = 0;
				}

				// get char final position
				xx = (dx + fchar.xoffset) * sz * this._kerning;
				yy = (dy + fchar.yoffset) * sz * this._kerning;

				// get char size
				var w = fchar.width * sz;
				var h = fchar.height * sz;

				// store char data
				data.push({ sourceX: fchar.x, sourceY: fchar.y, sourceWidth: fchar.width, sourceHeight: fchar.height, x: xx, y: yy + lineHeight * line, width: w, height: h, line: line });

				// calulate the current character size over, inside, and under the textbase
				var charTopHeight = (fchar.yoffset < 0 ? -fchar.yoffset : 0);
				var charCenterHeight = Math.min(fchar.yoffset + fchar.height, this._fontMap.meta.common.base) - (fchar.yoffset > 0 ? fchar.yoffset : 0);
				var charBottomHeight = Math.max(fchar.height - charCenterHeight - charTopHeight, 0);

				charTopHeight *= sz;
				charCenterHeight *= sz;
				charBottomHeight *= sz;

				// update the size over, inside, and under the textbase for the line
				lineTopHeight = Math.max(lineTopHeight, charTopHeight);
				lineCenterHeight = Math.max(lineCenterHeight, charCenterHeight);
				lineBottomHeight = Math.max(lineBottomHeight, charBottomHeight);
			}
		}

		// if this is the first line and if there is some characters going over the text base, we need to offset the draw start position
		if (isFirstLine && lineTopHeight > 0 && yalign !== 'baseline-middle') {
			this._firstLineOffsetY = lineTopHeight * this._kerning;
		}

		// calculate x alignment for this line
		var totalW = xx + data[data.length - 1].width;
		if (xalign === 'center') {
			offsetX = (totalW - this.width) / 2;
		} else if (xalign === 'right') {
			offsetX = totalW - this.width;
		} else if (xalign === 'left') {
			offsetX = 0;
		}
		this.textWidth = Math.max(this.textWidth, totalW);
		this._offset.x[line] = Math.round(-offsetX);

		// calculate the current line height
		var currentLineHeight = 0;
		if (yalign === 'baseline-middle') {
			currentLineHeight = this._fontMap.meta.common.base * sz;
		} else {
			if (lineTopHeight > 0 && lineBottomHeight > 0) {
				lineCenterHeight = this._fontMap.meta.common.base * sz;
			}
			if (isFirstLine) {
				currentLineHeight += lineTopHeight;
			}
			if (!isLastLine) {
				currentLineHeight += lineHeight;
			} else {
				currentLineHeight += lineCenterHeight + lineBottomHeight;
			}
		}

		// and update the component total height
		this.textHeight += currentLineHeight;
	}

	this._data = data;

	// set the alignements offset
	if (yalign === 'middle' || yalign === 'baseline-middle') {
		this._offset.y = (this.height - this.textHeight) / 2;
	} else if (yalign === 'bottom') {
		this._offset.y = this.height - this.textHeight; //-this.textHeight;
	} else if (yalign === 'top') {
		this._offset.y = 0;
	}

};
