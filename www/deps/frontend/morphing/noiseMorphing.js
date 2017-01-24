/**
 * @method noiseMorphing
 *
 * @author Brice Chevalier
 *
 * @param {ImageData} bufferParams Output pixel buffer
 * @param {number} bufferParams.width Width of in the output buffer
 * @param {number} bufferParams.height Height of in the output buffer
 * @param {Uint8ClampedArray} bufferParams.data Output pixels
 * @param {array[]} polygons Polygons on which to apply the noise
 * @param {array[]} noiseColorMap Map of pixels with respect to a range of noise values
 * @param {array[]} mask Mask applied on the noise, determines which pixels are visible
 */

function noiseMorphing(bufferParams, polygons, noiseColorMap, mask) {
	var xMin = 0;
	var yMin = 0;

	var xMax = bufferParams.width - 1;
	var yMax = bufferParams.height - 1;

	var outputW = bufferParams.width;
	var outputData = bufferParams.data;
	var outputIdx;

	// Interpolating values with respect to the polygons
	for (p = 0; p < polygons.length; p += 1) {
		var polygon = polygons[p];

		// Triangle ABD
		// Input Corners
		var x0 = polygon.a.x;
		var y0 = polygon.a.y;

		var x1 = polygon.b.x;
		var y1 = polygon.b.y;

		var x2 = polygon.c.x;
		var y2 = polygon.c.y;

		// Corner contributions
		var i0 = polygon.a.noise;
		var i1 = polygon.b.noise;
		var i2 = polygon.c.noise;

		if (noiseColorMap[(i0 * mask[~~x0][~~y0]) >> 8][3] <= 0 && noiseColorMap[(i1 * mask[~~x1][~~y1]) >> 8][3] <= 0 && noiseColorMap[(i2 * mask[~~x2][~~y2]) >> 8][3] <= 0) {
			// The polygon would be invisible
			continue;
		}

		// Equation of the 3 plans formed by the 3 corners
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
		if (x0 > x1) { // Swapping corners 0 and 1
			tmp = x0;
			x0 = x1;
			x1 = tmp;

			tmp = y0;
			y0 = y1;
			y1 = tmp;
		}

		if (x1 > x2) { // Swapping corners 1 and 2
			tmp = x1;
			x1 = x2;
			x2 = tmp;

			tmp = y1;
			y1 = y2;
			y2 = tmp;

			if (x0 > x1) { // Swapping corners 0 and 1
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
		var yA, yB;
		var pixel;
		var d = b / c;
		var x0Int = ~~x0 + 1;
		var x1Int = ~~x1 + 1;
		var x2Int = ~~x2 + 1;
		if (x0Int < xMin) {
			x0Int = xMin;
		}
		if (x1Int < xMin) {
			x1Int = xMin;
		} else if (x1Int > xMax) {
			x1Int = xMax;
		}
		if (x2Int > xMax) {
			x2Int = xMax;
		}
		if (y1 < (y0 + (x1 - x0) / rxy02)) {

			for (x = x0Int; x < x1Int; x += 1) {

				yA = ~~(y0 + (x - x0) / rxy01);
				yB = ~~(y0 + (x - x0) / rxy02);
				if (yA < yMin) {
					yA = yMin;
				}
				if (yB > yMax) {
					yB = yMax;
				}

				i = i0 - (a * (x - x0init) + b * (yA - y0init)) / c;
				for (y = yA; y < yB; y += 1) {
					// Interpolation of the output in (x, y)
					i -= d;

					pixel = noiseColorMap[(i * mask[x][y]) >> 8];
					if (pixel[3] > 0) {
						outputIdx = (y * outputW + x) << 2;
						outputData[outputIdx] = pixel[0];
						outputData[outputIdx + 1] = pixel[1];
						outputData[outputIdx + 2] = pixel[2];
						outputData[outputIdx + 3] = pixel[3];
					}
				}
			}

			for (x = x1Int; x < x2Int; x += 1) {

				yA = ~~(y1 + (x - x1) / rxy12);
				yB = ~~(y0 + (x - x0) / rxy02);
				if (yA < yMin) {
					yA = yMin;
				}
				if (yB > yMax) {
					yB = yMax;
				}

				i = i0 - (a * (x - x0init) + b * (yA - y0init)) / c;
				for (y = yA; y < yB; y += 1) {
					// Interpolation of the output in (x, y)
					i -= d;

					pixel = noiseColorMap[(i * mask[x][y]) >> 8];
					if (pixel[3] > 0) {
						outputIdx = (y * outputW + x) << 2;
						outputData[outputIdx] = pixel[0];
						outputData[outputIdx + 1] = pixel[1];
						outputData[outputIdx + 2] = pixel[2];
						outputData[outputIdx + 3] = pixel[3];
					}
				}
			}

		} else {

			for (x = x0Int; x < x1Int; x += 1) {

				yA = ~~(y0 + (x - x0) / rxy01);
				yB = ~~(y0 + (x - x0) / rxy02);
				if (yA > yMax) {
					yA = yMax;
				}
				if (yB < yMin) {
					yB = yMin;
				}

				i = i0 - (a * (x - x0init) + b * (yB - y0init)) / c;
				for (y = yB; y < yA; y += 1) {
					// Interpolation of the output in (x, y)
					i -= d;

					pixel = noiseColorMap[(i * mask[x][y]) >> 8];
					if (pixel[3] > 0) {
						outputIdx = (y * outputW + x) << 2;
						outputData[outputIdx] = pixel[0];
						outputData[outputIdx + 1] = pixel[1];
						outputData[outputIdx + 2] = pixel[2];
						outputData[outputIdx + 3] = pixel[3];
					}
				}
			}

			for (x = x1Int; x < x2Int; x += 1) {

				yA = ~~(y1 + (x - x1) / rxy12);
				yB = ~~(y0 + (x - x0) / rxy02);
				if (yA > yMax) {
					yA = yMax;
				}
				if (yB < yMin) {
					yB = yMin;
				}

				i = i0 - (a * (x - x0init) + b * (yB - y0init)) / c;
				for (y = yB; y < yA; y += 1) {
					// Interpolation of the output in (x, y)
					i -= d;

					pixel = noiseColorMap[(i * mask[x][y]) >> 8];
					if (pixel[3] > 0) {
						outputIdx = (y * outputW + x) << 2;
						outputData[outputIdx] = pixel[0];
						outputData[outputIdx + 1] = pixel[1];
						outputData[outputIdx + 2] = pixel[2];
						outputData[outputIdx + 3] = pixel[3];
					}
				}
			}
		}
	}
}

module.exports = noiseMorphing;