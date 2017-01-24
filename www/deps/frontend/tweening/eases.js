/**
 *
 * @file A set of ease functions
 *
 * @author Brice Chevalier
 *
 * @param {Number} t Time of the transition in [0, 1]
 * @param (Number) p Additional parameter, when required.
 * It is not optional, it is either required or unnecessary.
 * Its necessity depends on which ease is called
 * @return {Number} Tweened value
 *
 * @desc Ease functions
 * Initial and final values of the ease functions should be 0 or 1
 * i.e easeFunction(t === 0) === 0 || easeFunction(t === 0) === 1 && easeFunction(t === 1) === 0 || easeFunction(t === 1) === 1
 *
 */

// Math constants
var PI_OVER_TWO = Math.PI / 2;
var TWO_PI = 2 * Math.PI;
var EXP = 2.718281828;


// No Transition
function none() {
	return 1;
}

exports.none = none;


// Linear
function linear(t) {
	return t;
}

exports.linear = linear;


// Parabolic
function parabolic(t) {
	var r = (2 * t - 1);
	return 1 - r * r;
}

exports.parabolic = parabolic;


// Trigonometric
function trigo(t, p) {
	return 0.5 * (1 - Math.cos(TWO_PI * t * p.n));
}

exports.trigo = trigo;

// Trigonometric
function elastic(t, p) {
	var e = p.elasticity;
	var d = t / (1 - e);
	var n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 0;
	}
	return Math.cos(n - PI_OVER_TWO) * Math.pow(e, n);
}

exports.elastic = elastic;


// Polynomial
function polyIn(t, p) {
	return Math.pow(t, p.power);
}

exports.polyIn = polyIn;

function polyOut(t, p) {
	return 1 - Math.pow((1 - t) / 1, p.power);
}

exports.polyOut = polyOut;

function polyInOut(t, p) {
	if (t < 0.5) {
		return Math.pow(2 * t, p.power) / 2;
	} else {
		return (1 + (1 - Math.pow(2 * (1 - t), p.power))) / 2;
	}
}

exports.polyInOut = polyInOut;

// Sine
function sineIn(t) {
	return 1 - Math.cos(PI_OVER_TWO * t);
}

exports.sineIn = sineIn;

function sineOut(t) {
	return Math.sin(PI_OVER_TWO * t);
}

exports.sineOut = sineOut;

function sineInOut(t) {
	if (t < 0.5) {
		return (1 - Math.cos(PI_OVER_TWO * 2 * t)) / 2;
	} else {
		return (1 + Math.sin(PI_OVER_TWO * 2 * (t - 0.5))) / 2;
	}
}

exports.sineInOut = sineInOut;


// Exponential
function expIn(t, p) {
	var e = p.exponent;
	return (1 - Math.pow(EXP, e * t)) / (1 - Math.pow(EXP, e));
}

exports.expIn = expIn;

function expOut(t, p) {
	var e = -p.exponent;
	return (1 - Math.pow(EXP, e * t)) / (1 - Math.pow(EXP, e));
}

exports.expOut = expOut;

function expInOut(t, p) {
	var e;
	if (t < 0.5) {
		e = p.exponent;
		return (1 - Math.pow(EXP, 2 * e * t)) / (1 - Math.pow(EXP, e)) / 2;
	} else {
		e = -p.exponent;
		return 0.5 + (1 - Math.pow(EXP, 2 * e * t - e)) / (1 - Math.pow(EXP, e)) / 2;
	}
}

exports.expInOut = expInOut;

// Circular
function circIn(t) {
	return 1 - Math.sqrt(1 - Math.pow(t, 2));
}

exports.circIn = circIn;

function circOut(t) {
	return Math.sqrt(1 - Math.pow(1 - t, 2));
}

exports.circOut = circOut;

function circInOut(t) {
	if (t < 0.5) {
		return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
	} else {
		return (1 + Math.sqrt(-3 + 8 * t - 4 * t * t)) / 2;
	}
}

exports.circInOut = circInOut;


// Elastic
function elasticIn(t, p) {
	var e = p.elasticity;
	var d = (1 - t) / (1 - e);
	var n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 0;
	}
	return Math.cos(n) * Math.pow(e, n);
}

exports.elasticIn = elasticIn;

function elasticOut(t, p) {
	var e = p.elasticity;
	var d = t / (1 - e);
	var n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 1;
	}
	return 1.0 - Math.cos(n) * Math.pow(e, n);
}

exports.elasticOut = elasticOut;

