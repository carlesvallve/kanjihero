var DoublyList = require('DoublyList');

function Connection(a, b, spacing) {
	this.a = a;
	this.b = b;
	this.spacing = spacing;
	this.polygonA = null;
	this.polygonB = null;
}

exports.Connection = Connection;

/**
 * @classdec Cloth2D
 * Physics engine of cloth in 2D
 *
 * @author Brice Chevalier
 *
 * @param {number} resistance How much a connection of the cloth can be streched before breaking
 * @param {number} elasticity Strength of a connection
 * @param {number} gravity Gravity of the system
 *
 */

function Cloth2D(resistance, elasticity, gravity, inertia) {
	this.resistance = resistance;
	this.elasticity = elasticity;
	this.gravity = gravity;
	this.inertia = inertia || 1.0;

	this.connections = new DoublyList();
	this.nodes = [];
}

exports.Cloth2D = Cloth2D;

Cloth2D.prototype.update = function () {

	// Computing the node interactions for each connection
	var e = this.elasticity;
	var r = this.resistance * this.resistance;
	var f, fx, fy;
	var nodeA, nodeB;
	var connection;
	var s, dx, dy, d, a;
	var connectionRef = this.connections.getFirst();
	while (connectionRef) {

		connection = connectionRef.object;
		connectionRef = connectionRef.next;

		nodeA = connection.a;
		nodeB = connection.b;
		s = connection.spacing * connection.spacing;

		dx = nodeA.x - nodeB.x;
		dy = nodeA.y - nodeB.y;
		d = dx * dx + dy * dy;

		if (d > s) {

			f = e * (1 - Math.sqrt(s / d));
			fx = f * dx;
			fy = f * dy;

			nodeA.vx -= fx;
			nodeA.vy -= fy;

			nodeB.vx += fx;
			nodeB.vy += fy;

			a = nodeA.vx * dx + nodeA.vy * dy;
			if (a >= 0) {
				a /= d;

				nodeA.vx -= a * fx;
				nodeA.vy -= a * fy;

				nodeB.vx += 0.8 * a * fx;
				nodeB.vy += 0.8 * a * fy;
			}

			a = nodeB.vx * dx + nodeB.vy * dy;
			if (a <= 0) {
				a /= d;

				nodeB.vx -= a * fx;
				nodeB.vy -= a * fy;

				nodeA.vx += 0.8 * a * fx;
				nodeA.vy += 0.8 * a * fy;
			}
		}
	}

	// Updating the node positions and speeds
	var g = this.gravity;
	var nNodes = this.nodes.length;
	for (var k = 0; k < nNodes; k += 1) {
		var node = this.nodes[k];
		if (node.pinned === false) {
			node.x += node.vx;
			node.y += node.vy;
			node.vy += g;
			node.vx *= this.inertia;
			node.vy *= this.inertia;
			node.vz *= this.inertia;
		} else {
			node.vx = 0;
			node.vy = 0;
		}
	}

	for (var p = 0; p < 5; p += 1) {
		connectionRef = this.connections.getFirst();
		while (connectionRef) {

			connection = connectionRef.object;

			nodeA = connection.a;
			nodeB = connection.b;
			s = connection.spacing * connection.spacing;

			dx = nodeA.x - nodeB.x;
			dy = nodeA.y - nodeB.y;
			d = dx * dx + dy * dy;

			if (d > s) {
				if (d > s * r) {
					var toRemove = connectionRef;
					connectionRef = connectionRef.next;
					this.connections.removeByRef(toRemove);

					if (connection.polygonA) {
						connection.polygonA.visible = false;
					}

					if (connection.polygonB) {
						connection.polygonB.visible = false;
					}
				} else {
					f = 0.25 * (1 - Math.sqrt(s / d));
					fx = f * dx;
					fy = f * dy;
					if (nodeA.pinned === false) {
						nodeA.x -= fx;
						nodeA.y -= fy;
					}
					if (nodeB.pinned === false) {
						nodeB.x += fx;
						nodeB.y += fy;
					}
					connectionRef = connectionRef.next;
				}
			} else {
				connectionRef = connectionRef.next;
			}
		}
	}
};

Cloth2D.prototype.processNodes = function (process, params) {
	var nNodes = this.nodes.length;
	for (var k = 0; k < nNodes; k += 1) {
		process(this.nodes[k], params);
	}
};

Cloth2D.prototype.processConnections = function (process, params) {
	this.connections.forEach(process, params);
};

