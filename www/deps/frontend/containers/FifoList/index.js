/**
 * FIFO LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc First in last out data structure
 *
 *    Method                Time Complexity
 *    ___________________________________
 *
 *    add                    O(1)
 *    pop                    O(1)
 *    getFirst            O(1)
 *    getLast                O(1)
 *    getCount            O(1)
 *    apply                O(n)
 *    clear                O(n)
 *
 *    Memory Complexity in O(n)
 */

function Node(obj, previous) {
	this.object = obj;
	this.previous = previous;
	this.next = null;
}

function FifoList() {
	this.count = 0;
	this.last = null;
	this.first = null;
}

FifoList.prototype.add = function (obj) {
	this.count += 1;
	var newNode = new Node(obj, this.last);
	if (this.last === null) {
		this.last = newNode;
		this.first = newNode;
	} else {
		// insertion after the this.last one
		this.last.next = newNode;
		this.last = newNode;
	}
	return newNode;
};

FifoList.prototype.pop = function () {
	if (this.first !== null) {
		var node = this.first;
		var result = this.first.object;
		this.first = this.first.next;
		if (this.first !== null) {
			this.first.previous = null;
		} else {
			this.last = null;
		}
		node.next = null;
		this.count -= 1;
		return result;
	}
};

FifoList.prototype.getLast = function () {
	return this.last;
};

FifoList.prototype.getFirst = function () {
	return this.first;
};

FifoList.prototype.clear = function () {
	this.last = null;
	this.first = null;
};

FifoList.prototype.getCount = function () {
	return this.count;
};

FifoList.prototype.forEach = function (processingFunc, params) {
	for (var current = this.first; current; current = current.next) {
		processingFunc(current.object, params);
	}
};

FifoList.prototype.forEachReverse = function (processingFunc, params) {
	for (var current = this.last; current; current = current.previous) {
		processingFunc(current.object, params);
	}
};

module.exports = FifoList;