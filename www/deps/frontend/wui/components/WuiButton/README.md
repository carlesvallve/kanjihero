#WUIButton

## What it is

WUIButton is a button component made for WUI. It behaves like an HTML5 button would be expected to.

It can listen for various events such as tap, tapstart and tapend.
This component inherits from WUIDom and utilizes WUI's buttonBehavior.

## Methods

WUIButton has methods that it inherits from EventEmitter and WUIDom.

## enable

The enable method can be called to enable tap interaction with a disabled WUI button.

```javascript
button.enable();
```

### disable

The disable method can be called to prevent tap interaciton with a WUIButton

```javascript
button.disable();
```

## Events

### tapstart

This event occurs when the user first presses a WUIButton.

### tap

The tap event occurs when the user confirms a tap event by releasing the tap.

### tapend

The tapend event is called when the tapevent has been processed successfully.

### tapcancel

The tapcancel event is only called when a tapevent is canceled, and the button loses focus.

### enabled

The enabled event is called when a WUIButton is enabled, such as by the enable method.

### disabled

The disabled event is called when a WUIButton is disabled, such as by the disable method.

## How to use WUIButton

See the example below:

```javascript
var WuiButton = require('WuiButton');
var btn;

form.onsubmit = function () {
	if (btn) {
		btn.destroy();
	}

	btn = new WuiButton(form.caption.value);

	btn.on('tapstart', function () {
		// Users starts a tap event
	});

	btn.on('tapcancel', function () {
		// User cancels a tap event
	});

	btn.on('tap', function () {
		// Tap event is executing
	});

	btn.on('tapend', function () {
		// Tap event has completed
	});

	return false;
};
```
