var utils = require('utils');
var inherit = require('inherit');
var Sprite = require('WuicSprite');
var Slot = require('Slot');
var twTime = 0.25;


function Inventory(parent) {
	Sprite.call(this);
	this.parent = parent;
	var self = this;
	var view = window.viewManager.views.dungeon;
	var ui = view.ui;

	this.x = 0;
	this.y = 0;
	this.width = window.canvasWidth;
	this.height = window.canvasHeight;
	this.zIndex = 1;

	this.state = 'closed';
	this.hide();

	
	this.setRenderMethod(function () { // context
		for (var i in this.tweens) { this.tweens[i].update(); }
	});


	this.init = function () {
		this.headerBg = this.createHeaderBg();

		this.equipmentBg = this.createEquipmentBg();
		this.equipmentBox = this.createEquipmentBox();
		this.equipmentBox.slots = this.createEquipmentSlots();

		this.inventoryBg = this.createInventoryBg();
		this.inventoryMenu = this.createInventoryMenu();
		this.inventoryInfo = this.createInventoryInfo();
		this.inventoryBox = this.createInventoryBox();
		this.inventoryBox.slots = this.createInventorySlots();
	};

	// ##################################
	// Create Background Containers
	// ##################################

	// -----------------------------------
	// create header bg

	this.createHeaderBg = function () {
		var box = this.appendChild(new Sprite());

		box.startX = 180;
		box.x = this.width + 10;
		box.y = box.startY = 4;
		box.width = this.width - 184;
		box.height = this.height - 92;
		
		box.setRenderMethod(function (context) {
			utils.drawBox(context, 0, 0, this.width, 38, 'rgba(60, 60, 60, 0.6)', 5);
		});
		
		return box;
	};


	// -----------------------------------
	// create equipment bg panel

	this.createEquipmentBg = function () {
		var box = this.appendChild(new Sprite());

		
		box.width = 172;
		box.height = 228;
		box.x = -box.width - 10;
		box.y = 46;
		box.startX = 4;

		box.setRenderMethod(function (context) {
			utils.drawBox(context, 0, 0, this.width, this.height, 'rgba(60, 60, 60, 0.6)', 5);
		});

		return box;
	};


	// -----------------------------------
	// create inventory bg panel

	this.createInventoryBg = function () {
		var box = this.appendChild(new Sprite());

		box.width = this.width - 184;
		box.height = this.height - 92;
		box.x = this.width + 10;
		box.y = 46;
		box.startX = 180;
		
		box.setRenderMethod(function (context) {
			utils.drawBox(context, 0, 0, this.width, this.height, 'rgba(60, 60, 60, 0.6)', 5);
		});
		
		return box;
	};


	// ##################################
	// Create Equipment Boxes and Slots
	// ##################################

	// -----------------------------------
	// create equipment box

	this.createEquipmentBox = function () {
		var box = this.equipmentBg.appendChild(new Sprite());
		box.name = 'equipmentBox';
		var bodyTileset = utils.getTilesetById('ui', 'body');

		// box position and dimension
		box.width = bodyTileset.rect.w * 0.75;
		box.height = bodyTileset.rect.h * 0.65;
		box.x = Math.floor((this.equipmentBg.width - box.width) / 2);
		box.y = 2 + Math.floor((this.equipmentBg.height - box.height) / 2);

		// render box
		box.setRenderMethod(function (context) {
			// body silouette
			var w = box.width * 0.8, h = box.height * 0.8;
			var x = (box.width - w) / 2, y = (box.height - h) / 2;
			context.drawImage(bodyTileset.img,
				bodyTileset.rect.x, bodyTileset.rect.y, bodyTileset.rect.w, bodyTileset.rect.h,
				x, y, w, h);
		});

		return box;
	};


	// -----------------------------------
	// create equipment slots

	this.createEquipmentSlots = function () {
		var box = this.equipmentBox;

		var center = (box.width - 40) / 2;
		var left = -40 / 2;
		var right = box.width - 40 / 2;

		var slots = [];

		slots.cap = box.appendChild(new Slot(box, {
			equippableTypes: ['cap', 'crown'],
			itemId: 'none',
			draggable: true,
			rect: { x: center, y: 15, w: 40, h: 38 }
		}, function () {}));

		slots.armor = box.appendChild(new Slot(box, {
			equippableTypes: ['armor', 'robe'],
			itemId: 'none',
			draggable: true,
			rect: { x: center, y: 60, w: 40, h: 38 }
		}, function () {}));

		slots.belt = box.appendChild(new Slot(box, {
			equippableTypes: ['belt'],
			itemId: 'none',
			draggable: true,
			rect: { x: center, y: 105, w: 40, h: 38 }
		}, function () {}));

		slots.boots = box.appendChild(new Slot(box, {
			equippableTypes: ['boots'],
			itemId: 'none',
			draggable: true,
			rect: { x: center, y: 170, w: 40, h: 38 }
		}, function () {}));

		slots.cloak = box.appendChild(new Slot(box, {
			equippableTypes: ['cloak'],
			itemId: 'none',
			draggable: true,
			rect: { x: left, y: 15, w: 40, h: 38 }
		}, function () {}));

		slots.necklace = box.appendChild(new Slot(box, {
			equippableTypes: ['necklace'],
			itemId: 'none',
			draggable: true,
			rect: { x: right, y: 15, w: 40, h: 38 }
		}, function () {}));

		slots.weaponR = box.appendChild(new Slot(box, {
			equippableTypes: ['weapons', 'shield'],
			itemId: 'none',
			draggable: true,
			rect: { x: left, y: 95, w: 40, h: 38 }
		}, function () {}));

		slots.weaponL = box.appendChild(new Slot(box, {
			equippableTypes: ['weapons', 'shield'],
			itemId: 'none',
			draggable: true,
			rect: { x: right, y: 95, w: 40, h: 38 }
		}, function () {}));

		slots.gloves = box.appendChild(new Slot(box, {
			equippableTypes: ['gloves', 'ring'],
			itemId: 'none',
			draggable: true,
			rect: { x: left, y: 140, w: 40, h: 38 }
		}, function () {}));

		slots.ring = box.appendChild(new Slot(box, {
			equippableTypes: ['gloves', 'ring'],
			itemId: 'none',
			draggable: true,
			rect: { x: right, y: 140, w: 40, h: 38 }
		}, function () {}));

		return slots;
	};


	// ##################################
	// Create Inventory Boxes and Slots
	// ##################################

	// -----------------------------------
	// create inventory menu

	this.createInventoryInfo = function () {
		var box = this.inventoryBg.appendChild(new Sprite());
		box.name = 'inventoryInfo';
		box.caption = '';

		// box position and dimension
		box.parent = this;
		box.width = this.inventoryBg.width - 16;
		box.height = 34;
		box.x = 8;
		box.y = this.inventoryBg.height - 42;

		box.update = function (item) {
			if (item && item.tileset) {
				this.caption = utils.wordifyCamelCase(item.tileset.id);
			} else {
				this.caption = '';
			}
		};

		// render box
		box.setRenderMethod(function (context) {
			utils.drawBox(context, 0, 0, this.width, this.height, 'rgba(0, 0, 0, 0.4)', 5);

			context.font = 'normal 8pt Verdana';
			context.textAlign = 'center';
			context.fillStyle = 'white';
			context.fillText(this.caption, this.width / 2, 3 + this.height / 2);
		});

		return box;
	};

	this.createInventoryMenu = function () {
		var box = this.inventoryBg.appendChild(new Sprite());
		box.name = 'inventoryMenu';

		// box position and dimension
		box.parent = this;
		box.width = 4 + 44;
		box.height = 4 + 42 * 4;
		box.x = this.inventoryBg.width - 48 - 8;
		box.y = 8;

		// init inventory menu slots
		box.slots = [];
		var color = 'rgba(0, 0, 0, 0.5)';

		box.slots.look = box.appendChild(new Slot(box, {
			itemId: 'none',
			color: color,
			rect: { x: 4, y: 4, w: 40, h: 38 }
		}, function () {}));

		box.slots.equip = box.appendChild(new Slot(box, {
			itemId: 'none',
			color: color,
			rect: { x: 4, y: 4 + 42, w: 40, h: 38 }
		}, function () {}));

		box.slots.use = box.appendChild(new Slot(box, {
			itemId: 'none',
			color: color,
			rect: { x: 4, y: 4 + 42 * 2, w: 40, h: 38 }
		}, function () {}));

		box.slots.drop = box.appendChild(new Slot(box, {
			itemId: 'none',
			color: color,
			rect: { x: 4, y: 4 + 42 * 3, w: 40, h: 38 }
		}, function () {}));

		// render box
		box.setRenderMethod(function (context) {
			utils.drawBox(context, 0, 0, this.width, this.height, 'rgba(100, 100, 100, 0.3)', 5);
		});

		return box;
	};

	// -----------------------------------
	// create inventory box

	this.createInventoryBox = function () {
		var box = this.inventoryBg.appendChild(new Sprite());
		box.name = 'inventoryBox';

		// init inventory box vars
		
		box.maxColumns = 5;
		box.maxRows = 4;
		box.maxItems = box.maxColumns * box.maxRows;
		box.maxStacks = 9;
		box.numItems = 0;
		box.slots = [];
		box.items = [];

		// box position and dimension
		box.parent = this;
		box.width = 4 + 44 * box.maxColumns;
		box.height = 4 + 42 * box.maxRows;
		box.x = 8;
		box.y = 8;
		//box.x = Math.floor((this.inventoryBg.width - box.width) / 2);
		//box.y = Math.floor((this.inventoryBg.height - box.height) / 2);

		// render box
		box.setRenderMethod(function (context) {
			utils.drawBox(context, 0, 0, this.width, this.height, 'rgba(0, 0, 0, 0.3)', 5);
		});

		return box;
	};


	// -----------------------------------
	// create inventory slots

	this.createInventorySlots = function () {
		var box = this.inventoryBox;

		var x = 4, y = 4;
		var slots = [];
		function createSlot(i) {
			slots[i] = box.appendChild(new Slot(box, { num: i, itemId: 'none', draggable: true, rect: { x: x, y: y, w: 40, h: 38 } }, function (slot) {
				self.useItem(slot, twTime);
			}));

			x += 44;
			if (x >= 4 + box.maxColumns * 44) {
				x = 4;
				y += 42;
			}
		}

		for (var i = 0; i < box.maxItems; i++) {
			createSlot(i);
		}
		return slots;
	};


	// ##################################
	// Actions for Inventory Items
	// ##################################


	// -----------------------------------
	// Use inventory item

	this.useItem = function (slot, delay) {
		var box = this.inventoryBox;
		var item = slot.item;

		// escape if slot is empty
		if (!item.tileset) {
			return console.log('nothing to use here!');
		}

		// escape if item is not consumable
		// TODO: drop it instead (?)
		if (item.tilesetType !== 'items') {
			return;
		}

		// apply item effects if it has any
		// if we cannot apply an item effect, don't use the item
		item = self.applyItemEffects(box.items[slot.num], delay);

		// update item after using it succesfully
		if (item) {
			if (item.units > 1) {
				// if we have multiple items of this type, decrease it 1 unit
				box.items[slot.num].units--;
			} else {
				// if this is the only item, remove it from the items list
				box.items.splice(slot.num, 1);
			}
		}

		// re-arrange items in inventory
		this.arrangeInventoryItems(box.slots);
		this.arrangeInventoryItems(parent.quickSlots.inventorySlots);

		// close the inventory, 
		// so we can see the item effects on the hero
		if (parent.state === 'open') {
			parent.close();
		}
	};


	// -----------------------------------
	// Apply item effects to hero

	this.applyItemEffects = function (item, delay) {
		// consume item: apply effects by subtype
		var hero = view.dungeon.hero;

		var r, d;

		switch (item.subtype) {
			case 'food':
				if (hero.stats.mp === hero.stats.mpMax) {
					hero.createInfoLabel(hero, 'You are full', 'white', delay);
					return null;
				}
				r = utils.randomInt(5, 10);
				d = hero.stats.mpMax - hero.stats.mp;
				if (d < r) { r = d; }
				hero.stats.mp += r;
				hero.createInfoLabel(hero, 'Hunger +' + Math.ceil(r), '#0ff', delay);
				ui.console.log('You eat the ' + utils.wordifyCamelCase(item.tileset.id) + '.');
				ui.console.log('You feel a little better.');
				break;
			case 'potion':
				if (hero.stats.hp === hero.stats.hpMax) {
					hero.createInfoLabel(hero, 'You are healthy', 'white', delay);
					return null;
				}
				r = utils.randomInt(5, 10);
				d = hero.stats.hpMax - hero.stats.hp;
				if (d < r) { r = d; }
				hero.stats.hp += r;
				hero.createInfoLabel(hero, 'Health +' + Math.ceil(r), '#0f0', delay);
				ui.console.log('You drink the ' + utils.wordifyCamelCase(item.tileset.id) + '.');
				ui.console.log(Math.ceil(r) + 'HP restored.');
				break;
		}

		return item;
	};


	// -----------------------------------
	// Add item to inventory

	this.addItem = function (pickedItem) {
		var box = this.inventoryBox;

		// check if item can be stacked, and do it if so
		var item = this.stackItem(pickedItem);

		// if we dont have more slots available, escape without picking the item
		if (!item && box.items.length >= box.maxItems) {
			console.log('inventory full');
			return null;
		}

		// if we got a new item
		if (!item) {
			// generate an abstract item object 
			// with all props from the picked item
			item = {
				tilesetType: pickedItem.tilesetType,
				subtype: pickedItem.subtype,
				stats: pickedItem.stats,
				tileset: pickedItem.tileset,
				units: 1
			};
			// add item to the beggining of the items list
			box.items.unshift(item);
		}

		// re-arrange items in inventory and hot-slots
		this.arrangeInventoryItems(box.slots);
		this.arrangeInventoryItems(parent.quickSlots.inventorySlots);

		// return the created item to the hero,
		// so we know we picked it
		return item;
	};

	// -----------------------------------
	// Stack item to inventory

	this.stackItem = function (pickedItem) {
		var box = this.inventoryBox;

		if (pickedItem.tilesetType === 'items') {
			// check if we already own an item of the same type
			for (var i = 0; i < box.items.length; i++) {
				var item = box.items[i];

				if (item.tileset.id === pickedItem.tileset.id) {
					// if we do, and we are not out of stacks, add 1 unit to it
					if (item.units < box.maxStacks) {
						item.units++;
						return item;
					}
				}
			}
		}
		return null;
	};


	// -----------------------------------
	// Arrange inventory items in slots

	this.arrangeInventoryItems = function (slots) {
		var box = this.inventoryBox;
		var slot, item;

		// reset all item abstract props on all inventory slots
		for (var i in slots) {
			slot = slots[i];
			//if (!slot.num && slot.num !== 0) { continue; }
			item = slot.item;
			if (!item) { continue; }
			if (!item.tileset) { continue; }
			item.tilesetType = null;
			item.subtype = null;
			item.stats = null;
			item.tileset = null;
			item.units = 0;
		}

		// iterate the items list and assign item props to each inventory slot
		for (i = 0; i < box.items.length; i++) {
			item = box.items[i];
			if (!item) { continue; }
			for (var n in item) {
				slot = slots[i];
				if (slot && slot.item) {
					slot.item[n] = item[n];
					
				}
			}
		}

		// relocate and display inventory quick-slots
		if (slots === parent.quickSlots.inventorySlots) {
			for (i in slots) {
				slot = slots[i];
				if (slot.num < box.items.length) {
					slot.x = parent.quickSlots.width - 44 - Math.min(box.items.length, 5) * 44 + slot.num * 44;
					slot.y = 0;
					slot.show();
				} else {
					//slot.x = parent.quickSlots.width + 10;
					slot.y = 38 * 2;
					slot.hide();
				}
			}
		}
	};


	// -----------------------------------
	// Update weapons
	// TODO : Implement weapons mode toggle!

	// wepons setup
	/*this.weapons = [
		{ weaponR: null, weaponL: null},
		{ weaponR: null, weaponL: null},
	];

	this.equipWeaponInWeaponsMode = function () { // slots
		var slots = this.equipmentBox.slots;
		var mode = parent.quickSlots.equipmentSlots.weapon.mode;
		console.log('mode: ', mode);


		// check which weapons we are carrying and store them in weapons1
		var tilesetR = slots.weaponR.item.tileset;
		var tilesetL = slots.weaponL.item.tileset;

		this.weapons[mode].weaponR = tilesetR ? tilesetR.id : null;
		this.weapons[mode].weaponL = tilesetL ? tilesetL.id : null;
		
		console.log('weapons:', this.weapons[mode]);

	};


	this.updateWeaponsMode = function () {
		var slots = this.equipmentBox.slots;
		var tilesetR = slots.weaponR.item.tileset;
		var tilesetL = slots.weaponL.item.tileset;
		var weapons = this.weapons[parent.quickSlots.equipmentSlots.weapon.mode];

		// if no weapon, remove equipped weapon from equipment slot
		if (weapons.weaponR === null) {

		}
	}*/

}

inherit(Inventory, Sprite);
module.exports = Inventory;

