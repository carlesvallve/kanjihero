/**
 * DOUBLY LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc Doubly list data structure
 *
 *    Method                Time Complexity
 *    ___________________________________
 *
 *    add                    O(1)
 *    remove                O(n)
 *    removeByRef            O(1)
 *    getFirst            O(1)
 *    getLast                O(1)
 *    getCount            O(1)
 *    apply                O(n)
 *    clear                O(n)
 *
 *    Memory Complexity in O(n)
 */


function Node(obj, previous, next) {
	this.object = obj;
	this.previous = previous;
	this.next = next;
}

function DoublyList() {
	this.count = 0;
	this.last = null;
	this.first = null;
}

DoublyList.prototype.add = function (obj) {
	this.count += 1;
	var newNode = new Node(obj, null, this.first);
	if (this.first === null) {
		this.first = newNode;
		this.last = newNode;
	} else {
		// insertion before the this.first one
		this.first.previous = newNode;
		this.first = newNode;
	}
	return newNode;
};

DoublyList.prototype.pushBack = function (obj) {
	this.count += 1;
	var newNode = new Node(obj, this.last, null);
	if (this.first === null) {
		this.first = newNode;
		this.last = newNode;
	} else {
		// insertion after the this.last one
		this.last.next = newNode;
		this.last = newNode;
	}
	return newNode;
};

DoublyList.prototype.addBefore = function (obj, nodeRef) {
	this.count += 1;
	var newNode = new Node(obj, nodeRef.previous, nodeRef);
	if (nodeRef.previous !== null) {
		nodeRef.previous.next = newNode;
	} else {
		this.first = newNode;
	}
	nodeRef.previous = newNode;
	return newNode;
};

DoublyList.prototype.addAfter = function (obj, nodeRef) {
	this.count += 1;
	var newNode = new Node(obj, nodeRef, nodeRef.next);
	if (nodeRef.next !== null) {
		nodeRef.next.previous = newNode;
	} else {
		this.last = newNode;
	}
	nodeRef.next = newNode;
	return newNode;
};

DoublyList.prototype.replace = function (obj, nodeRef) {
	nodeRef.obj = obj;
	return nodeRef;
};

DoublyList.prototype.remove = function (obj) {
	var current = this.first;
	while (current !== null) {
		if (current.object === obj) {
			
			// Removing any reference to the node
			if (current.next === null) {
				this.last = current.previous;
			} else {
				current.next.previous = current.previous;
			}
			if (current.previous === null) {
				this.first = current.next;
			} else {
				current.previous.next = current.next;
			}

			// Removing any reference from the node to any other element of the list
			current.previous = null;
			current.next = null;

			this.count -= 1;
			break;
		}
		current = current.next;
	}
};

DoublyList.prototype.getRef = function (obj) {
	var current = this.first;
	while (current !== null) {
		if (current.object === obj) {
			return current;
		}
		current = current.next;
	}
	return null;
};

DoublyList.prototype.removeByRef = function (node) {

	// Removing any reference to the node
	if (node.next === null) {
		this.last = node.previous;
	} else {
		node.next.previous = node.previous;
	}
	if (node.previous === null) {
		this.first = node.next;
	} else {
		node.previous.next = node.next;
	}

	// Removing any reference from the node to any other element of the list
	node.previous = null;
	node.next = null;

	this.count -= 1;
};

DoublyList.prototype.getRef = function (obj) {
	var current = this.first;
	while (current !== null) {
		if (current.object === obj) {
			return current;
		}
		current = current.next;
	}
	return null;
};

DoublyList.prototype.getFirst = function () {
	return this.first;
};

DoublyList.prototype.getLast = function () {
	return this.last;
};

DoublyList.prototype.clear = function () {
	this.first = null;
	this.last = null;
};

DoublyList.prototype.getCount = function () {
	return this.count;
};

DoublyList.prototype.forEach = function (processingFunc, params) {
	for (var current = this.first; current; current = current.next) {
		processingFunc(current.object, params);
	}
};

DoublyList.prototype.forEachReverse = function (processingFunc, params) {
	for (var current = this.last; current; current = current.previous) {
		processingFunc(current.object, params);
	}
};

module.exports = DoublyList;