Cloth2D.prototype.processConnectionRefs = function (process, params) {
	var connectionRef = this.connections.getFirst();
	while (connectionRef) {
		process(connectionRef, params);
		connectionRef = connectionRef.next;
	}
};

function Node2D(x, y) {
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	this.pinned = false;
}

exports.Node2D = Node2D;

function Polygon2D(offsetX, offsetY, a, b, c) {
	this.ax = a.x - offsetX;
	this.ay = a.y - offsetY;
	this.bx = b.x - offsetX;
	this.by = b.y - offsetY;
	this.cx = c.x - offsetX;
	this.cy = c.y - offsetY;
	this.area = Math.abs(this.ax * this.by + this.bx * this.cy + this.cx * this.ay - this.ay * this.bx - this.by * this.cx - this.cy * this.ax) / 2;
	this.a = a;
	this.b = b;
	this.c = c;
	this.visible = true;
}

exports.Polygon2D = Polygon2D;

Cloth2D.prototype.generateCrossedThreading = function (offsetX, offsetY, width, height, spacing, pinningFunction) {

	var i, j;
	var n = ~~(width / spacing) + 1;
	var m = ~~(height / spacing) + 1;

	this.nodes = new Array(n * m);
	this.connections.clear();


	// Creating the nodes
	for (i = 0; i < n; i += 1) {
		for (j = 0; j < m; j += 1) {
			var node = new Node2D(i * spacing + offsetX, j * spacing + offsetY);
			node.pinned = pinningFunction(node);
			this.nodes[j * n + i] = node;
		}
	}

	var connectionMap = new Array(2 * n - 1);
	var connection;

	// Creating the vertical threading
	for (i = 0; i < n; i += 1) {
		connectionMap[i] = new Array(m - 1);
		for (j = 1; j < m; j += 1) {
			connection = new Connection(this.nodes[(j - 1) * n + i], this.nodes[j * n + i], spacing);
			this.connections.add(connection);
			connectionMap[i][j - 1] = connection;
		}
	}

	// Creating the horizontal threading
	for (i = 1; i < n; i += 1) {
		connectionMap[n + i - 1] = new Array(m);
		for (j = 0; j < m; j += 1) {
			connection = new Connection(this.nodes[j * n + i - 1], this.nodes[j * n + i], spacing);
			this.connections.add(connection);
			connectionMap[n + i - 1][j] = connection;
		}
	}

	var polygons = new Array(2 * (n - 1) * (m - 1));
	var polyIdx = 0;
	for (i = 1; i < n; i += 1) {
		for (j = 1; j < m; j += 1) {
			var a = this.nodes[(j - 1) * n + (i - 1)];
			var b = this.nodes[j * n + (i - 1)];
			var c = this.nodes[(j - 1) * n + i];
			var d = this.nodes[j * n + i];

			var polygonA = new Polygon2D(offsetX, offsetY, a, b, c);
			var polygonB = new Polygon2D(offsetX, offsetY, d, b, c);

			polygons[polyIdx] = polygonA;
			polygons[polyIdx + 1] = polygonB;
			polyIdx += 2;

			connectionMap[i - 1][j - 1].polygonA = polygonA;
			connectionMap[n + i - 1][j - 1].polygonA = polygonA;

			connectionMap[i][j - 1].polygonB = polygonB;
			connectionMap[n + i - 1][j].polygonB = polygonB;
		}
	}

	var hull = new Array(2 * m + 2 * n - 4);
	var hullIdx = 0;
	for (i = 1; i < n; i += 1) {
		hull[hullIdx] = this.nodes[i];
		hullIdx += 1;
	}

	for (j = 1; j < m; j += 1) {
		hull[hullIdx] = this.nodes[j * n + n - 1];
		hullIdx += 1;
	}

	for (i = n - 2; i >= 0; i -= 1) {
		hull[hullIdx] = this.nodes[(m - 1) * n + i];
		hullIdx += 1;
	}

	for (j = m - 2; j >= 0; j -= 1) {
		hull[hullIdx] = this.nodes[j * n];
		hullIdx += 1;
	}

	return { polygons: polygons, hull: hull, n: n, m: m };
};

/**
 * @classdec Cloth3D
 * Physics engine of cloth in 3D
 *
 * @author Brice Chevalier
 *
 * @param {number} resistance How much a connection of the cloth can be streched before breaking
 * @param {number} elasticity Strength of a connection
 * @param {number} gravity Gravity of the system
 *
 */

