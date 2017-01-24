var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var SlotItem = require('SlotItem');

// -------------------------------------------------
// Slot
// -------------------------------------------------

function Slot(parent, options, cb) {
	Sprite.call(this);
	this.parent = parent;
	var self = this;
	var view = window.viewManager.views.dungeon;
	var ui = view.ui;
	var dragItem = ui.dragItem;

	options = options || {};

	this.id = options.id;
	this.equippableTypes = options.equippableTypes;
	this.num = options.num;
	this.caption = options.caption;
	this.iconId = options.iconId;
	this.itemId = options.itemId;
	this.tileset = this.iconId ? utils.getTilesetById('ui', this.iconId) : null;
	this.draggable = options.draggable;
	
	this.color = options.color || 'rgba(100, 100, 100, 0.4)'; //'rgba(100, 100, 100, 0.8)';
	this.x = options.rect.x;
	this.y = options.rect.y;
	this.width = options.rect.w;
	this.height = options.rect.h;
	this.zIndex = 0;

	// if itemId was given, create item
	if (this.itemId) {
		this.item = this.appendChild(new SlotItem(this, this.itemId));
	}
	
	// render slot
	this.setRenderMethod(function (context) {
		var color = this.selected ? 'rgba(160, 160, 160, 0.6)' : this.color;
		utils.drawBox(context, 0, 0, this.width, this.height, color, 5);

		if (this.tileset) {
			context.globalAlpha = 0.7;
			context.drawImage(this.tileset.img,
				this.tileset.rect.x, this.tileset.rect.y, this.tileset.rect.w, this.tileset.rect.h,
				6, 6, this.width - 12, this.height - 12);
		}

		if (this.caption) {
			context.font = 'bold 10pt Verdana';
			context.textAlign = 'center';
			context.fillStyle = 'white'; //rgba(100, 100, 100, 0.5)';
			context.fillText(this.caption, this.width / 2, 6 + this.height / 2);
		}
	});


	// ----------------------------------
	// set interactive listeners

	// get ui relative position of this slot
	function getGlobalPos() {
		var obj = self;
		var p = { x: self.x, y: self.y };
		while (obj !== ui) {
			if (!obj._parent) {
				console.log('object does not have a parent!');
				break;
			}
			obj = obj._parent;
			p.x += obj.x;
			p.y += obj.y;
		}
		return p;
	}

	
	this.on('swipestart', function () { // pos

		if (!self.item || !self.draggable) { return; }

		// hide item
		self.item.hide();

		// show dragItem
		var p = getGlobalPos();
		dragItem.x = p.x;
		dragItem.y = p.y;
		dragItem.tileset = self.item.tileset;
		dragItem.units = self.item.units;
		dragItem.width = self.item.width;
		dragItem.height = self.item.height;
		dragItem.show();

		// update info item
		ui.selectSlot(null);
		ui.inventory.inventoryInfo.update(self.item);
	});


	this.on('swipe', function (pos, incs) {
		if (!self.item || !self.draggable) {
			window.ui = 'ui';
			return;
		}

		// update dragItem
		dragItem.x += incs.x;
		dragItem.y += incs.y;
	});


	this.on('swipeend', function () { // pos
		if (!self.item || !self.draggable) {
			window.ui = 'dungeon';
			return;
		}

		// show item
		self.item.show();

		// hide dragItem
		dragItem.tileset = null;
		dragItem.units = null;
		dragItem.hide();

		// place item at slot
		ui.placeItemAtSlot(self);
		ui.inventory.inventoryInfo.update(null);
	});


	this.on('tap', function () {
		// show item
		if (self.item) { self.item.show(); }

		// hide dragItem
		dragItem.tileset = null;
		dragItem.units = null;
		dragItem.hide();
	
		// update info item	
		//ui.inventory.inventoryInfo.update(self.item);

		// if item is not draggable(button) we will execute callback,
		// if draggable and item, select it or use it (if already selected),
		// if equippable, just select it
		if (!self.draggable) {
			// buttons
			if (cb) { cb(self); }
		} else {
			if (!self.item) { return; }
			if (self.item.tilesetType === 'items') {
				// consumables
				if (ui.selectedSlot === self) {
					if (cb) { cb(self); }
				} else {
					ui.selectSlot(self);
				}
			} else {
				// equippables
				ui.selectSlot(self);
			}
		}
	});

}

inherit(Slot, Sprite);
module.exports = Slot;
