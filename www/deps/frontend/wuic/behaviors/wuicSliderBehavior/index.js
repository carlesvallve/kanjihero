/**
 * @alias wuicSliderBehavior
 * @desc turn a Sprite into a slider object
 * @author Brice Chevalier <bchevalier@wizcorp.jp>
 *
 * @param {WuicSprite} slider     - Object to turn into a slider
 * @param {WuicSprite} registerTo - Object from which slider get the touch events
 * @param {Number} min            - Minimum value of the slider
 * @param {Number} max            - Maximum value of the slider
 * @param {Number} [margin=0]     - Left and right margins of the slider, the actual slidable zone is in the range [margin, slider.width - margin]
 * @param {Number} [step=0]       - Minimum space between two possible values (if step === 0 then the slider can take any value within [min, max])
 * @return {WuicSprite}           - The input sprite augmented with the slider behavior
 */

function sliderBehavior(slider, registerTo, min, max, margin, step) {

	// Slider properties

	margin = margin || 0;
	step = step || 0;
	var range = max - min;
	var nbSteps = range / step + 1;


	// Value of the slider

	var value = min;


	var tapped = 0;


	// Internal function to compute the value of the slider with respect to the clicked position x

	var computeValue = function (x) {
		x = Math.max(0, Math.min(slider.width - 2 * margin, x - margin));
		if (step > 0) {
			var v = nbSteps * x / (slider.width - 2 * margin + 1);
			v = (v | v) * step + min;
			value = Math.min(v, max);
		} else {
			value = range * x / (slider.width - 2 * margin) + min;
		}
		slider.emit('update', value, min, max, step);
	};


	// Public setter

	slider.setSliderValue = function (value) {

		if (step > 0) {
			value = (value - min) / step;
			value = (value | value) * step;
			value = Math.min(max, Math.max(min, min + value));
			slider.value = value;
		} else {
			value = Math.min(max, Math.max(min, value));
			slider.value = value;
		}

		slider.emit('update', value, min, max, step);
	};


	// Public getter

	slider.getSliderValue = function () {
		return value;
	};


	// Events registered: tap start, move, end and cancel

	registerTo.on('tapstart', function (e, pos) {
		if (tapped) {
			return;
		} // forbid behavior to be tapped two time by different touchevent
		var state = slider.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			state.inBounds = (state.localX >= 0 && state.localX <= slider.width && state.localY >= 0 && state.localY <= slider.height);
			if (state.inBounds) {
				computeValue(state.localX);
				tapped = pos.id;
				slider.emit('tapstart', e, state);
				slider.emit('slidestart', e, state, value);
			}
		}
	});

	registerTo.on('tapmove', function (e, pos) {
		var state = slider.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === tapped) {
				computeValue(state.localX);
				slider.emit('tapmove', e, state);
				slider.emit('slide', e, state, value);
			}
		}
	});

	registerTo.on('tapend', function (e, pos) {
		var state = slider.getLocalCoordinate(pos.x, pos.y, e.timeStamp);
		if (state.enabled) {
			if (pos.id === tapped) {
				state.inBounds = (state.localX >= 0 && state.localX <= slider.width && state.localY >= 0 && state.localY <= slider.height);
				if (state.inBounds) {
					computeValue(state.localX);
					slider.emit('tapend', e, state);
					slider.emit('slideend', e, state, value);
				} else {
					slider.emit('tapendoutside', e, state);
				}
				tapped = 0;
			}
		}
	});

	registerTo.on('tapcancel', function (e) {
		if (tapped) {
			slider.emit('tapcancel', e);
			slider.emit('slideend', e);
			tapped = 0;
		}
	});

	return slider;
}

module.exports = sliderBehavior;