function Cloth3D(resistance, elasticity, gravity, inertia) {
	this.resistance = resistance;
	this.elasticity = elasticity;
	this.gravity = gravity;
	this.inertia = inertia || 1.0;

	this.connections = new DoublyList();
	this.nodes = [];
}

exports.Cloth3D = Cloth3D;

Cloth3D.prototype.update = function () {

	// Computing the node interactions for each connection
	var e = this.elasticity;
	var r = this.resistance * this.resistance;
	var f, fx, fy, fz;
	var nodeA, nodeB;
	var connection;
	var s, dx, dy, dz, d, a;
	var connectionRef = this.connections.getFirst();
	while (connectionRef) {

		connection = connectionRef.object;
		connectionRef = connectionRef.next;

		nodeA = connection.a;
		nodeB = connection.b;
		s = connection.spacing * connection.spacing;

		dx = nodeA.x - nodeB.x;
		dy = nodeA.y - nodeB.y;
		dz = nodeA.z - nodeB.z;
		d = dx * dx + dy * dy + dz * dz;

		if (d > s) {

			f = e * (1 - Math.sqrt(s / d));
			fx = f * dx;
			fy = f * dy;
			fz = f * dz;

			nodeA.vx -= fx;
			nodeA.vy -= fy;
			nodeA.vz -= fz;

			nodeB.vx += fx;
			nodeB.vy += fy;
			nodeB.vz += fz;

			a = nodeA.vx * dx + nodeA.vy * dy + nodeA.vz * dz;
			if (a >= 0) {
				a /= d;

				nodeA.vx -= a * fx;
				nodeA.vy -= a * fy;
				nodeA.vz -= a * fz;
				nodeB.vx += 0.8 * a * fx;
				nodeB.vy += 0.8 * a * fy;
				nodeB.vz += 0.8 * a * fz;
			}

			a = nodeB.vx * dx + nodeB.vy * dy + nodeB.vz * dz;
			if (a <= 0) {
				a /= d;

				nodeB.vx -= a * fx;
				nodeB.vy -= a * fy;
				nodeB.vz -= a * fz;
				nodeA.vx += 0.8 * a * fx;
				nodeA.vy += 0.8 * a * fy;
				nodeA.vz += 0.8 * a * fz;
			}
		}
	}

	// Updating the node positions and speeds
	var g = this.gravity;
	var nNodes = this.nodes.length;
	for (var k = 0; k < nNodes; k += 1) {
		var node = this.nodes[k];
		if (node.pinned === false) {
			node.x += node.vx;
			node.y += node.vy;
			node.z += node.vz;
			node.vy += g;
			node.vx *= this.inertia;
			node.vy *= this.inertia;
			node.vz *= this.inertia;
		} else {
			node.vx = 0;
			node.vy = 0;
			node.vz = 0;
		}
	}

	for (var p = 0; p < 5; p += 1) {
		connectionRef = this.connections.getFirst();
		while (connectionRef) {

			connection = connectionRef.object;

			nodeA = connection.a;
			nodeB = connection.b;
			s = connection.spacing * connection.spacing;

			dx = nodeA.x - nodeB.x;
			dy = nodeA.y - nodeB.y;
			dz = nodeA.z - nodeB.z;
			d = dx * dx + dy * dy + dz * dz;

			if (d > s) {
				if (d > s * r) {
					var toRemove = connectionRef;
					connectionRef = connectionRef.next;
					this.connections.removeByRef(toRemove);

					if (connection.polygonA) {
						connection.polygonA.visible = false;
					}

					if (connection.polygonB) {
						connection.polygonB.visible = false;
					}
				} else {
					f = 0.25 * (1 - Math.sqrt(s / d));
					fx = f * dx;
					fy = f * dy;
					fz = f * dz;
					if (nodeA.pinned === false) {
						nodeA.x -= fx;
						nodeA.y -= fy;
						nodeA.z -= fz;
					}
					if (nodeB.pinned === false) {
						nodeB.x += fx;
						nodeB.y += fy;
						nodeB.z += fz;
					}
					connectionRef = connectionRef.next;
				}
			} else {
				connectionRef = connectionRef.next;
			}
		}
	}
};

Cloth3D.prototype.processNodes = function (process, params) {
	var nNodes = this.nodes.length;
	for (var k = 0; k < nNodes; k += 1) {
		process(this.nodes[k], params);
	}
};

Cloth3D.prototype.processConnections = function (process, params) {
	this.connections.forEach(process, params);
};

