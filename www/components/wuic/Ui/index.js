var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');

var swipeBehavior = require('wuicSwipeBehavior');
var Tween = require('wuicTween').Tween;
var twTime = 0.25;

var QuickSlots = require('QuickSlots');
var Inventory = require('Inventory');
var Portrait = require('Portrait');
var Console = require('Console');


// -------------------------------------------------
// UI
// -------------------------------------------------

function Ui(parent) {
	Sprite.call(this);
	this.parent = parent;
	var self = this;

	// set vars
	this.tweens = {};
	this.width = window.canvasWidth;
	this.height = window.canvasHeight;
	this.zIndex = 2;

	this.selectedSlot = null;
	
	// ---------------------------
	// initialize ui

	this.init = function () {
		// create ui elements
		this.createBackground(this);
		this.portrait = this.appendChild(new Portrait(this));
		this.inventory = this.appendChild(new Inventory(this));
		this.quickSlots = this.appendChild(new QuickSlots(this));
		this.console = this.appendChild(new Console(this));
		this.createDragItem();

		//this.console.init();
		//this.portrait.init();
		//this.inventory.init();
		//this.quickSlots.init();
		
		// initialize ui states
		window.focus = 'dungeon';
		this.state = 'closed';

		// render
		this.setRenderMethod(function () { // context
			for (var i in this.tweens) { this.tweens[i].update(); }
			this.sortChilden(function (a, b) { return a.zIndex - b.zIndex; });
		});
	};

	
	// ---------------------------
	// select ui draggable slot

	this.selectSlot = function (slot) {
		if (this.selectedSlot) { this.selectedSlot.selected = false; }
		if (slot && slot.item && slot.item.tileset) {
			this.selectedSlot = slot;
			this.selectedSlot.selected = true;
			this.inventory.inventoryInfo.update(slot.item);
		} else {
			this.inventory.inventoryInfo.update(null);
		}
		
	};

	// ---------------------------
	// create dummy item for using when dragging
	this.createDragItem = function () {
		this.dragItem = this.appendChild(new Sprite());
		this.dragItem.zIndex = 100;
		this.dragItem.hide();
		this.dragItem.setRenderMethod(function (context) {
			// update tweens
			for (var i in this.tweens) {
				this.tweens[i].update();
			}

			// draw item
			if (this.tileset) {
				context.drawImage(this.tileset.img,
					this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
					5, 4, this.width, this.height);
			}

			// draw units
			if (this.units > 1) {
				utils.drawText(context, this.units, 30, 30, 'white', 'right', 6);
			}
		});
	};


	// ---------------------------
	// create inventory background

	this.createBackground = function () {
		// create bg
		this.bg = this.appendChild(new Sprite());
		this.bg.width = this.width;
		this.bg.height = this.height;
		this.bg.zIndex = 0;

		// render bg
		this.bg.setRenderMethod(function (context) {
			context.fillStyle = 'rgba(0, 0, 0, 0.7)';
			context.fillRect(0, 0, this.width, this.height);
		});
		
		// hide and disable bg
		this.bg.hide();
		this.bg.disable(); // necessary for propper clicking on dungeon view
	};

	
	// ---------------------------
	// open/close inventory

	// open ui
	this.open = function (cb) {
		window.focus = 'ui';
		this.state = 'open';
		
		this.quickSlots.btnPlus.tileset = utils.getTilesetById('ui', 'minus');
		this.selectSlot(null);

		this.bg.show();
		this.inventory.show();
		this.console.hide();
		
		var tween = this.tweens.fade = new Tween(Tween.QuadInOut, { a: 0 }, { a: 1 }, 0, twTime);
		tween.on('change', function (v) {
			self.bg.alpha = v.a;
			self.inventory.alpha = v.a;
		});
		tween.on('finish', function () {
			if (cb) { cb(); }
		});
		tween.start();

		var title = self.inventory.headerBg;
		tween = this.tweens.top = new Tween(Tween.QuadOut, { x: this.width + 10 }, { x: title.startX }, 0, twTime);
		tween.on('change', function (v) { title.x = v.x; });
		tween.start();

		var inv = self.inventory.inventoryBg;
		tween = this.tweens.right = new Tween(Tween.QuadOut, { x: this.width + 10 }, { x: inv.startX }, 0, twTime);
		tween.on('change', function (v) { inv.x = v.x; });
		tween.start();

		var equip = self.inventory.equipmentBg;
		tween = this.tweens.left = new Tween(Tween.QuadOut, { x: -equip.width - 10 }, { x: equip.startX }, 0, twTime);
		tween.on('change', function (v) { equip.x = v.x; });
		tween.start();
	};


	// close ui
	this.close = function (cb) {
		this.state = 'closed';
		this.quickSlots.btnPlus.tileset = utils.getTilesetById('ui', 'plus');
		this.selectSlot(null);

		var tween = this.tweens.fade = new Tween(Tween.QuadInOut, { a: 1 }, { a: 0 }, 0, twTime);
		tween.on('change', function (v) {
			self.bg.alpha = v.a;
			self.inventory.alpha = v.a;
		});
		tween.on('finish', function () {
			window.focus = 'dungeon';
			self.bg.hide();
			self.inventory.hide();
			self.console.show();
			if (cb) { cb(); }
		});
		tween.start();

		var title = self.inventory.headerBg;
		tween = this.tweens.top = new Tween(Tween.QuadInOut, { x: title.x }, { x: this.width + 10 }, 0, twTime);
		tween.on('change', function (v) { title.x = v.x; });
		tween.start();

		var inv = self.inventory.inventoryBg;
		tween = this.tweens.right = new Tween(Tween.QuadInOut, { x: inv.x }, { x: this.width + 10 }, 0, twTime);
		tween.on('change', function (v) { inv.x = v.x; });
		tween.start();

		var equip = self.inventory.equipmentBg;
		tween = this.tweens.left = new Tween(Tween.QuadInOut, { x: equip.x }, { x: -equip.width - 10 }, 0, twTime);
		tween.on('change', function (v) { equip.x = v.x; });
		tween.start();
	};


	// -------------------------------------------------
	// Swipe Behavior
	// -------------------------------------------------

	this.initSwipeBehavior = function () {

		// init swap behavior
		swipeBehavior(this, parent);

		var swOriginPos = { x: 0, y: 0 };
		var swPos = { x: 0, y: 0 };
		var swIncs = { x: 0, y: 0 };
		var tapDistanceMax = 4;
		var swipeCancel = false;

		var obj;
		
		this.on('swipestart', function (e, state) {
			// init swipe vars
			swPos = swOriginPos = { x: state.x, y: state.y };
			swIncs = { x: 0, y: 0 };
			swipeCancel = true;

			// get object under mouse
			obj = this.getElementAtPos(swPos);
			if (obj) {
				if (self.state === 'closed') { window.focus = 'ui'; }
				obj.emit('swipestart', swPos);
			}
		});


		this.on('swipe', function (e, state) {

			// update incs and pos
			swIncs = { x: state.x - swPos.x, y: state.y - swPos.y };
			swPos = { x: state.x, y: state.y };

			// if we moved over maxDistance, means we didnt cancel the swipe
			var a = Math.abs(swPos.x - swOriginPos.x);
			var b = Math.abs(swPos.y - swOriginPos.y);
			if (a > tapDistanceMax || b > tapDistanceMax) { swipeCancel = false; }

			if (obj) { obj.emit('swipe', swPos, swIncs); }
		});


		this.on('swipeend', function () { // e, state, pos
			
			if (obj) { obj.emit('swipeend', swPos); }

			// if mouse distance from origin is small enough, means we are tapping instead of swiping
			if (swipeCancel) {
				return this.emit('swipecancel');
			} else {
				if (self.state === 'closed') { window.focus = 'dungeon'; }
			}
		});


		this.on('swipecancel', function () {
			if (obj) { obj.emit('tap'); }
			if (self.state === 'closed') {
				window.setTimeout(function () {
					window.focus = 'dungeon';
				}, 0);
			}
		});
	};

	this.initSwipeBehavior();



	// -------------------------------------------------
	// Place Item in Slot
	// -------------------------------------------------


	this.placeItemAtSlot = function (slot) {
		// escape if there is no available item
		if (!slot.item.tileset) { return null; }
		
		// check if item placed on a slot is equippable
		function isEquippable(obj) {
			if (!obj.equippableTypes) { return true; }

			var equippableType = utils.splitCamelCase(slot.item.tileset.id)[0].toLowerCase();
			if (slot.item.tilesetType === 'weapons') { equippableType = 'weapons'; }
			//console.log('>>>', equippableType);
			
			for (var i = 0; i < obj.equippableTypes.length; i++) {
				if (obj.equippableTypes[i] === equippableType) {
					return true;
				}
			}

			//console.log('isEquippable ->', obj.equippableTypes, obj);
			return false;
		}

		// used for swapping items between:
		// inventory -> equipment
		// equipment -> inventory
		// equipment -> equipment
		function swipeItems(slot1, slot2) {
			var temp1 = {
				tilesetType: slot1.item.tilesetType,
				subtype: slot1.item.subtype,
				stats: slot1.item.stats,
				tileset: slot1.item.tileset,
				units: slot1.item.units
			};
			var temp2 = {
				tilesetType: slot2.item.tilesetType,
				subtype: slot2.item.subtype,
				stats: slot2.item.stats,
				tileset: slot2.item.tileset,
				units: slot2.item.units
			};

			var i;
			
			// update slot1
			if (slot1.parent.name === 'inventoryBox') {
				for (i in temp2) { items[slot1.num][i] = temp2[i]; }
			} else {
				for (i in temp1) { slot1.item[i] = temp2[i]; }
			}

			// update slot2
			if (slot2.parent.name === 'inventoryBox') {
				for (i in temp2) { items[slot2.num][i] = temp1[i]; }
			} else {
				for (i in temp1) { slot2.item[i] = temp1[i]; }
			}

		}

		// -------------------------

		// get inventory items array
		var items = self.inventory.inventoryBox.items;

		// get slot where item is gonna be placed in
		var p = {
			x: this.dragItem.x + this.dragItem.width / 2,
			y: this.dragItem.y + this.dragItem.height / 2
		};
		var obj = this.getElementAtPos(p);

		if (obj && obj.item) {

			// get origin and destination slot types
			var type1 = slot.parent.name;
			var type2 = obj.parent.name;

			// inventory to inventory
			if (type1 === 'inventoryBox' && type2 === 'inventoryBox') {
				if (slot.item.tileset && obj.item.tileset) {
					items = utils.swapItemsInArray(items, slot.num, obj.num);
				}

			// inventory to equipment
			} else if (type1 === 'inventoryBox' && type2 === 'equipmentBox') {
				if (!isEquippable(obj)) { return null; }

				if (slot.item.tileset && obj.item.tileset) {
					swipeItems(slot, obj);
				} else {
					obj.item.tilesetType = slot.item.tilesetType;
					obj.item.subtype = slot.item.subtype;
					obj.item.stats = slot.item.stats;
					obj.item.tileset = slot.item.tileset;
					obj.item.units = slot.item.units;
					slot.parent.items.splice(slot.num, 1);
				}

			// equipment to inventory
			} else if (type1 === 'equipmentBox' && type2 === 'inventoryBox') {
				if (slot.item.tileset && obj.item.tileset) {
					swipeItems(slot, obj);
				} else {
					items.push({
						tilesetType: slot.item.tilesetType,
						subtype: slot.item.subtype,
						stats: slot.item.stats,
						tileset: slot.item.tileset,
						units: slot.item.units
					});
					slot.item.tilesetType = null;
					slot.item.subtype = null;
					slot.item.stats = null;
					slot.item.tileset = null;
					slot.item.units = null;
				}

			// equipment to equipment
			} else if (type1 === 'equipmentBox' && type2 === 'equipmentBox') {
				if (!isEquippable(obj)) { return null; }

				swipeItems(obj, slot);
			}

			// re-arrange inventory items both in inventory box and hot-slots
			this.inventory.arrangeInventoryItems(this.inventory.inventoryBox.slots);
			this.inventory.arrangeInventoryItems(this.quickSlots.inventorySlots);

			// update quickWeapons
			this.updateQuickWeapons();

			// recalculate hero stats based on new equipment config
			this.updateHeroStats();

			return obj;
		}
	};


	// -------------------------------------------------
	// Update Equipment
	// -------------------------------------------------

	this.updateQuickWeapons = function () {
		// get weapon equipment slots
		var weaponR = this.inventory.equipmentBox.slots.weaponR;
		var weaponL = this.inventory.equipmentBox.slots.weaponL;
		// get weapon wuick slots
		var quickWeaponR = this.quickSlots.equipmentSlots.weaponR;
		var quickWeaponL = this.quickSlots.equipmentSlots.weaponL;

		// store weapon item on quick slots as a reference
		quickWeaponR.weaponRef = weaponR.item;
		quickWeaponL.weaponRef = weaponL.item;

		// display the weapon tileset in weapon quick slots
		quickWeaponR.tileset = weaponR.item.tileset || utils.getTilesetById('ui', 'hand');
		quickWeaponL.tileset = weaponL.item.tileset || utils.getTilesetById('ui', 'hand');

		// tell hero to wear his selected weapon
		if (quickWeaponR.selected) { window.dungeon.hero.selectedWeapon = quickWeaponR.weaponRef; }
		if (quickWeaponL.selected) { window.dungeon.hero.selectedWeapon = quickWeaponL.weaponRef; }

		//console.log('updateQuickWeapons:', quickWeaponR, quickWeaponL);
	};


	this.updateHeroStats = function () {
		// TODO: here we should update hero stats with new hero's equipment
	};


	// -------------------------------------------------
	// Get Element At UI Mouse Position
	// -------------------------------------------------

	this.getElementAtPos = function (pos) {
		function isInsideRect(p, obj) {
			if (p.x >= obj.x && p.y >= obj.y && p.x <= obj.x + obj.width && p.y <= obj.y + obj.height) {
				return obj;
			}
			return null;
		}

		// init vars
		var obj, p, i;

		// --------------------------------
		// get quickSlots relative position
		p = { x: pos.x - this.quickSlots.x, y: pos.y - this.quickSlots.y };
		
		// get plus button
		obj = isInsideRect(p, this.quickSlots.btnPlus);
		if (obj) { return obj._visible ? obj : null; }

		// get equipment slots
		for (i in this.quickSlots.equipmentSlots) {
			obj = isInsideRect(p, this.quickSlots.equipmentSlots[i]);
			if (obj) { return obj._visible ? obj : null; }
		}

		// get item slots
		for (i in this.quickSlots.inventorySlots) {
			obj = isInsideRect(p, this.quickSlots.inventorySlots[i]);
			if (obj) { return obj._visible ? obj : null; }
		}

		// --------------------------------
		// get inventory box relative position
		p = {
			x: pos.x - this.inventory.x - this.inventory.inventoryBg.x - this.inventory.inventoryBox.x,
			y: pos.y - this.inventory.y - this.inventory.inventoryBg.y - this.inventory.inventoryBox.y
		};

		// get inventory items
		for (i in this.inventory.inventoryBox.slots) {
			obj = isInsideRect(p, this.inventory.inventoryBox.slots[i]);
			if (obj) { return obj._visible ? obj : null; }
		}

		// --------------------------------
		// get equipment box relative position
		p = {
			x: pos.x - this.inventory.x - this.inventory.equipmentBg.x - this.inventory.equipmentBox.x,
			y: pos.y - this.inventory.y - this.inventory.equipmentBg.y - this.inventory.equipmentBox.y
		};

		for (i in this.inventory.equipmentBox.slots) {
			obj = isInsideRect(p, this.inventory.equipmentBox.slots[i]);
			if (obj) { return obj._visible ? obj : null; }
		}
		
		// no object was found under mouse position
		return null;
	};

}

inherit(Ui, Sprite);
module.exports = Ui;
