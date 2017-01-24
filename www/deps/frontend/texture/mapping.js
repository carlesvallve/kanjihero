/**
 * @method textureMapping
 *
 * @author Brice Chevalier
 * @param {object} bufferParams Input and Output buffer parameters
 * @param {Uint8ClampedArray} bufferParams.inputData Input pixel buffer
 * @param {number} bufferParams.inputW Width of in the input buffer
 * @param {number} bufferParams.inputH Height of in the input buffer
 * @param {Uint8ClampedArray} bufferParams.outputData Output pixel buffer
 * @param {number} bufferParams.outputW Width of in the output buffer
 * @param {number} bufferParams.outputH Height of in the output buffer
 * @param {object[]} polygonMap An array mapping a polygon to a position in the texture buffer
 *
 */

function textureMapping(bufferParams, polygonMap) {
	var xMin = 0;
	var yMin = 0;

	var xMax = bufferParams.outputW - 1;
	var yMax = bufferParams.outputH - 1;

	var output = bufferParams.outputData;
	var input = bufferParams.inputData;

	var outputW = bufferParams.outputW;
	var inputW = bufferParams.inputW;
	var inputIdx, outputIdx;

	var n = polygonMap.length;
	for (p = 0; p < n; p += 1) {
		var polygon = polygonMap[p];
		if (polygon.visible === true) {

			var area = Math.abs(polygon.a.x * polygon.b.y + polygon.b.x * polygon.c.y + polygon.c.x * polygon.a.y - polygon.a.y * polygon.b.x - polygon.b.y * polygon.c.x - polygon.c.y * polygon.a.x) / 2;
			var streching = area / polygon.area;
			// if (p === 0) console.log(streching.toFixed(3))

			// Input Corners
			var x0 = polygon.a.x;
			var y0 = polygon.a.y;

			var x1 = polygon.b.x;
			var y1 = polygon.b.y;

			var x2 = polygon.c.x;
			var y2 = polygon.c.y;

			// Output Corners
			var i0 = polygon.ax;
			var j0 = polygon.ay;

			var i1 = polygon.bx;
			var j1 = polygon.by;

			var i2 = polygon.cx;
			var j2 = polygon.cy;

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
			var alpha, alphaOpp;
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

					dx = (x - x0init) / c;
					dy = (yA - y0init) / c;

					i = i0 - ai * dx - bi * dy;
					j = j0 - aj * dx - bj * dy;

					outputIdx = 4 * ((yA - 1) * outputW + x);

					for (y = yA; y < yB; y += 1) {
						// Interpolation of the output in (x, y)
						i -= di;
						j -= dj;

						outputIdx += 4 * outputW;
						inputIdx = ~~(~~j * inputW + i) * 4;
						if (input[inputIdx + 3] > 0) {
							alpha = output[outputIdx + 3];
							alphaOpp = 255 - alpha;
							if (streching < 1) {
								alphaOpp *= streching;
							}
							// output[outputIdx] = input[inputIdx];
							output[outputIdx] = (output[outputIdx] * alpha + input[inputIdx] * alphaOpp) >> 8;
							output[outputIdx + 1] = (output[outputIdx + 1] * alpha + input[inputIdx + 1] * alphaOpp) >> 8;
							output[outputIdx + 2] = (output[outputIdx + 2] * alpha + input[inputIdx + 2] * alphaOpp) >> 8;
							output[outputIdx + 3] = (output[outputIdx + 3] + input[inputIdx + 3]);
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

					dx = (x - x0init) / c;
					dy = (yA - y0init) / c;

					i = i0 - ai * dx - bi * dy;
					j = j0 - aj * dx - bj * dy;

					outputIdx = 4 * ((yA - 1) * outputW + x);

					for (y = yA; y < yB; y += 1) {
						// Interpolation of the output in (x, y)
						i -= di;
						j -= dj;

						outputIdx += 4 * outputW;
						inputIdx = ~~(~~j * inputW + i) * 4;
						if (input[inputIdx + 3] > 0) {
							alpha = output[outputIdx + 3];
							alphaOpp = 255 - alpha;
							if (streching < 1) {
								alphaOpp *= streching;
							}
							// output[outputIdx] = input[inputIdx];
							output[outputIdx] = (output[outputIdx] * alpha + input[inputIdx] * alphaOpp) >> 8;
							output[outputIdx + 1] = (output[outputIdx + 1] * alpha + input[inputIdx + 1] * alphaOpp) >> 8;
							output[outputIdx + 2] = (output[outputIdx + 2] * alpha + input[inputIdx + 2] * alphaOpp) >> 8;
							output[outputIdx + 3] = (output[outputIdx + 3] + input[inputIdx + 3]);
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

					dx = (x - x0init) / c;
					dy = (yB - y0init) / c;

					i = i0 - ai * dx - bi * dy;
					j = j0 - aj * dx - bj * dy;

					outputIdx = 4 * ((yB - 1) * outputW + x);

					for (y = yB; y < yA; y += 1) {
						// Interpolation of the output in (x, y)
						i -= di;
						j -= dj;

						outputIdx += 4 * outputW;
						inputIdx = ~~(~~j * inputW + i) * 4;
						if (input[inputIdx + 3] > 0) {
							alpha = output[outputIdx + 3];
							alphaOpp = 255 - alpha;
							if (streching < 1) {
								alphaOpp *= streching;
							}
							// output[outputIdx] = input[inputIdx];
							output[outputIdx] = (output[outputIdx] * alpha + input[inputIdx] * alphaOpp) >> 8;
							output[outputIdx + 1] = (output[outputIdx + 1] * alpha + input[inputIdx + 1] * alphaOpp) >> 8;
							output[outputIdx + 2] = (output[outputIdx + 2] * alpha + input[inputIdx + 2] * alphaOpp) >> 8;
							output[outputIdx + 3] = (output[outputIdx + 3] + input[inputIdx + 3]);
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

					dx = (x - x0init) / c;
					dy = (yB - y0init) / c;

					i = i0 - ai * dx - bi * dy;
					j = j0 - aj * dx - bj * dy;

					outputIdx = 4 * ((yB - 1) * outputW + x);

					for (y = yB; y < yA; y += 1) {
						// Interpolation of the output in (x, y)
						i -= di;
						j -= dj;

						outputIdx += 4 * outputW;
						inputIdx = ~~(~~j * inputW + i) * 4;
						if (input[inputIdx + 3] > 0) {
							alpha = output[outputIdx + 3];
							alphaOpp = 255 - alpha;
							if (streching < 1) {
								alphaOpp *= streching;
							}
							// output[outputIdx] = input[inputIdx];
							output[outputIdx] = (output[outputIdx] * alpha + input[inputIdx] * alphaOpp) >> 8;
							output[outputIdx + 1] = (output[outputIdx + 1] * alpha + input[inputIdx + 1] * alphaOpp) >> 8;
							output[outputIdx + 2] = (output[outputIdx + 2] * alpha + input[inputIdx + 2] * alphaOpp) >> 8;
							output[outputIdx + 3] = (output[outputIdx + 3] + input[inputIdx + 3]);
						}
					}
				}
			}
		}
	}
}

module.exports = textureMapping;
