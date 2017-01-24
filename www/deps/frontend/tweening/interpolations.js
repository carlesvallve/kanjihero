/**
 * @file Interpolation functions
 *
 * @desc
 * Compute a general ease using a sequential list of eases then
 * interpolate properties in a continuous or discrete manner between a and a + c
 *
 * To speed of the execution time several methods have been implemented.
 * Each of them corresponds to a combination of the following characteristics:
 * - continuous or discrete
 * - single or multiple eases
 * - single or multiple properties
 *
 * @author Brice Chevalier
 *
 * @param {number} t Current position, in time, of the tween
 * @param {number} d Total duration of the tween
 * @param {object[]} ease Transition function and its parameters
 * @param {object[]} properties Properties to interpolate and their interpolation values
 * @return {number} Interpolated properties with respect to the eases
 *
 */

function continuous(t, d, propertyParams, ease) {

	t = ease.fn(t / d, ease);

	var result = {};
	for (var k = 0; k < propertyParams.length; k += 1) {
		var param = propertyParams[k];
		result[param.property] = param.a + param.c * t;
	}

	return result;
}

exports.continuous = continuous;


function discrete(t, d, propertyParams, ease) {

	t = ease.fn(t / d, ease);

	var result = {};
	for (var k = 0; k < propertyParams.length; k += 1) {
		var param = propertyParams[k];
		if (param.discretization === 0) {
			result[param.property] = param.a + param.c * t;
		} else {
			result[param.property] = ~~((param.a + param.c * t) / param.discretization) * param.discretization;
		}
	}

	return result;
}

exports.discrete = discrete;
