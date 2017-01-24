/**
 * @method pointRotation3D
 * Rotates a point in 3D around an origin with respect to the given rotation
 *
 * @author Brice Chevalier
 *
 * @param {number} cx - Origin position in x
 * @param {number} cy - Origin position in y
 * @param {number} cz - Origin position in z
 * @param {number} x - Position of the point to rotate in x
 * @param {number} y - Position of the point to rotate in y
 * @param {number} z - Position of the point to rotate in z
 * @param {object} rotation - Angle of the rotation
 * @param {number} rotation.cosx - Cosine of the rotation around the x axis
 * @param {number} rotation.sinx - Sine of the rotation around the x axis
 * @param {number} rotation.cosy - Cosine of the rotation around the y axis
 * @param {number} rotation.siny - Sine of the rotation around the y axis
 * @param {number} rotation.cosz - Cosine of the rotation around the z axis
 * @param {number} rotation.sinz - Sine of the rotation around the z axis
 *
 */

function pointRotation3D(cx, cy, cz, x, y, z, rotation) {
	var cosx = rotation.cosx;
	var cosy = rotation.cosy;
	var cosz = rotation.cosz;
	var sinx = rotation.sinx;
	var siny = rotation.siny;
	var sinz = rotation.sinz;

	var dx = x - cx;
	var dy = y - cy;
	var dz = z - cz;

	var u = sinz * dy + cosz * dx;
	var v = cosy * dz + siny * u;
	var w = cosz * dy - sinz * dx;

	return {
		x: cx + cosy * u - siny * dz,
		y: cy + sinx * v + cosx * w,
		z: cz + cosx * v - sinx * w
	};
}

exports.pointRotation3D = pointRotation3D;

/**
 * @method axisRotation3D
 * Rotates a point in 3D around an axis with respect to the given rotation
 *
 * @author Brice Chevalier
 *
 * @param {number} cx - Origin position in x
 * @param {number} cy - Origin position in y
 * @param {number} cz - Origin position in z
 * @param {number} x - Position of the point to rotate in x
 * @param {number} y - Position of the point to rotate in y
 * @param {number} z - Position of the point to rotate in z
 * @param {object} axis
 * @param {object} rotation - Angle of the rotation
 * @param {number} rotation.cos - Cosine of the rotation around the given axis
 * @param {number} rotation.sin - Sine of the rotation around the given axis
 *
 */

function axisRotation3D(cx, cy, cz, x, y, z, axis, rotation) {
	var cos = rotation.cos;
	var sin = rotation.sin;

	var ax = axis.x;
	var ay = axis.y;
	var az = axis.z;

	var dx = x - cx;
	var dy = y - cy;
	var dz = z - cz;

	var soc = (1 - cos);

	// Rotation matrix coefficients
	var a = ax * ax * soc + cos;
	var b = ax * ay * soc - az * sin;
	var c = ax * az * soc + ay * sin;

	var d = ay * ax * soc + az * sin;
	var e = ay * ay * soc + cos;
	var f = ay * az * soc - ax * sin;

	var g = az * ax * soc - ay * sin;
	var h = az * ay * soc + ax * sin;
	var i = az * az * soc + cos;

	return {
		x: cx + a * dx + b * dy + c * dz,
		y: cy + d * dx + e * dy + f * dz,
		z: cz + g * dx + h * dy + i * dz
	};
}

exports.axisRotation3D = axisRotation3D;