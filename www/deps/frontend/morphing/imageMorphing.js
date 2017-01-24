var surfaceInterpolation2D = require('surfaceInterpolations').inter2D;

// Write pixel method, it reads a pixel at a given position
// in an input buffer and write it into the output buffer
function writePixels(x, y, i, j, params) {

	var outputData = params.outputData;
	var inputData = params.inputData;

	var outputIdx = y * params.outputW + x;
	var inputIdx = ~~(~~j * params.inputW + i);
	var alpha = (outputData[outputIdx] >> 24) & 255;
	if (alpha === 0) {
		outputData[outputIdx] = inputData[inputIdx];
	}
}

/**
 * @method imageMorphing
 *
 * @author Brice Chevalier
 *
 * @param {object} bufferParams - Input and Output buffer parameters
 * @param {Uint8ClampedArray} bufferParams.inputData - Input pixel buffer
 * @param {number} bufferParams.inputW - Width of in the input buffer
 * @param {number} bufferParams.inputH - Height of in the input buffer
 * @param {Uint8ClampedArray} bufferParams.outputData - Output pixel buffer
 * @param {number} bufferParams.outputW - Width of in the output buffer
 * @param {number} bufferParams.outputH - Height of in the output buffer
 * @param {object} sampleResolution - Resolution of the samples of the morphing function
 * @param {number} sampleResolution.n - Number of sample columns
 * @param {number} sampleResolution.m - Number of sample rows
 * @param {function} morphingFunc - Morphing function applied to obtain the samples
 * @param {object} params - Parameters of the morphing function
 */

function imageMorphing(bufferParams, sampleResolution, morphingFunc, params) {

	// Complexity in O(area of inputData + sampleResolution.n * sampleResolution.m * Complexity of morphing function)

	// Resolution of the input and output images
	var inputW = bufferParams.inputW;
	var inputH = bufferParams.inputH;

	var outputW = bufferParams.outputW;
	var outputH = bufferParams.outputH;

	var outputWMinus = outputW - 1;
	var outputHMinus = outputH - 1;

	var inputWMinus = inputW - 1;
	var inputHMinus = inputH - 1;

	// Resolution of the sampling of the morphing function
	var n = sampleResolution.n - 1;
	var m = sampleResolution.m - 1;

	var samples = [];
	var i, j;
	for (i = 0; i <= n; i += 1) {
		samples[i] = [];
		for (j = 0; j <= m; j += 1) {
			samples[i][j] = morphingFunc(i / n, j / m, params);
			samples[i][j].x *= outputWMinus;
			samples[i][j].y *= outputHMinus;
		}
	}

	var xMin = 0;
	var yMin = 0;

	var xMax = outputW - 1;
	var yMax = outputH - 1;

	// Interpolating values with respect to the sampling resolution and the samples
	var cornerOutputA, cornerOutputB, cornerOutputC, cornerOutputD;
	var cornerInputA, cornerInputB, cornerInputC, cornerInputD;
	for (j = 0; j < m; j += 1) {
		for (i = 0; i < n; i += 1) {
			cornerOutputA = { x: inputWMinus * i / n, y: inputHMinus * j / m };
			cornerOutputB = { x: inputWMinus * (i + 1) / n, y: inputHMinus * j / m };
			cornerOutputC = { x: inputWMinus * (i + 1) / n, y: inputHMinus * (j + 1) / m };
			cornerOutputD = { x: inputWMinus * i / n, y: inputHMinus * (j + 1) / m };

			cornerInputA = samples[i][j];
			cornerInputB = samples[i + 1][j];
			cornerInputC = samples[i + 1][j + 1];
			cornerInputD = samples[i][j + 1];

			// Complexity of surfaceInterpolation2D in O(area of ABCD)
			surfaceInterpolation2D([cornerInputA, cornerInputB, cornerInputD], [cornerOutputA, cornerOutputB, cornerOutputD], xMin, xMax, yMin, yMax, writePixels, bufferParams);
			surfaceInterpolation2D([cornerInputB, cornerInputC, cornerInputD], [cornerOutputB, cornerOutputC, cornerOutputD], xMin, xMax, yMin, yMax, writePixels, bufferParams);
		}
	}
}

module.exports = imageMorphing;