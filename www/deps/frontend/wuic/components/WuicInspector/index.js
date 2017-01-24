var inherit = require('inherit');
var EventEmitter = require('EventEmitter');


var DOUBLE_CLICK_DURATION = 150;

//var MOUSE_BTN_LEFT = 1;
//var MOUSE_BTN_MIDDLE = 2;
//var MOUSE_BTN_RIGHT = 3;

var KEY_ENTER = 13;
//var KEY_SPACE = 32;
var KEY_C = 67;
var KEY_D = 68;
var KEY_E = 69;
var KEY_F = 70;
var KEY_L = 76;
var KEY_S = 83;
//var KEY_ARROW_LEFT = 37;
//var KEY_ARROW_UP = 38;
//var KEY_ARROW_RIGHT = 39;
//var KEY_ARROW_DOWN = 40;

var SELECT_COLORS = ['#A00', '#00A', '#0A0', '#0AA', '#5A0', '#05A', '#0A5', '#A50', '#50A', '#AA0', '#A0A'];
var SELECTION_COLOR = '#888';

var HANDLE_HEIGHT = 14;
var BROWSER_ENTRY_HEIGHT = 12;
var BROWSER_CHAR_SIZE = 7;
var EDITOR_WIDTH = 200;
var MENU_WIDTH = 150;

var INSPECTOR_SIZES = {
	STANDARD: {
		BROWSER_ENTRIES: 15,
		BROWSER_WIDTH: 200,
		EDITOR: true
	},
	BIG: {
		BROWSER_ENTRIES: 50,
		BROWSER_WIDTH: 300,
		EDITOR: true
	},
	BROWSER_ONLY: {
		BROWSER_ENTRIES: 50,
		BROWSER_WIDTH: 200,
		EDITOR: false
	}
};

var inspectorSize = 'STANDARD';

/**
 * @class
 * @classDesc WUIC Instector toolkit
 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
 * @param {WuicViewManager} viewManager
 */