function elasticInOut(t, p) {
	var e = p.elasticity;
	var d, n;
	if (t < 0.5) {
		t *= 2;
		d = (1 - t) / (1 - e);
		n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
		if (n === Infinity) {
			return 0;
		}
		return 0.5 * Math.cos(n) * Math.pow(e, n);
	}

	t = 2 * t - 1;
	d = t / (1 - e);
	n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 1;
	}
	return 0.5 + 0.5 * (1.0 - Math.cos(n) * Math.pow(e, n));

}

exports.elasticInOut = elasticInOut;

// Bounce
function bounceIn(t, p) {
	var e = p.elasticity;
	var d = (1 - t) / (1 - e);
	var n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 0;
	}
	return Math.abs(Math.cos(n) * Math.pow(e, n));
}

exports.bounceIn = bounceIn;

function bounceOut(t, p) {
	var e = p.elasticity;
	var d = t / (1 - e);
	var n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 1;
	}
	return 1.0 - Math.abs(Math.cos(n) * Math.pow(e, n));
}

exports.bounceOut = bounceOut;

function bounceInOut(t, p) {
	var e = p.elasticity;
	var d, n;
	if (t < 0.5) {
		t *= 2;
		d = (1 - t) / (1 - e);
		n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
		if (n === Infinity) {
			return 0;
		}
		return Math.abs(0.5 * Math.cos(n) * Math.pow(e, n));
	}

	t = 2 * t - 1;
	d = t / (1 - e);
	n = (1 + e) * Math.log(1 - d + e * d) / Math.log(e);
	if (n === Infinity) {
		return 1;
	}
	return 0.5 + 0.5 * (1.0 - Math.abs(Math.cos(n) * Math.pow(e, n)));

}

exports.bounceInOut = bounceInOut;


// Back
function backIn(t, p) {
	var e = 1 / p.elasticity;
	return t * t * ((e + 1) * t - e);
}

exports.backIn = backIn;

function backOut(t, p) {
	var e = 1 / p.elasticity;
	t -= 1;
	return t * t * ((e + 1) * t + e) + 1;
}

exports.backOut = backOut;

function backInOut(t, p) {
	var e = 1 / p.elasticity;
	if (t < 0.5) {
		t *= 2;
		return 0.5 * (t * t * ((e + 1) * t - e));
	}
	t = 2 * t - 2;
	return 0.5 * (t * t * ((e + 1) * t + e)) + 1;
}

exports.backInOut = backInOut;

// Quadratic Bezier
function bezierQuadratic(t, p) {
	var cx = p.control[0][0];
	var cy = p.control[0][1];
	var precision = p.precision || 0.0001;

	var x0 = t;
	var s = 0.25;
	var x;

	t = 0.5;
	// Dichotomic search of t with given precision
	while (s > precision) {
		x = t * (2 * (1 - t) * cx + t);
		if (x > x0) {
			t -= s;
			s /= 2;
		} else {
			t += s;
			s /= 2;
		}
	}

	return t * (2 * (1 - t) * cy + t);
}

exports.bezierQuadratic = bezierQuadratic;

// Cubic Bezier
function bezierCubic(t, p) {
	var control = p.control;
	var cx1 = control[0][0];
	var cy1 = control[0][1];
	var cx2 = control[1][0];
	var cy2 = control[1][1];

	var precision = p.precision || 0.0001;

	var x0 = t;
	var s = 0.25;
	var x, u;

	t = 0.5;
	// Dichotomic search of t with given precision
	while (s > precision) {
		u = (1 - t);
		x = t * (3 * u * u * cx1 + t * (3 * u * cx2 + t));
		if (x > x0) {
			t -= s;
			s /= 2;
		} else {
			t += s;
			s /= 2;
		}
	}

	u = (1 - t);
	return t * (3 * u * u * cy1 + t * (3 * u * cy2 + t));
}

exports.bezierCubic = bezierCubic;

function bezierQuartic(t, p) {
	var control = p.control;
	var cx1 = control[0][0];
	var cy1 = control[0][1];
	var cx2 = control[1][0];
	var cy2 = control[1][1];
	var cx3 = control[2][0];
	var cy3 = control[2][1];

	var precision = p.precision || 0.0001;

	var x0 = t;
	var s = 0.25;
	var x, u, u2;

	t = 0.5;
	// Dichotomic search of t with given precision
	while (s > precision) {
		u = (1 - t);
		u2 = u * u;
		x = t * (4 * u * u2 * cx1 + t * (6 * u2 * cx2 + t * (4 * u * cx3 + t)));
		if (x > x0) {
			t -= s;
			s /= 2;
		} else {
			t += s;
			s /= 2;
		}
	}

	u = (1 - t);
	u2 = u * u;
	return t * (4 * u * u2 * cy1 + t * (6 * u2 * cy2 + t * (4 * u * cy3 + t)));
}

exports.bezierQuartic = bezierQuartic;

