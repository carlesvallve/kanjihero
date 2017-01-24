/**
 * @method surfaceInterpolation1D
 * Apply given process to 1D interpolated values for every coordinates (x, y) in Z^2
 * within the triangle defined by the 3 input corners
 *
 * @author Brice Chevalier
 *
 * @param {object[]} cornersIn - Input values of the corners
 * @param {object[]} cornersOut - Output values of the corners
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} yMin
 * @param {number} yMax
 * @param {function} process - Processing function to apply on interpolated points
 * @param {object} params - Parameters of the processing function
 */
function surfaceInterpolation1D(cornersIn, cornersOut, xMin, xMax, yMin, yMax, process, params) {

	// Input Corners
	var x0 = cornersIn[0].x;
	var y0 = cornersIn[0].y;

	var x1 = cornersIn[1].x;
	var y1 = cornersIn[1].y;

	var x2 = cornersIn[2].x;
	var y2 = cornersIn[2].y;

	// Output Corners
	var i0 = cornersOut[0].x;
	var i1 = cornersOut[1].x;
	var i2 = cornersOut[2].x;

	// Equation of the plan formed by the 3 corners
	var vx1 = x1 - x0;
	var vy1 = y1 - y0;

	var vx2 = x2 - x0;
	var vy2 = y2 - y0;

	var vi1 = i1 - i0;
	var vi2 = i2 - i0;

	var a = vy1 * vi2 - vi1 * vy2;
	var b = vi1 * vx2 - vx1 * vi2;
	var c = vx1 * vy2 - vy1 * vx2;

	// Saving the position (x0, y0) for computing
	// points on the formerly defined plans
	var x0init = x0;
	var y0init = y0;

	// Sorting corners with respect to x
	var tmp;
	if (x0 > x1) {
		// Swapping corners 0 and 1
		tmp = x0;
		x0 = x1;
		x1 = tmp;

		tmp = y0;
		y0 = y1;
		y1 = tmp;
	}

	if (x1 > x2) {
		// Swapping corners 1 and 2
		tmp = x1;
		x1 = x2;
		x2 = tmp;

		tmp = y1;
		y1 = y2;
		y2 = tmp;

		if (x0 > x1) {
			// Swapping corners 0 and 1
			tmp = x0;
			x0 = x1;
			x1 = tmp;

			tmp = y0;
			y0 = y1;
			y1 = tmp;
		}
	}

	var rxy01 = (x1 - x0) / (y1 - y0);
	var rxy02 = (x2 - x0) / (y2 - y0);
	var rxy12 = (x2 - x1) / (y2 - y1);

	var x, y, i;
	var d = b / c;
	var yA, yB;
	var x0Int = Math.max(~~x0 + 1, xMin);
	var x1Int = Math.min(Math.max(~~x1 + 1, xMin), xMax);
	var x2Int = Math.min(~~x2 + 1, xMax);
	if (y1 < (y0 + (x1 - x0) / rxy02)) {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.max(~~(y0 + (x - x0) / rxy01), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			i = i0 - (a * (x - x0init) + b * (yA - y0init)) / c;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= d;
				process(x, y, i, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.max(~~(y1 + (x - x1) / rxy12), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			i = i0 - (a * (x - x0init) + b * (yA - y0init)) / c;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= d;
				process(x, y, i, params);
			}
		}

	} else {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.min(~~(y0 + (x - x0) / rxy01), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			i = i0 - (a * (x - x0init) + b * (yB - y0init)) / c;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= d;
				process(x, y, i, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.min(~~(y1 + (x - x1) / rxy12), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			i = i0 - (a * (x - x0init) + b * (yB - y0init)) / c;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= d;
				process(x, y, i, params);
			}
		}
	}
}


/**
 * @method surfaceInterpolation2D
 * Apply given process to 2D interpolated values for every coordinates (x, y) in Z^2
 * within the triangle defined by the 3 input corners
 *
 * @author Brice Chevalier
 *
 * @param {object[]} cornersIn - Input values of the corners
 * @param {object[]} cornersOut - Output values of the corners
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} yMin
 * @param {number} yMax
 * @param {function} process - Processing function to apply on interpolated points
 * @param {object} params - Parameters of the processing function
 */
function surfaceInterpolation2D(cornersIn, cornersOut, xMin, xMax, yMin, yMax, process, params) {

	// Input Corners
	var x0 = cornersIn[0].x;
	var y0 = cornersIn[0].y;

	var x1 = cornersIn[1].x;
	var y1 = cornersIn[1].y;

	var x2 = cornersIn[2].x;
	var y2 = cornersIn[2].y;

	// Output Corners
	var i0 = cornersOut[0].x;
	var j0 = cornersOut[0].y;

	var i1 = cornersOut[1].x;
	var j1 = cornersOut[1].y;

	var i2 = cornersOut[2].x;
	var j2 = cornersOut[2].y;

	// Equation of the 2 plans formed by the 3 corners
	var vx1 = x1 - x0;
	var vy1 = y1 - y0;

	var vx2 = x2 - x0;
	var vy2 = y2 - y0;

	var vi2 = i2 - i0;
	var vj2 = j2 - j0;

	var vi1 = i1 - i0;
	var vj1 = j1 - j0;

	var ai = vy1 * vi2 - vi1 * vy2;
	var bi = vi1 * vx2 - vx1 * vi2;

	var aj = vy1 * vj2 - vj1 * vy2;
	var bj = vj1 * vx2 - vx1 * vj2;

	var c = vx1 * vy2 - vy1 * vx2;

	// Saving the position (x0, y0) for computing
	// points on the formerly defined plans
	var x0init = x0;
	var y0init = y0;

	// Sorting corners with respect to x
	var tmp;
	if (x0 > x1) {
		// Swapping corners 0 and 1
		tmp = x0;
		x0 = x1;
		x1 = tmp;

		tmp = y0;
		y0 = y1;
		y1 = tmp;
	}

	if (x1 > x2) {
		// Swapping corners 1 and 2
		tmp = x1;
		x1 = x2;
		x2 = tmp;

		tmp = y1;
		y1 = y2;
		y2 = tmp;

		if (x0 > x1) {
			// Swapping corners 0 and 1
			tmp = x0;
			x0 = x1;
			x1 = tmp;

			tmp = y0;
			y0 = y1;
			y1 = tmp;
		}
	}

	var rxy01 = (x1 - x0) / (y1 - y0);
	var rxy02 = (x2 - x0) / (y2 - y0);
	var rxy12 = (x2 - x1) / (y2 - y1);

	var x, y, dx, dy;
	var i, j;
	var di = bi / c;
	var dj = bj / c;
	var yA, yB;
	var x0Int = Math.max(~~x0 + 1, xMin);
	var x1Int = Math.min(Math.max(~~x1 + 1, xMin), xMax);
	var x2Int = Math.min(~~x2 + 1, xMax);
	if (y1 < (y0 + (x1 - x0) / rxy02)) {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.max(~~(y0 + (x - x0) / rxy01), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			dx = (x - x0init) / c;
			dy = (yA - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				process(x, y, i, j, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.max(~~(y1 + (x - x1) / rxy12), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			dx = (x - x0init) / c;
			dy = (yA - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				process(x, y, i, j, params);
			}
		}

	} else {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.min(~~(y0 + (x - x0) / rxy01), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			dx = (x - x0init) / c;
			dy = (yB - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				process(x, y, i, j, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.min(~~(y1 + (x - x1) / rxy12), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			dx = (x - x0init) / c;
			dy = (yB - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				process(x, y, i, j, params);
			}
		}
	}
}


/**
 * @method surfaceInterpolation3D
 * Apply given process to 3D interpolated values for every coordinates (x, y) in Z^2
 * within the triangle defined by the 3 input corners
 *
 * @author Brice Chevalier
 *
 * @param {object[]} cornersIn - Input values of the corners
 * @param {object[]} cornersOut - Output values of the corners
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} yMin
 * @param {number} yMax
 * @param {function} process - Processing function to apply on interpolated points
 * @param {object} params - Parameters of the processing function
 */
function surfaceInterpolation3D(cornersIn, cornersOut, xMin, xMax, yMin, yMax, process, params) {

	// Input Corners
	var x0 = cornersIn[0].x;
	var y0 = cornersIn[0].y;

	var x1 = cornersIn[1].x;
	var y1 = cornersIn[1].y;

	var x2 = cornersIn[2].x;
	var y2 = cornersIn[2].y;

	// Output Corners
	var i0 = cornersOut[0].x;
	var j0 = cornersOut[0].y;
	var k0 = cornersOut[0].z;

	var i1 = cornersOut[1].x;
	var j1 = cornersOut[1].y;
	var k1 = cornersOut[1].z;

	var i2 = cornersOut[2].x;
	var j2 = cornersOut[2].y;
	var k2 = cornersOut[2].z;

	// Equation of the 3 plans formed by the 3 corners
	var vx1 = x1 - x0;
	var vy1 = y1 - y0;

	var vx2 = x2 - x0;
	var vy2 = y2 - y0;

	var vi2 = i2 - i0;
	var vj2 = j2 - j0;
	var vk2 = k2 - k0;

	var vi1 = i1 - i0;
	var vj1 = j1 - j0;
	var vk1 = k1 - k0;

	var ai = vy1 * vi2 - vi1 * vy2;
	var bi = vi1 * vx2 - vx1 * vi2;

	var aj = vy1 * vj2 - vj1 * vy2;
	var bj = vj1 * vx2 - vx1 * vj2;

	var ak = vy1 * vk2 - vk1 * vy2;
	var bk = vk1 * vx2 - vx1 * vk2;

	var c = vx1 * vy2 - vy1 * vx2;

	// Saving the position (x0, y0) for computing
	// points on the formerly defined plans
	var x0init = x0;
	var y0init = y0;

	// Sorting corners with respect to x
	var tmp;
	if (x0 > x1) {
		// Swapping corners 0 and 1
		tmp = x0;
		x0 = x1;
		x1 = tmp;

		tmp = y0;
		y0 = y1;
		y1 = tmp;
	}

	if (x1 > x2) {
		// Swapping corners 1 and 2
		tmp = x1;
		x1 = x2;
		x2 = tmp;

		tmp = y1;
		y1 = y2;
		y2 = tmp;

		if (x0 > x1) {
			// Swapping corners 0 and 1
			tmp = x0;
			x0 = x1;
			x1 = tmp;

			tmp = y0;
			y0 = y1;
			y1 = tmp;
		}
	}

	var rxy01 = (x1 - x0) / (y1 - y0);
	var rxy02 = (x2 - x0) / (y2 - y0);
	var rxy12 = (x2 - x1) / (y2 - y1);

	var x, y, dx, dy;
	var i, j, k;
	var di = bi / c;
	var dj = bj / c;
	var dk = bk / c;
	var yA, yB;
	var x0Int = Math.max(~~x0 + 1, xMin);
	var x1Int = Math.min(Math.max(~~x1 + 1, xMin), xMax);
	var x2Int = Math.min(~~x2 + 1, xMax);
	if (y1 < (y0 + (x1 - x0) / rxy02)) {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.max(~~(y0 + (x - x0) / rxy01), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			dx = (x - x0init) / c;
			dy = (yA - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				process(x, y, i, j, k, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.max(~~(y1 + (x - x1) / rxy12), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			dx = (x - x0init) / c;
			dy = (yA - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				process(x, y, i, j, k, params);
			}
		}

	} else {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.min(~~(y0 + (x - x0) / rxy01), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			dx = (x - x0init) / c;
			dy = (yB - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				process(x, y, i, j, k, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.min(~~(y1 + (x - x1) / rxy12), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			dx = (x - x0init) / c;
			dy = (yB - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				process(x, y, i, j, k, params);
			}
		}
	}
}


/**
 * @method surfaceInterpolation4D
 * Apply given process to 4D interpolated values for every coordinates (x, y) in Z^2
 * within the triangle defined by the 3 input corners
 *
 * @author Brice Chevalier
 *
 * @param {object[]} cornersIn - Input values of the corners
 * @param {object[]} cornersOut - Output values of the corners
 * @param xMin
 * @param xMax
 * @param yMin
 * @param yMax
 * @param {function} process - Processing function to apply on interpolated points
 * @param {object} params - Parameters of the processing function
 */
function surfaceInterpolation4D(cornersIn, cornersOut, xMin, xMax, yMin, yMax, process, params) {

	// Input Corners
	var x0 = cornersIn[0].x;
	var y0 = cornersIn[0].y;

	var x1 = cornersIn[1].x;
	var y1 = cornersIn[1].y;

	var x2 = cornersIn[2].x;
	var y2 = cornersIn[2].y;

	// Output Corners
	var i0 = cornersOut[0].x;
	var j0 = cornersOut[0].y;
	var k0 = cornersOut[0].z;
	var l0 = cornersOut[0].u;

	var i1 = cornersOut[1].x;
	var j1 = cornersOut[1].y;
	var k1 = cornersOut[1].z;
	var l1 = cornersOut[1].u;

	var i2 = cornersOut[2].x;
	var j2 = cornersOut[2].y;
	var k2 = cornersOut[2].z;
	var l2 = cornersOut[2].u;

	// Equation of the 4 plans formed by the 3 corners
	var vx1 = x1 - x0;
	var vy1 = y1 - y0;

	var vx2 = x2 - x0;
	var vy2 = y2 - y0;

	var vi2 = i2 - i0;
	var vj2 = j2 - j0;
	var vk2 = k2 - k0;
	var vl2 = l2 - l0;

	var vi1 = i1 - i0;
	var vj1 = j1 - j0;
	var vk1 = k1 - k0;
	var vl1 = l1 - l0;

	var ai = vy1 * vi2 - vi1 * vy2;
	var bi = vi1 * vx2 - vx1 * vi2;

	var aj = vy1 * vj2 - vj1 * vy2;
	var bj = vj1 * vx2 - vx1 * vj2;

	var ak = vy1 * vk2 - vk1 * vy2;
	var bk = vk1 * vx2 - vx1 * vk2;

	var al = vy1 * vl2 - vl1 * vy2;
	var bl = vl1 * vx2 - vx1 * vl2;

	var c = vx1 * vy2 - vy1 * vx2;

	// Saving the position (x0, y0) for computing
	// points on the formerly defined plans
	var x0init = x0;
	var y0init = y0;

	// Sorting corners with respect to x
	var tmp;
	if (x0 > x1) {
		// Swapping corners 0 and 1
		tmp = x0;
		x0 = x1;
		x1 = tmp;

		tmp = y0;
		y0 = y1;
		y1 = tmp;
	}

	if (x1 > x2) {
		// Swapping corners 1 and 2
		tmp = x1;
		x1 = x2;
		x2 = tmp;

		tmp = y1;
		y1 = y2;
		y2 = tmp;

		if (x0 > x1) {
			// Swapping corners 0 and 1
			tmp = x0;
			x0 = x1;
			x1 = tmp;

			tmp = y0;
			y0 = y1;
			y1 = tmp;
		}
	}

	var rxy01 = (x1 - x0) / (y1 - y0);
	var rxy02 = (x2 - x0) / (y2 - y0);
	var rxy12 = (x2 - x1) / (y2 - y1);

	var x, y, dx, dy;
	var i, j, k, l;
	var di = bi / c;
	var dj = bj / c;
	var dk = bk / c;
	var dl = bl / c;
	var yA, yB;
	var x0Int = Math.max(~~x0 + 1, xMin);
	var x1Int = Math.min(Math.max(~~x1 + 1, xMin), xMax);
	var x2Int = Math.min(~~x2 + 1, xMax);

	if (y1 < (y0 + (x1 - x0) / rxy02)) {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.max(~~(y0 + (x - x0) / rxy01), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			dx = (x - x0init) / c;
			dy = (yA - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;
			l = l0 - al * dx - bl * dy;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				l -= dl;
				process(x, y, i, j, k, l, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.max(~~(y1 + (x - x1) / rxy12), yMin);
			yB = Math.min(~~(y0 + (x - x0) / rxy02), yMax);

			dx = (x - x0init) / c;
			dy = (yA - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;
			l = l0 - al * dx - bl * dy;

			for (y = yA; y < yB; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				l -= dl;
				process(x, y, i, j, k, l, params);
			}
		}

	} else {

		for (x = x0Int; x < x1Int; x += 1) {

			yA = Math.min(~~(y0 + (x - x0) / rxy01), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			dx = (x - x0init) / c;
			dy = (yB - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;
			l = l0 - al * dx - bl * dy;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				l -= dl;
				process(x, y, i, j, k, l, params);
			}
		}

		for (x = x1Int; x < x2Int; x += 1) {

			yA = Math.min(~~(y1 + (x - x1) / rxy12), yMax);
			yB = Math.max(~~(y0 + (x - x0) / rxy02), yMin);

			dx = (x - x0init) / c;
			dy = (yB - y0init) / c;

			i = i0 - ai * dx - bi * dy;
			j = j0 - aj * dx - bj * dy;
			k = k0 - ak * dx - bk * dy;
			l = l0 - al * dx - bl * dy;

			for (y = yB; y < yA; y += 1) {
				// Interpolation of the output in (x, y)
				i -= di;
				j -= dj;
				k -= dk;
				l -= dl;
				process(x, y, i, j, k, l, params);
			}
		}
	}
}

exports.inter1D = surfaceInterpolation1D;
exports.inter2D = surfaceInterpolation2D;
exports.inter3D = surfaceInterpolation3D;
exports.inter4D = surfaceInterpolation4D;