function Inspector(viewManager) {

	EventEmitter.call(this);
	var self = this;

	var selectedSprites = [];
	var editing = false; // if a sprite is currently edited in Sprite Editor
	var currentColor = 0;


	function getClassName(obj) {
		var funcNameRegex = /function (.{1,})\(/;
		var results = (funcNameRegex).exec((obj).constructor.toString());
		return (results && results.length > 1) ? results[1] : "";
	}

	window.onmousemove = function (e) {
		self.emit('_move', e);
	};

//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//███████████████████████████████████▀███████████████████████▄▄░▄▄███████████████████████████████████████████▀█████████████████████
//██▀▄▄▄▀░██▄░▀▄▄▄██▀▄▄▄▄▀██▀▄▄▄▄▀██▄░▄▄▄███▀▄▄▄▄▀█████████████░████▄░▀▄▄▀██▀▄▄▄▄░██▄░▀▄▄▀██▀▄▄▄▄▀██▀▄▄▄▀░██▄░▄▄▄███▀▄▄▄▄▀██▄░▀▄▄▄█
//██░████████░██████░▄▄▄▄▄██▀▄▄▄▄░███░██████░▄▄▄▄▄█████████████░█████░███░███▄▄▄▄▀███░███░██░▄▄▄▄▄██░████████░██████░████░███░█████
//██▄▀▀▀▀▄██▀░▀▀▀███▄▀▀▀▀▀██▄▀▀▀▄░▀██▄▀▀▀▄██▄▀▀▀▀▀███████████▀▀░▀▀██▀░▀█▀░▀█░▀▀▀▀▄███░▀▀▀▄██▄▀▀▀▀▀██▄▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▀▄██▀░▀▀▀██
//██████████████████████████████████████████████████████████████████████████████████▀░▀████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████


	function selectableBehavior(dom) {
		dom.onmouseover = function () {
			this.style.backgroundColor = SELECTION_COLOR;
			// e.preventDefault();
		};

		dom.onmouseout = function () {
			this.style.backgroundColor = 'transparent';
			// e.preventDefault();
		};
	}

	function createSeparator(dom) {
		var separator = document.createElement('div');
		dom.appendChild(separator);
		separator.style.width = '100%';
		separator.style.height = '0px';
		separator.style.borderBottom = 'solid 1px ' + SELECTION_COLOR;
	}

	// create editor window
	var mainEditor = document.createElement('div');
	mainEditor.style.display = 'block';
	mainEditor.style.position = 'absolute';
	mainEditor.style.fontFamily = 'courier';
	mainEditor.style.fontSize = '12px';
	mainEditor.style.textAlign = 'left';
	mainEditor.style.color = '#FFF';
	mainEditor.style.margin = '0px';
	mainEditor.style.overflow = 'hidden';
	mainEditor.style.border = 'solid 2px #444';

	document.getElementsByTagName('body')[0].appendChild(mainEditor);


	mainEditor.x = 10;
	mainEditor.y = 10;

	// update editor window position
	mainEditor.updatePosition = function () {
		mainEditor.style.left = mainEditor.x + 'px';
		mainEditor.style.top = mainEditor.y + 'px';
	};

	mainEditor.updatePosition();


//█████████████████████████████████████████████████████████
//██▄░██████████████████████████▄░████▄░███████████████████
//███░▀▄▄▀██▀▄▄▄▄▀██▄░▀▄▄▀██▀▄▄▄▀░█████░████▀▄▄▄▄▀█████████
//███░███░██▀▄▄▄▄░███░███░██░████░█████░████░▄▄▄▄▄█████████
//██▀░▀█▀░▀█▄▀▀▀▄░▀█▀░▀█▀░▀█▄▀▀▀▄░▀██▀▀░▀▀██▄▀▀▀▀▀█████████
//█████████████████████████████████████████████████████████

	var handle = document.createElement('div');
	mainEditor.appendChild(handle);
	handle.style.backgroundColor = '#444';
	handle.style.textAlign = 'center';
	handle.style.width = '100%';
	handle.style.height = HANDLE_HEIGHT + 'px';
	handle.style.overflow = 'hidden';
	handle.style.boxShadow = '0 0 25px black';
	handle.innerText = "░░INSPECTOR░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░";


	handle.onmousedown = function (e) {
		if (editing) {
			return;
		}
		handle._tapped = true;
		handle._tapTime = e.timeStamp;
		handle._originX = e.pageX;
		handle._originY = e.pageY;
		handle._startX = mainEditor.x - e.pageX;
		handle._startY = mainEditor.y - e.pageY;
		e.preventDefault();
	};

	this.on('_move', function (e) {
		if (handle._tapped) {
			// move the element to follow tap movement
			mainEditor.x = handle._startX + e.pageX;
			mainEditor.y = handle._startY + e.pageY;
			mainEditor.updatePosition();
		}
	});

	handle.onmouseup = function (e) {
		handle._tapped = false;
		if ((e.timeStamp - handle._tapTime) < 200 && Math.abs(e.pageX - handle._originX) < 10 && Math.abs(e.pageY - handle._originY) < 10) {
			if (mainEditor.isCollapsed) {
				collapseInspectorWindow();
			} else {
				openMenu(e);
			}
		}
		e.preventDefault();
	};

	function collapseInspectorWindow() {
		if (mainEditor.isCollapsed) {
			mainEditor.isCollapsed = false;
		} else {
			mainEditor.isCollapsed = true;
		}
		updateInspectorSize();
	}

	collapseInspectorWindow();


//█████████████████████████████████████████████████████████████████
//█▄░██████████████████████████████████████████████████████████████
//██░▀▄▄▄▀██▄░▀▄▄▄██▀▄▄▄▄▀██▄░▄█▄░▄█▀▄▄▄▄░██▀▄▄▄▄▀██▄░▀▄▄▄█████████
//██░████░███░██████░████░███░█░█░███▄▄▄▄▀██░▄▄▄▄▄███░█████████████
//█▀░▄▀▀▀▄██▀░▀▀▀███▄▀▀▀▀▄███▄▀▄▀▄██░▀▀▀▀▄██▄▀▀▀▀▀██▀░▀▀▀██████████
//█████████████████████████████████████████████████████████████████

	/**
	 * Inspector browser
	 * browser section of inspector window
	 */

	var browserContainer = document.createElement('div');
	mainEditor.appendChild(browserContainer);
	browserContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
	browserContainer.style.display = 'inline-block';
	browserContainer.style.overflow = 'hidden';

	var browser = document.createElement('div');
	browserContainer.appendChild(browser);
	browser.style.width = '100%';
	browser.style.display = 'block';
	browser.scroll = 0;
	browser.maxScroll = 0;
	browser.entries = [];
	browser.entriesLength = 0;

	browser.onmousewheel = function (e) {
		scrollBrowser(~~(e.wheelDelta / 10));
	};

	function scrollBrowser(scroll) {
		browser.scroll = Math.max(Math.min(0, (INSPECTOR_SIZES[inspectorSize].BROWSER_ENTRIES - browser.maxScroll) * BROWSER_ENTRY_HEIGHT), Math.min(0, browser.scroll + scroll));
		browser.style.webkitTransform = 'translateY(' + browser.scroll + 'px)';
	}

//██████████████████████████████████████████████████████████████████████████████████████████████████████████
//█▄░████████████████████████████████████████████████████████████████████████████████▀██████████████████████
//██░▀▄▄▄▀██▄░▀▄▄▄██▀▄▄▄▄▀██▄░▄█▄░▄█▀▄▄▄▄░██▀▄▄▄▄▀██▄░▀▄▄▄██████████▀▄▄▄▄▀██▄░▀▄▄▀██▄░▄▄▄███▄░▀▄▄▄██▄░▄█▄░▄█
//██░████░███░██████░████░███░█░█░███▄▄▄▄▀██░▄▄▄▄▄███░██████████████░▄▄▄▄▄███░███░███░███████░███████▄▀█▀▄██
//█▀░▄▀▀▀▄██▀░▀▀▀███▄▀▀▀▀▄███▄▀▄▀▄██░▀▀▀▀▄██▄▀▀▀▀▀██▀░▀▀▀███████████▄▀▀▀▀▀██▀░▀█▀░▀██▄▀▀▀▄██▀░▀▀▀█████▄▀▄███
//███████████████████████████████████████████████████████████████████████████████████████████████████▀▀░████
//██████████████████████████████████████████████████████████████████████████████████████████████████████████


	/**
	 * create an new entry in Inspector browser
	 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
	 */

	function createEntry(txt, sprite, depth) {
		// create a new dom element only if needed
		var entry;

		if (browser.entries.length <= browser.entriesLength) {
			entry = document.createElement('div');
			browser.appendChild(entry);
			entry.index = browser.entriesLength;
			browser.entries.push(entry);
			entry.style.width = '100%';
			entry.style.height = BROWSER_ENTRY_HEIGHT + 'px';

			entry.onmousedown = function (e) {
				e.preventDefault();
				// detect double clic
				if ((e.timeStamp - this.doubleClic.timeStamp) < DOUBLE_CLICK_DURATION) {
					// cancel the simple clic action
					window.clearTimeout(this.doubleClic.timeoutId);
					// execute double clic action
					this.expand();
					// remove doubleClic values
					this.doubleClic = {
						timeStamp: 0,
						timeoutId: null
					};
				} else {
					// if sprite is not a leaf
					if (this.spriteRef._children.length > 0) {
						// detect clic on a '+' or '█'
						var c = ~~(e.offsetX / BROWSER_CHAR_SIZE);
						if ((this.depth === 0 && c === 0) || (this.depth > 0 && c === this.depth * 2 - 1)) {
							this.expand();
							// remove doubleClic values
							this.doubleClic = {
								timeStamp: 0,
								timeoutId: null
							};
							return;
						}
					}

					// execute a simple clic action
					var that = this;
					this.doubleClic.timeStamp = e.timeStamp;
					this.doubleClic.timeoutId = window.setTimeout(function () {
						if (that.isSelected) {
							that.isSelected = false;
							that.style.backgroundColor = SELECTION_COLOR;
						} else {
							that.isSelected = true;
							that.style.backgroundColor = that.color;
						}
					}, DOUBLE_CLICK_DURATION);
				}
			};

			entry.onmouseover = function () {
				this.style.backgroundColor = this.isSelected ? this.color : SELECTION_COLOR;
				if (!this.isSelected) {
					addSelection(this.spriteRef, this.color);
				}
			};

			entry.onmouseout = function () {
				this.style.backgroundColor = this.isSelected ? this.color : 'transparent';
				if (!this.isSelected) {
					removeSelection(this.spriteRef);
				}
			};

			// expand the children of a Sprite in the Inspector browser
			entry.expand = function () {
				var i;
				if (this.isExpanded) {
					// fold entry
					this.isExpanded = false;
					// hide all entry directly after this one that have depth lower than self
					i = this.index + 1;
					while (i < browser.entriesLength && browser.entries[i].depth > this.depth) {
						browser.entries[i].hide();
						i++;
					}
				} else {
					// expand entry
					this.isExpanded = true;
					// show entry directly after this one that have depth equal to self.depth + 1 or is already expanded
					i = this.index + 1;
					while (i < browser.entriesLength && browser.entries[i].depth > this.depth) {
						if (browser.entries[i].depth === this.depth + 1) {
							browser.entries[i].show();
						}
						i++;
					}
				}
			};

			// show sprite entry in Inspector browser
			// if sprite were previously expanded, recursively show sprite's children
			entry.show = function () {
				if (this.style.display === 'none') {
					this.style.display = 'block';
					browser.maxScroll += 1;
				}
				// also show child if entry is expanded
				// TODO: move this code in expand function for a lower complexity
				if (this.isExpanded) {
					var i = this.index + 1;
					while (i < browser.entriesLength && browser.entries[i].depth > this.depth) {
						if (browser.entries[i].depth === this.depth + 1) {
							browser.entries[i].show();
						}
						i++;
					}
				}
			};

			// hide sprite entry in Inspector browser
			entry.hide = function () {
				if (this.style.display === 'block') {
					this.style.display = 'none';
					browser.maxScroll -= 1;
				}
			};
		} else {
			entry = browser.entries[browser.entriesLength];
		}

		browser.entriesLength += 1;

		entry.style.display = 'none';
		entry.innerText = txt;
		entry.spriteRef = sprite;
		entry.depth = depth;
		entry.isExpanded = false;

		currentColor = currentColor >= SELECT_COLORS.length - 1 ? 0 : currentColor + 1;
		entry.color = SELECT_COLORS[currentColor];

		entry.doubleClic = {
			timeStamp: 0,
			timeoutId: null
		};

		return entry;
	}

	/**
	 * remove a sprite from selectedSprites array
	 * @author Cedric Stoquer <cstoquer@wizcorp.jp>
	 */

	function removeSelection(sprite) {
		var index = 0;
		while (index < selectedSprites.length && selectedSprites[index].sprite !== sprite) {
			index++;
		}
		if (index < selectedSprites.length) {
			selectedSprites.splice(index, 1);
		}
	}

	function addSelection(sprite, color) {
		selectedSprites.push({sprite: sprite, color: color || SELECTION_COLOR});
	}


//█████████████████████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████▄█████▀██████████████████████████████████▄░█████▄█████▀█████████████████████
//██▀▄▄▄▄░██▄░▀▄▄▀██▄░▀▄▄▄███▄▄░████▄░▄▄▄███▀▄▄▄▄▀██████████▀▄▄▄▄▀██▀▄▄▄▀░███▄▄░████▄░▄▄▄███▀▄▄▄▄▀██▄░▀▄▄▄█
//███▄▄▄▄▀███░███░███░█████████░█████░██████░▄▄▄▄▄██████████░▄▄▄▄▄██░████░█████░█████░██████░████░███░█████
//██░▀▀▀▀▄███░▀▀▀▄██▀░▀▀▀████▀▀░▀▀███▄▀▀▀▄██▄▀▀▀▀▀██████████▄▀▀▀▀▀██▄▀▀▀▄░▀██▀▀░▀▀███▄▀▀▀▄██▄▀▀▀▀▄██▀░▀▀▀██
//██████████▀░▀████████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████

	var editorIsHidden = false;

	var spriteEditor = document.createElement('div');
	mainEditor.appendChild(spriteEditor);

	spriteEditor.style.backgroundColor = 'rgba(0,0,0,0.7)';
	spriteEditor.style.width = EDITOR_WIDTH + 'px';
	spriteEditor.style.height = '100%';
	spriteEditor.style.display = 'inline-block';
	spriteEditor.style.verticalAlign = 'top';

	function editableBehavior(dom, prop) {

		dom.contentEditable = 'true';
		dom.style.outline = 'none';
		dom.prop = prop;

		dom.onmouseover = function (e) {
			e.preventDefault();
			if (editing) {
				return;
			}
			this.style.backgroundColor = SELECTION_COLOR;
		};

		dom.onmouseout = function (e) {
			e.preventDefault();
			if (this.isEdited) {
				return;
			}
			this.style.backgroundColor = 'transparent';
		};

		dom.onfocus = function () {
			if (selectedSprites.length < 1) {
				return;
			}

			this.style.textAlign = 'left';
			this.style.backgroundColor = SELECTION_COLOR;
			this.style.boxShadow = '0 0 20px black';
			this.isEdited = true;
			editing = true;
		};

		dom.onblur = function () {
			this.style.boxShadow = 'none';
			this.isEdited = false;
			this.style.backgroundColor = 'transparent';
			this.style.textAlign = 'right';
			editing = false;
		};

		dom.onkeypress = function (e) {
			if (e.which === KEY_ENTER) {
				e.preventDefault();
				var value;
				try {
					value = this.innerText;
				} catch (error) {
					value = parseFloat(this.innerText);
				}

				this.blur();
				if (isNaN(value)) {
					return;
				}

				for (var i = 0; i < selectedSprites.length; i++) {
					selectedSprites[i].sprite[this.prop] = value;
				}
			}
		};
	}

	function createEditLine(title, prop1, prop2) {
		var line = document.createElement('div');
		spriteEditor.appendChild(line);

		var lineT = document.createElement('div');
		line.appendChild(lineT);
		lineT.style.display = 'inline-block';
		lineT.innerText = title;
		lineT.style.width = '50px';
		line.title = lineT;

		var lineX = document.createElement('div');
		line.appendChild(lineX);
		lineX.style.display = 'inline-block';
		lineX.style.width = '75px';
		lineX.style.textAlign = 'right';
		lineX.innerText = "";
		line.x = lineX;

		if (prop1) {
			editableBehavior(lineX, prop1);
		}

		var lineY = document.createElement('div');
		line.appendChild(lineY);
		lineY.style.display = 'inline-block';
		lineY.style.width = '75px';
		lineY.style.textAlign = 'right';
		lineY.innerText = "";
		line.y = lineY;

		if (prop2) {
			editableBehavior(lineY, prop2);
		}

		return line;
	}

	//------------------------------------
	// construct editor

	var editTitle = document.createElement('div');
	spriteEditor.appendChild(editTitle);
	editTitle.height = '15px';

	var editColor = document.createElement('div');
	editTitle.appendChild(editColor);
	editColor.style.display = 'inline-block';
	editColor.innerText = '●';
	editColor.style.textAlign = 'left';
	editColor.style.width = '10px';
	editColor.style.height = '100%';

	var editName = document.createElement('div');
	editTitle.appendChild(editName);
	editName.style.display = 'inline-block';
	editName.innerText = '';
	editName.style.textAlign = 'left';
	editName.style.width = '190px';
	editName.style.height = '100%';
	editName.style.whiteSpace = 'nowrap';

	selectableBehavior(editName);

	createSeparator(spriteEditor);

	var editPos = createEditLine("POS", 'x', 'y');
	var editSiz = createEditLine("SIZE", 'width', 'height');
	var editPvt = createEditLine("PIVOT", 'pivotX', 'pivotY');
	var editScl = createEditLine("SCALE", 'scaleX', 'scaleY');
	var editSkw = createEditLine("SKEW", 'skewX', 'skewY');
	var editRot = createEditLine("ROT", 'rotation');
	var editAlp = createEditLine("ALPHA", 'alpha');
	var editVis = createEditLine("VISIBLE");
	var editEnb = createEditLine("ENABLED");

	createSeparator(spriteEditor);

	var absPos = createEditLine("RELATIVE");
	var parPos = createEditLine("PARENT");

	createSeparator(spriteEditor);

	//------------------------------------
	// update editor

	function updateSpriteEditor(sprite, local, color) {
		if (editing) {
			return;
		}

		editName.innerText = '{' + getClassName(sprite) + '} ' + (sprite.name || '');
		editPos.x.innerText = String(sprite.x).substring(0, 10);
		editPos.y.innerText = String(sprite.y).substring(0, 10);
		editSiz.x.innerText = String(sprite.width).substring(0, 10);
		editSiz.y.innerText = String(sprite.height).substring(0, 10);
		editPvt.x.innerText = String(sprite.pivotX).substring(0, 10);
		editPvt.y.innerText = String(sprite.pivotY).substring(0, 10);
		editScl.x.innerText = String(sprite.scaleX).substring(0, 10);
		editScl.y.innerText = String(sprite.scaleY).substring(0, 10);
		editSkw.x.innerText = String(sprite.skewX).substring(0, 10);
		editSkw.y.innerText = String(sprite.skewY).substring(0, 10);
		editRot.x.innerText = String(sprite.rotation).substring(0, 10);
		editRot.y.innerText = '(' + String(sprite.rotation / Math.PI * 180).substring(0, 8) + '°)';
		editAlp.x.innerText = String(sprite.alpha).substring(0, 9);
		editVis.x.innerText = String(sprite._visible);
		editVis.y.innerText = String(local.visible);
		editEnb.x.innerText = String(sprite.__enable);
		editEnb.y.innerText = String(local.enabled);

		absPos.x.innerText = String(-local.localX).substring(0, 9);
		absPos.y.innerText = String(-local.localY).substring(0, 9);
		parPos.x.innerText = String(-local.parentX).substring(0, 9);
		parPos.y.innerText = String(-local.parentY).substring(0, 9);

		editColor.style.color = color || '#FFF';
	}

	function hideEditorValues() {
		editorIsHidden = true;
		editColor.style.color = 'FFF';
		editName.style.display = 'none';
		editPos.x.style.display = 'none';
		editPos.y.style.display = 'none';
		editSiz.x.style.display = 'none';
		editSiz.y.style.display = 'none';
		editPvt.x.style.display = 'none';
		editPvt.y.style.display = 'none';
		editScl.x.style.display = 'none';
		editScl.y.style.display = 'none';
		editSkw.x.style.display = 'none';
		editSkw.y.style.display = 'none';
		editRot.x.style.display = 'none';
		editRot.y.style.display = 'none';
		editAlp.x.style.display = 'none';
		editVis.x.style.display = 'none';
		editVis.y.style.display = 'none';
		editEnb.x.style.display = 'none';
		editEnb.y.style.display = 'none';
		absPos.x.style.display = 'none';
		absPos.y.style.display = 'none';
		parPos.x.style.display = 'none';
		parPos.y.style.display = 'none';
	}

	function showEditorValues() {
		editorIsHidden = false;
		editName.style.display = 'inline-block';
		editPos.x.style.display = 'inline-block';
		editPos.y.style.display = 'inline-block';
		editSiz.x.style.display = 'inline-block';
		editSiz.y.style.display = 'inline-block';
		editPvt.x.style.display = 'inline-block';
		editPvt.y.style.display = 'inline-block';
		editScl.x.style.display = 'inline-block';
		editScl.y.style.display = 'inline-block';
		editSkw.x.style.display = 'inline-block';
		editSkw.y.style.display = 'inline-block';
		editRot.x.style.display = 'inline-block';
		editRot.y.style.display = 'inline-block';
		editAlp.x.style.display = 'inline-block';
		editVis.x.style.display = 'inline-block';
		editVis.y.style.display = 'inline-block';
		editEnb.x.style.display = 'inline-block';
		editEnb.y.style.display = 'inline-block';
		absPos.x.style.display = 'inline-block';
		absPos.y.style.display = 'inline-block';
		parPos.x.style.display = 'inline-block';
		parPos.y.style.display = 'inline-block';
	}


//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//██████████████▄░█████▄█████▀███████████████████████████████████████████████████████████████▀█████████████████████
//██▀▄▄▄▄▀██▀▄▄▄▀░███▄▄░████▄░▄▄▄███████████▄░▀▄▄▀██▄░▀▄▄▄██▀▄▄▄▄▀██▄░▀▄▄▀██▀▄▄▄▄▀██▄░▀▄▄▄██▄░▄▄▄███▄░▄█▄░▄████████
//██░▄▄▄▄▄██░████░█████░█████░███████████████░███░███░██████░████░███░███░██░▄▄▄▄▄███░███████░███████▄▀█▀▄█████████
//██▄▀▀▀▀▀██▄▀▀▀▄░▀██▀▀░▀▀███▄▀▀▀▄███████████░▀▀▀▄██▀░▀▀▀███▄▀▀▀▀▄███░▀▀▀▄██▄▀▀▀▀▀██▀░▀▀▀████▄▀▀▀▄████▄▀▄██████████
//██████████████████████████████████████████▀░▀█████████████████████▀░▀██████████████████████████████▀▀░███████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████


	//------------------------------------
	// increment propertie

	function incrementProperty(prop, incr, min, max) {
		for (var i = 0; i < selectedSprites.length; i++) {
			var sprite = selectedSprites[i].sprite;
			sprite[prop] += incr;
			if (typeof min !== 'undefined') {
				sprite[prop] = Math.max(min, sprite[prop]);
			}
			if (typeof max !== 'undefined') {
				sprite[prop] = Math.min(max, sprite[prop]);
			}
		}
	}

	editPos.x.onmousewheel = function (e) {
		incrementProperty('x', ~~(e.wheelDelta / 100));
	};
	editPos.y.onmousewheel = function (e) {
		incrementProperty('y', ~~(e.wheelDelta / 100));
	};
	editSiz.x.onmousewheel = function (e) {
		incrementProperty('width', ~~(e.wheelDelta / 100));
	};
	editSiz.y.onmousewheel = function (e) {
		incrementProperty('height', ~~(e.wheelDelta / 100));
	};
	editPvt.x.onmousewheel = function (e) {
		incrementProperty('pivotX', ~~(e.wheelDelta / 100));
	};
	editPvt.y.onmousewheel = function (e) {
		incrementProperty('pivotY', ~~(e.wheelDelta / 100));
	};
	editScl.x.onmousewheel = function (e) {
		incrementProperty('scaleX', ~~(e.wheelDelta / 100) * 0.1);
	};
	editScl.y.onmousewheel = function (e) {
		incrementProperty('scaleY', ~~(e.wheelDelta / 100) * 0.1);
	};
	editSkw.x.onmousewheel = function (e) {
		incrementProperty('skewX', ~~(e.wheelDelta / 100) * 0.01);
	};
	editSkw.y.onmousewheel = function (e) {
		incrementProperty('skewY', ~~(e.wheelDelta / 100) * 0.01);
	};
	editRot.x.onmousewheel = function (e) {
		incrementProperty('rotation', ~~(e.wheelDelta / 100) * 0.01);
	};
	editRot.y.onmousewheel = function (e) {
		incrementProperty('rotation', ~~(e.wheelDelta / 100) * Math.PI / 180);
	};
	editAlp.x.onmousewheel = function (e) {
		incrementProperty('alpha', ~~(e.wheelDelta / 100) * 0.01, 0, 1);
	};

	selectableBehavior(editRot.y);
	selectableBehavior(editVis.x);
	selectableBehavior(editEnb.x);

	editVis.x.onmousedown = function () {
		if (selectedSprites.length < 1) {
			return;
		}

		var visible = !(selectedSprites[selectedSprites.length - 1].sprite._visible);
		for (var i = 0; i < selectedSprites.length; i++) {
			selectedSprites[i].sprite._visible = visible;
		}
	};

	editEnb.x.onmousedown = function () {
		if (selectedSprites.length < 1) {
			return;
		}

		var enable = !(selectedSprites[selectedSprites.length - 1].sprite.__enable);
		for (var i = 0; i < selectedSprites.length; i++) {
			selectedSprites[i].sprite.__enable = enable;
		}
	};


//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//███████████████████▀██████████████▀▄▄▄▀░█████████████████████▄█████▀███████████████████████▀█████████████████████████████
//██▀▄▄▄▀░▄█▀▄▄▄▄▀██▄░▄▄▄███████████▄▀▀▀▀███▄░▀▄▄▀██▄░▀▄▄▄███▄▄░████▄░▄▄▄███▀▄▄▄▄▀██████████▄░▄▄▄███▄░▀▄▄▄██▀▄▄▄▄▀██▀▄▄▄▄▀█
//██░████░██░▄▄▄▄▄███░███████████████████░███░███░███░█████████░█████░██████░▄▄▄▄▄███████████░███████░██████░▄▄▄▄▄██░▄▄▄▄▄█
//██▄▀▀▀▄░██▄▀▀▀▀▀███▄▀▀▀▄██████████░▄▀▀▀▄███░▀▀▀▄██▀░▀▀▀████▀▀░▀▀███▄▀▀▀▄██▄▀▀▀▀▀███████████▄▀▀▀▄██▀░▀▀▀███▄▀▀▀▀▀██▄▀▀▀▀▀█
//███▀▀▀▀▄██████████████████████████████████▀░▀████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

	function snapshotSprite(sprite, depth) {
		var str = '';
		var i;
		for (i = 1; i < depth; i++) {
			str += '| ';
		}

		str += sprite._parent === null ? '█ ' : (sprite._children.length === 0 ? '|-' : '|+');
		str += sprite.name ? sprite.name : getClassName(sprite);

		var entry = createEntry(str, sprite, depth);

		for (i = 0; i < sprite._children.length; i++) {
			snapshotSprite(sprite._children[i], depth + 1);
		}
		return entry;
	}

	function snapshotViews() {
		var i;
		// reset Inspector window's browser entries
		for (i = 0; i < browser.entriesLength; i++) {
			browser.entries[i].style.display = 'none';
		}
		browser.scroll = 0;
		browser.maxScroll = 0;
		browser.entriesLength = 0;
		currentColor = 0;
		// go thru every views of the project
		var keys = Object.keys(viewManager.views);
		for (i = 0; i < keys.length; i++) {
			var entry = snapshotSprite(viewManager.views[keys[i]], 0);
			entry.style.display = 'block';
			browser.maxScroll += 1;
		}
	}

	snapshotViews();

//█████████████████████████████████████████████████████████████████████████████████
//█████████████████████▄███████████████████████████████████████████████████████████
//█▄░▀▄▀▀▄▀█▀▄▄▄▄▀███▄▄░████▄░▀▄▄▀█████████▄░▀▄▀▀▄▀█▀▄▄▄▄▀██▄░▀▄▄▀██▄░██▄░█████████
//██░██░██░█▀▄▄▄▄░█████░█████░███░██████████░██░██░█░▄▄▄▄▄███░███░███░███░█████████
//█▀░▀█░▀█░█▄▀▀▀▄░▀██▀▀░▀▀██▀░▀█▀░▀████████▀░▀█░▀█░█▄▀▀▀▀▀██▀░▀█▀░▀██▄▀▀▄░▀████████
//█████████████████████████████████████████████████████████████████████████████████

	/**
	 * the main menu of inspector window
	 * accessible when clic on the handle bar
	 */

	var mainMenu = document.createElement('div');
	mainEditor.appendChild(mainMenu);
	mainMenu.style.display = 'none';
	mainMenu.style.position = 'absolute';
	mainMenu.style.width = MENU_WIDTH + 'px';
	mainMenu.style.backgroundColor = '#444';
	mainMenu.style.border = 'solid 2px ' + SELECTION_COLOR;
	mainMenu.height = 0;
	mainMenu.style.overflow = 'hidden';
	mainMenu.style.boxShadow = '0 0 30px black';

	mainMenu.onmouseout = function () {
		mainMenu.closing = window.setTimeout(function () {
			closeMenu();
		}, 200);
	};

	mainMenu.onmouseover = function () {
		if (mainMenu.closing) {
			window.clearTimeout(mainMenu.closing);
		}
		mainMenu.closing = false;
	};

	function openMenu(e) {
		if (mainMenu.style.display === 'block') {
			return;
		}

		var browserWidth = INSPECTOR_SIZES[inspectorSize].BROWSER_WIDTH + (INSPECTOR_SIZES[inspectorSize].EDITOR ? EDITOR_WIDTH : 0);
		var x = Math.min(browserWidth - MENU_WIDTH - 4, Math.max(0, e.offsetX - 10)) || 0;
		var y = Math.max(0, e.offsetY - 10) || 0;
		mainMenu.style.display = 'block';
		mainMenu.style.left = x + 'px';
		mainMenu.style.top = y + 'px';
		menuLogSprite.style.color = selectedSprites.length > 0 ? '#FFF' : '#555';
	}

	function closeMenu() {
		if (mainMenu.style.display === 'none') {
			return;
		}
		mainMenu.style.display = 'none';
	}

	function addMenuEntry(title) {
		var dom = document.createElement('div');
		mainMenu.appendChild(dom);

		dom.style.width = '100%';
		dom.style.height = '13px';
		dom.innerText = title;

		selectableBehavior(dom);

		mainMenu.height += 13;
		mainMenu.style.height = mainMenu.height + 'px';
		return dom;
	}

	function addMenuSeparator() {
		var separator = document.createElement('div');
		mainMenu.appendChild(separator);
		separator.style.width = '100%';
		separator.style.height = '0px';
		separator.style.borderBottom = 'solid 1px ' + SELECTION_COLOR;
		mainMenu.height += 1;
		mainMenu.style.height = mainMenu.height + 'px';
	}

	var menuRefresh = addMenuEntry('refresh Sprite Tree');
	var menuExpandAll = addMenuEntry('expand all        <E>');
	var menuExpandSel = addMenuEntry('expand selection  <S>');
	var menuFoldAll = addMenuEntry('fold all          <F>');
	var menuSelectChild = addMenuEntry('select children   <C>');
	var menuUnselect = addMenuEntry('deselect all      <D>');
	addMenuSeparator();
	var menuLogSprite = addMenuEntry('log sprite        <L>');
	addMenuSeparator();
	var menuSize0 = addMenuEntry('small interface');
	var menuSize2 = addMenuEntry('big interface');
	var menuSize1 = addMenuEntry('browser only');
	var menuMinimize = addMenuEntry('minimize Inspector');


	menuRefresh.onmousedown = function () {
		snapshotViews();
		closeMenu();
	};

	menuFoldAll.onmousedown = function () {
		foldAll();
		closeMenu();
	};

	menuExpandAll.onmousedown = function () {
		expandAll();
		closeMenu();
	};

	menuExpandSel.onmousedown = function () {
		expandSelection();
		closeMenu();
	};

	menuSelectChild.onmousedown = function () {
		selectChildren();
		closeMenu();
	};

	menuUnselect.onmousedown = function () {
		unselectAll();
		closeMenu();
	};

	menuLogSprite.onmousedown = function () {
		logSprite();
		closeMenu();
	};

	menuMinimize.onmousedown = function () {
		collapseInspectorWindow();
		closeMenu();
	};

	menuSize0.onmousedown = function () {
		inspectorSize = 'STANDARD';
		updateInspectorSize();
		closeMenu();
	};

	menuSize1.onmousedown = function () {
		inspectorSize = 'BROWSER_ONLY';
		updateInspectorSize();
		closeMenu();
	};

	menuSize2.onmousedown = function () {
		inspectorSize = 'BIG';
		updateInspectorSize();
		closeMenu();
	};

//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████▀▀▀███████████████████████████▀█████████▄███████████████████████████████████
//█▄░▀▄▀▀▄▀█▀▄▄▄▄▀██▄░▀▄▄▀██▄░██▄░██████████▀▀░▀▀▀██▄░██▄░██▄░▀▄▄▀██▀▄▄▄▀░██▄░▄▄▄████▄▄░████▀▄▄▄▄▀██▄░▀▄▄▀██▀▄▄▄▄░█████████
//██░██░██░█░▄▄▄▄▄███░███░███░███░████████████░██████░███░███░███░██░████████░█████████░████░████░███░███░███▄▄▄▄▀█████████
//█▀░▀█░▀█░█▄▀▀▀▀▀██▀░▀█▀░▀██▄▀▀▄░▀█████████▀▀░▀▀▀███▄▀▀▄░▀█▀░▀█▀░▀█▄▀▀▀▀▄███▄▀▀▀▄███▀▀░▀▀██▄▀▀▀▀▄██▀░▀█▀░▀█░▀▀▀▀▄█████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

	function foldAll() {
		browser.maxScroll = 0;
		for (var i = 0; i < browser.entriesLength; i++) {
			browser.entries[i].isExpanded = false;
			if (browser.entries[i].depth > 0) {
				browser.entries[i].style.display = 'none';
			} else {
				browser.maxScroll += 1;
			}
		}
		scrollBrowser(0);
	}

	function expandAll() {
		browser.maxScroll = browser.entriesLength;
		for (var i = 0; i < browser.entriesLength; i++) {
			browser.entries[i].isExpanded = true;
			browser.entries[i].style.display = 'block';
		}
	}

	function expandSelection() {
		for (var i = 0; i < browser.entriesLength; i++) {
			if (browser.entries[i].isSelected) {
				var j = i + 1;
				while (j < browser.entriesLength && browser.entries[j].depth > browser.entries[i].depth) {
					if (!browser.entries[j].isExpanded) {
						browser.entries[j].isExpanded = true;
						browser.entries[j].style.display = 'block';
						browser.maxScroll += 1;
					}
					j += 1;
				}
			}
		}
	}

	function unselectAll() {
		for (var i = 0; i < browser.entriesLength; i++) {
			browser.entries[i].isSelected = false;
			browser.entries[i].style.backgroundColor = 'transparent';
		}
		selectedSprites = [];
	}

	function logSprite() {
		if (selectedSprites.length > 0) {
			console.log(selectedSprites[0].sprite);
		}
	}

	function selectChildren() {
		selectedSprites = [];
		var toSelect = [];
		var i, j;

		// determine which entries has to be selected
		for (i = 0; i < browser.entriesLength; i++) {
			if (browser.entries[i].isSelected) {
				// select all direct children of this entry
				j = i + 1;
				while (j < browser.entriesLength && browser.entries[j].depth > browser.entries[i].depth) {
					if (browser.entries[j].depth === browser.entries[i].depth + 1) {
						toSelect.push(j);
					}
					j += 1;
				}
			}
		}

		// remove doublons
		toSelect.sort(function (a, b) {
			return a - b;
		});
		i = 0;
		while (i < toSelect.length - 1) {
			if (toSelect[i] === toSelect[i + 1]) {
				toSelect.splice(i + 1, 1);
			} else {
				i += 1;
			}
		}

		// select entry and unselect other
		j = 0;
		for (i = 0; i < browser.entriesLength; i++) {
			if (i === toSelect[j]) {
				browser.entries[i].isSelected = true;
				browser.entries[i].style.backgroundColor = browser.entries[i].color;
				selectedSprites.push({sprite: browser.entries[i].spriteRef, color: browser.entries[i].color});
				j += 1;
			} else {
				browser.entries[i].style.backgroundColor = 'transparent';
				browser.entries[i].isSelected = false;
			}
		}
	}

//█████████████████████████████████████████████████████████████████████████
//██▄░█████████████████████▄░███████████████████████████████████▄░█████████
//███░█▄░▄▄█▀▄▄▄▄▀██▄░▄█▄░▄█░▀▄▄▄▀██▀▄▄▄▄▀██▀▄▄▄▄▀██▄░▀▄▄▄██▀▄▄▄▀░█████████
//███░▄░████░▄▄▄▄▄███▄▀█▀▄██░████░██░████░██▀▄▄▄▄░███░██████░████░█████████
//██▀░██░▀▀█▄▀▀▀▀▀████▄▀▄██▀░▄▀▀▀▄██▄▀▀▀▀▄██▄▀▀▀▄░▀█▀░▀▀▀███▄▀▀▀▄░▀████████
//███████████████████▀▀░███████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████


	viewManager.on('keydown', function (e, key) {
		if (editing) {
			return;
		}

		switch (key) {
		case KEY_C:
			selectChildren();
			break;
		case KEY_D:
			unselectAll();
			break;
		case KEY_E:
			expandAll();
			break;
		case KEY_F:
			foldAll();
			break;
		case KEY_L:
			logSprite();
			break;
		case KEY_S:
			expandSelection();
			break;
		default:
			return;
		}
	});


//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//█████▄█████████████████████████████████████████████▀█████████████████████████████████████████▄███████████████████████████
//███▄▄░████▄░▀▄▄▀██▀▄▄▄▄░██▄░▀▄▄▀██▀▄▄▄▄▀██▀▄▄▄▀░██▄░▄▄▄███▀▄▄▄▄▀██▄░▀▄▄▄██████████▀▄▄▄▄░███▄▄░█████░▄▄░▄██▀▄▄▄▄▀█████████
//█████░█████░███░███▄▄▄▄▀███░███░██░▄▄▄▄▄██░████████░██████░████░███░███████████████▄▄▄▄▀█████░██████▀▄████░▄▄▄▄▄█████████
//███▀▀░▀▀██▀░▀█▀░▀█░▀▀▀▀▄███░▀▀▀▄██▄▀▀▀▀▀██▄▀▀▀▀▄███▄▀▀▀▄██▄▀▀▀▀▄██▀░▀▀▀███████████░▀▀▀▀▄███▀▀░▀▀███░▀▀▀░██▄▀▀▀▀▀█████████
//██████████████████████████▀░▀████████████████████████████████████████████████████████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

	function updateInspectorSize() {
		if (mainEditor.isCollapsed) {
			mainEditor.style.width = 100 + 'px';
			mainEditor.style.height = 14 + 'px';
		} else {
			mainEditor.style.width = INSPECTOR_SIZES[inspectorSize].BROWSER_WIDTH + (INSPECTOR_SIZES[inspectorSize].EDITOR ? EDITOR_WIDTH : 0) + 'px';
			mainEditor.style.height = (HANDLE_HEIGHT + BROWSER_ENTRY_HEIGHT * INSPECTOR_SIZES[inspectorSize].BROWSER_ENTRIES) + 'px';
			browserContainer.style.width = INSPECTOR_SIZES[inspectorSize].BROWSER_WIDTH + 'px';
			browserContainer.style.height = INSPECTOR_SIZES[inspectorSize].BROWSER_ENTRIES * BROWSER_ENTRY_HEIGHT + 'px';
		}
	}

	updateInspectorSize();


//█████████████████████████████████████████████████████████████████████████████████████████████████████████
//█▄ ███████████████████████████████████▄ █████▄███████████████████████████▄ ██████████████████████████████
//██ ▀▄▄▄▀██▀▄▄▄▄▀██▄ ██▄ ██▄ ▀▄▄▀██▀▄▄▄▀ ███▄▄ ████▄ ▀▄▄▀██▀▄▄▄▀ ▄█████████ ▀▄▄▄▀██▀▄▄▄▄▀██▄ ██ ▄█████████
//██ ████ ██ ████ ███ ███ ███ ███ ██ ████ █████ █████ ███ ██ ████ ██████████ ████ ██ ████ ████  ███████████
//█▀ ▄▀▀▀▄██▄▀▀▀▀▄███▄▀▀▄ ▀█▀ ▀█▀ ▀█▄▀▀▀▄ ▀██▀▀ ▀▀██▀ ▀█▀ ▀█▄▀▀▀▄ █████████▀ ▄▀▀▀▄██▄▀▀▀▀▄██▀ ██ ▀█████████
//███████████████████████████████████████████████████████████▀▀▀▀▄█████████████████████████████████████████
//█████████████████████████████████████████████████████████████████████████████████████████████████████████


	//Add a placeholder function for browsers that don't have setLineDash()
	if (!window.context.setLineDash) {
		window.context.setLineDash = function () {
		};
	}

	viewManager.on('updated', function () {

		// only draw is inspector is expanded
		if (mainEditor.isCollapsed) {
			return;
		}

		// clear editor window if there is no selection
		if (selectedSprites.length > 0) {
			if (editorIsHidden) {
				showEditorValues();
			}
		} else {
			if (!editorIsHidden) {
				hideEditorValues();
			}
		}

		// draw bounding box if a Sprite is selected
		for (var index = 0; index < selectedSprites.length; index++) {
			var context = window.context;
			var sprite = selectedSprites[index].sprite;
			var color = selectedSprites[index].color;
			var local = sprite.getLocalCoordinate(0, 0);

			// get sprite top parent
			var topParent = sprite;
			var parents = [];
			while (topParent !== null) {
				parents.unshift(topParent);
				topParent = topParent._parent;
			}

			// apply all transformation from the top parent to sprite
			context.save();

			var i;
			var totalscaleX = 1;
			// var totalscaleY = 1;
			for (i = 0; i < parents.length; i++) {
				context.translate(parents[i].x + parents[i].pivotX, parents[i].y + parents[i].pivotY);
				context.rotate(parents[i].rotation);
				context.transform(1, Math.tan(parents[i].skewY), Math.tan(parents[i].skewX), 1, 0, 0);
				context.scale(parents[i].scaleX, parents[i].scaleY);
				context.translate(-parents[i].pivotX, -parents[i].pivotY);
				totalscaleX *= parents[i].scaleX;
				// totalscaleY *= parents[i].scaleY;
			}

			var lineWidth = (1 / totalscaleX) || 1;
			var pivotSize = lineWidth * 5;

			context.lineWidth = lineWidth;
			context.strokeStyle = color;
			context.fillStyle = color;

			// draw the pivot point
			context.beginPath();
			context.moveTo(sprite.pivotX - pivotSize, sprite.pivotY);
			context.lineTo(sprite.pivotX + pivotSize, sprite.pivotY);
			context.stroke();
			context.beginPath();
			context.moveTo(sprite.pivotX, sprite.pivotY - pivotSize);
			context.lineTo(sprite.pivotX, sprite.pivotY + pivotSize);
			context.stroke();

			// draw a bounding box
			if (!local.visible) {
				context.setLineDash([lineWidth * 2, lineWidth]);
			}
			context.strokeRect(0, 0, sprite.width, sprite.height);
			context.globalAlpha = 0.2;
			context.fillRect(0, 0, sprite.width, sprite.height);
			context.restore();

			// editor
			if (index === selectedSprites.length - 1) {
				updateSpriteEditor(sprite, local, color);
			}
		}
	});

}

inherit(Inspector, EventEmitter);
module.exports = Inspector;