Cloth3D.prototype.processConnectionRefs = function (process, params) {
	var connectionRef = this.connections.getFirst();
	while (connectionRef) {
		process(connectionRef, params);
		connectionRef = connectionRef.next;
	}
};

function Node3D(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.pinned = false;
}

exports.Node3D = Node3D;

function Polygon3D(offsetX, offsetY, offsetZ, a, b, c) {
	this.ax = a.x - offsetX;
	this.ay = a.y - offsetY;
	this.az = a.z - offsetZ;
	this.bx = b.x - offsetX;
	this.by = b.y - offsetY;
	this.bz = b.z - offsetZ;
	this.cx = c.x - offsetX;
	this.cy = c.y - offsetY;
	this.cz = c.z - offsetZ;
	var dx = (this.ay - this.by) * (this.az - this.cz) - (this.az - this.bz) * (this.ay - this.cy);
	var dy = (this.az - this.bz) * (this.ax - this.cx) - (this.ax - this.bx) * (this.az - this.cz);
	var dz = (this.ax - this.bx) * (this.ay - this.cy) - (this.ay - this.by) * (this.ax - this.cx);
	this.area = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2)) / 2;
	this.a = a;
	this.b = b;
	this.c = c;
	this.visible = true;
}

exports.Polygon3D = Polygon3D;

Cloth3D.prototype.generateCrossedThreading = function (offsetX, offsetY, offsetZ, width, height, spacing, pinningFunction) {

	var i, j;
	var n = ~~(width / spacing) + 1;
	var m = ~~(height / spacing) + 1;

	this.nodes = new Array(n * m);
	this.connections.clear();
	
	// Creating the nodes
	for (i = 0; i < n; i += 1) {
		for (j = 0; j < m; j += 1) {
			var node = new Node3D(i * spacing + offsetX, j * spacing + offsetY, offsetZ);
			node.pinned = pinningFunction(node);
			this.nodes[j * n + i] = node;
		}
	}

	var connectionMap = new Array(2 * n - 1);
	var connection;

	// Creating the vertical threading
	for (i = 0; i < n; i += 1) {
		connectionMap[i] = [];
		for (j = 1; j < m; j += 1) {
			connection = new Connection(this.nodes[(j - 1) * n + i], this.nodes[j * n + i], spacing);
			this.connections.add(connection);
			connectionMap[i][j - 1] = connection;
		}
	}

	// Creating the horizontal threading
	for (i = 1; i < n; i += 1) {
		connectionMap[n + i - 1] = [];
		for (j = 0; j < m; j += 1) {
			connection = new Connection(this.nodes[j * n + i - 1], this.nodes[j * n + i], spacing);
			this.connections.add(connection);
			connectionMap[n + i - 1][j] = connection;
		}
	}

	var polygons = new Array(2 * (n - 1) * (m - 1));
	var polyIdx = 0;
	for (i = 1; i < n; i += 1) {
		for (j = 1; j < m; j += 1) {
			var a = this.nodes[(j - 1) * n + (i - 1)];
			var b = this.nodes[j * n + (i - 1)];
			var c = this.nodes[(j - 1) * n + i];
			var d = this.nodes[j * n + i];

			var polygonA = new Polygon3D(offsetX, offsetY, offsetZ, a, b, c);
			var polygonB = new Polygon3D(offsetX, offsetY, offsetZ, d, b, c);

			polygons[polyIdx] = polygonA;
			polygons[polyIdx + 1] = polygonB;
			polyIdx += 2;

			connectionMap[i - 1][j - 1].polygonA = polygonA;
			connectionMap[n + i - 1][j - 1].polygonA = polygonA;

			connectionMap[i][j - 1].polygonB = polygonB;
			connectionMap[n + i - 1][j].polygonB = polygonB;
		}
	}

	var hull = new Array(2 * m + 2 * n - 4);
	var hullIdx = 0;
	for (i = 1; i < n; i += 1) {
		hull[hullIdx] = this.nodes[i];
		hullIdx += 1;
	}

	for (j = 1; j < m; j += 1) {
		hull[hullIdx] = this.nodes[j * n + n - 1];
		hullIdx += 1;
	}

	for (i = n - 2; i >= 0; i -= 1) {
		hull[hullIdx] = this.nodes[(m - 1) * n + i];
		hullIdx += 1;
	}

	for (j = m - 2; j >= 0; j -= 1) {
		hull[hullIdx] = this.nodes[j * n];
		hullIdx += 1;
	}

	return { polygons: polygons, hull: hull, n: n, m: m };
};