function bezierQuintic(t, p) {
	var control = p.control;
	var cx1 = control[0][0];
	var cy1 = control[0][1];
	var cx2 = control[1][0];
	var cy2 = control[1][1];
	var cx3 = control[2][0];
	var cy3 = control[2][1];
	var cx4 = control[3][0];
	var cy4 = control[3][1];

	var precision = p.precision || 0.0001;

	var x0 = t;
	var s = 0.25;
	var x, u, u2;

	t = 0.5;
	// Dichotomic search of t with given precision
	while (s > precision) {
		u = (1 - t);
		u2 = u * u;
		x = t * (5 * u2 * u2 * cx1 + t * (10 * u * u2 * cx2 + t * (10 * u2 * cx3 + t * (5 * u * cx4 + t))));
		if (x > x0) {
			t -= s;
			s /= 2;
		} else {
			t += s;
			s /= 2;
		}
	}

	u = (1 - t);
	u2 = u * u;
	return t * (5 * u2 * u2 * cy1 + t * (10 * u * u2 * cy2 + t * (10 * u2 * cy3 + t * (5 * u * cy4 + t))));
}

exports.bezierQuintic = bezierQuintic;


function bezierSextic(t, p) {
	var control = p.control;
	var cx1 = control[0][0];
	var cy1 = control[0][1];
	var cx2 = control[1][0];
	var cy2 = control[1][1];
	var cx3 = control[2][0];
	var cy3 = control[2][1];
	var cx4 = control[3][0];
	var cy4 = control[3][1];
	var cx5 = control[4][0];
	var cy5 = control[4][1];

	var precision = p.precision || 0.0001;

	var x0 = t;
	var s = 0.25;
	var x, u, u2;

	t = 0.5;
	// Dichotomic search of t with given precision
	while (s > precision) {
		u = (1 - t);
		u2 = u * u;
		x = t * (6 * u2 * u2 * u * cx1 + t * (15 * u2 * u2 * cx2 + t * (20 * u2 * u * cx3 + t * (15 * u2 * cx4 + t * (6 * u * cx5 + t)))));
		if (x > x0) {
			t -= s;
			s /= 2;
		} else {
			t += s;
			s /= 2;
		}
	}

	u = (1 - t);
	u2 = u * u;
	return t * (6 * u2 * u2 * u * cy1 + t * (15 * u2 * u2 * cy2 + t * (20 * u2 * u * cy3 + t * (15 * u2 * cy4 + t * (6 * u * cy5 + t)))));
}

exports.bezierSextic = bezierSextic;

function bezier(t, p) {

	var control = p.control;
	var precision = p.precision || 0.0001;
	var n = control.length + 1;
	var k, term;

	var x0 = t;
	var s = 0.25;
	var x, y, u;

	t = 0.5;
	// Dichotomic search of t with given precision
	while (s > precision) {
		u = (1 - t);
		x = 0;
		term = n;
		for (k = 1; k < n; k += 1) {
			x += term * Math.pow(u, n - k) * Math.pow(t, k) * control[k - 1][0];
			term *= (n - k) / (k + 1);
		}
		x += Math.pow(t, n);

		if (x > x0) {
			t -= s;
			s /= 2;
		} else {
			t += s;
			s /= 2;
		}
	}

	u = (1 - t);
	y = 0;
	term = n;
	for (k = 1; k < n; k += 1) {
		y += term * Math.pow(u, n - k) * Math.pow(t, k) * control[k - 1][1];
		term *= (n - k) / (k + 1);
	}
	y += Math.pow(t, n);

	return y;
}

exports.bezier = bezier;

// Noise
var permutations = [
	182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
	252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
	166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
	190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
	149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
	220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
	135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
	228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
	191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
	128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
	20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
	197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
	1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
	209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
	151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
	163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
	182
];

var gradients = [-1, 1];

function noise(t, p) {

	var x = 0;
	var amplitude = 2.0;
	var persistance = p.persistance;
	var frequency = p.frequency;
	var octaves = p.octaves;
	var offset = p.offset;

	var scale = (persistance === 1) ? 1 / octaves : 0.5 * (1 - persistance) / (1 - Math.pow(persistance, octaves));

	t = t + offset;

	for (var o = 0; o < octaves; o += 1) {

		var i = (t | t) & 255;
		var x1 = t - (t | t);
		var x0 = 1.0 - x1;

		x += amplitude * (x0 * x0 * x1 * (3 - 2 * x0) * gradients[permutations[i] & 1] - x1 * x1 * x0 * (3 - 2 * x1) * gradients[permutations[i + 1] & 1]);

		t = (t - offset) * frequency + offset;
		amplitude *= persistance;
	}

	return x * scale;
}

exports.noise = noise;
