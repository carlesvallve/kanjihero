// var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var Slot = require('Slot');


function QuickSlots(parent) {
	Sprite.call(this);
	this.parent = parent;
	var self = this;
	var view = window.viewManager.views.dungeon;

	this.x = 0;
	this.y = parent.height - 42;
	this.width = window.canvasWidth;
	this.height = 42;
	this.zIndex = 2;
	
	this.state = 'closed';
	this.equipmentSlots = [];
	this.inventorySlots = [];

	this.init = function () {
		this.btnPlus = this.createPlusButton();
		this.equipmentSlots = this.createEquipmentSlots();
		this.inventorySlots = this.createInventorySlots();
		
	};


	this.setRenderMethod(function () { // context
		for (var i in this.tweens) { this.tweens[i].update(); }
	});


	// ---------------------------
	// select quick-slot		

	this.selectEquipmentSlot = function (slot) {
		var hero = view.dungeon.hero;

		// select slot
		for (var i in self.equipmentSlots) {
			self.equipmentSlots[i].selected = false;
		}
		slot.selected = true;

		// set hero actionMode and weapon
		hero.actionMode = 'move';
		switch (slot.id) {
			case 'eye':
				hero.actionMode = 'look';
				hero.selectedWeapon = null;
				break;
			case 'weaponR':
			case 'weaponL':
				hero.selectedWeapon = slot.weaponRef;
				break;
			case 'book':
				hero.autoExplore();
				break;
		}

		//console.log('hero selectedWeapon:', hero.selectedWeapon);
	};


	// ----------------------------
	// create equipment quick-slots

	this.createEquipmentSlots = function () {
		var color = 'rgba(100, 100, 100, 0.7)';
		// create equipment hot-slots
		var slots = [];

		slots.eye = this.appendChild(new Slot(this, {
			id: 'eye',
			iconId: 'eye',
			color: color,
			rect: { x: 4, y: 0, w: 40, h: 38 }
		}, this.selectEquipmentSlot));

		slots.weaponR = this.appendChild(new Slot(this, {
			id: 'weaponR',
			iconId: 'hand',
			color: color,
			rect: { x: 48, y: 0, w: 40, h: 38 }
		}, this.selectEquipmentSlot));

		slots.weaponL = this.appendChild(new Slot(this, {
			id: 'weaponL',
			iconId: 'hand',
			color: color,
			rect: { x: 92, y: 0, w: 40, h: 38 }
		}, this.selectEquipmentSlot));

		slots.book = this.appendChild(new Slot(this, {
			id: 'book',
			iconId: 'book',
			color: color,
			rect: { x: 136, y: 0, w: 40, h: 38 }
		}, this.selectEquipmentSlot));

		// select wepon slot by default
		this.selectEquipmentSlot(slots.weaponR);
		return slots;
	};


	// ---------------------------
	// create inventory quick-slots

	this.createInventorySlots = function () {
		var color = 'rgba(100, 100, 100, 0.4)';

		function createSlot(i) {
			var x = self.width - 88 - 4 * 44 + i * 44;
			var slot = self.appendChild(new Slot(this, {
				num: i,
				itemId: 'none',
				color: color,
				rect: { x: x, y: 0, w: 40, h: 38 }
			}, function (slot) {
				parent.inventory.useItem(slot, 0);
			}));
			slot.hide();
			return slot;
		}
		// create equipment hot-slots
		var slots = [];
		for (var i = 0; i < 5; i++) {
			slots[i] = createSlot(i);
		}
		return slots;
	};


	// ---------------------------
	// create plus button
	this.createPlusButton = function () {
		var color = 'rgba(100, 100, 100, 0.7)';
		var btn = this.appendChild(new Slot(this, {
			iconId: 'plus',
			color: color,
			rect: { x: this.width - 44, y: 0, w: 40, h: 38 }
		},　function () { // slot
				// open/close equipment bg
				if (parent.state === 'open') {
					//btn.tileset = utils.getTilesetById('ui', 'plus');
					parent.close();
				} else {
					//btn.tileset = utils.getTilesetById('ui', 'minus');
					parent.open();
				}
			}
		));
		return btn;
	};

}

inherit(QuickSlots, Sprite);
module.exports = QuickSlots;
