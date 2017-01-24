/**
 * CIRCULAR DOUBLY LIST Class
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

function CircularDoublyList() {
	this.count = 0;
	this.last = null;
	this.first = null;
}

CircularDoublyList.prototype.add = function (obj) {
	this.count += 1;
	var newNode = new Node(obj, this.last, this.first);
	if (this.first === null) {
		this.first = newNode;
		this.last = newNode;
		newNode.previous = newNode;
		newNode.next = newNode;
	} else {
		// insertion before the this.last one
		this.last.next = newNode;
		this.last = newNode;
		this.first.previous = newNode;
	}
	return newNode;
};

CircularDoublyList.prototype.remove = function (obj) {
	if (this.first === this.last) {
		if (this.first.object === obj) {
			this.first = null;
			this.last = null;
			this.count -= 1;
		}
		return;
	}

	var current = this.first;
	while (current !== this.last) {
		if (current.object === obj) {
			
			// Removing any reference to the node
			current.next.previous = current.previous;
			if (current === this.first) {
				this.first = current.next;
			} else {
				current.previous.next = current.next;
			}

			// Removing any reference from the node to any other element of the list
			current.previous = null;
			current.next = null;

			this.count -= 1;
			return;
		}
		current = current.next;
	}

	if (current.object === obj) {
		
		// Removing any reference to the node
		this.last = current.previous;
		if (current === this.first) {
			this.first = current.next;
		} else {
			current.previous.next = current.next;
		}

		// Removing any reference from the node to any other element of the list
		current.previous = null;
		current.next = null;

		this.count -= 1;
		return;
	}
};

CircularDoublyList.prototype.removeByRef = function (node) {

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

CircularDoublyList.prototype.getFirst = function () {
	return this.first;
};

CircularDoublyList.prototype.getLast = function () {
	return this.last;
};

CircularDoublyList.prototype.clear = function () {
	this.first = null;
	this.last = null;
};

CircularDoublyList.prototype.getCount = function () {
	return this.count;
};

CircularDoublyList.prototype.forEach = function (processingFunc, params) {
	for (var current = this.first; current !== this.last; current = current.next) {
		processingFunc(current.object, params);
	}
	if (current !== null) {
		processingFunc(current.object, params);
	}
};

CircularDoublyList.prototype.forEachReverse = function (processingFunc, params) {
	for (var current = this.last; current !== this.first; current = current.next) {
		processingFunc(current.object, params);
	}
	if (current !== null) {
		processingFunc(current.object, params);
	}
};

module.exports = CircularDoublyList;
