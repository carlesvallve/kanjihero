#WUIView

## What it is

This functions is basically an HTML div, but allows for the created, opening, opened, closing and
closed events. On each of these events, the game programmer can perform logic related to loading
data, binding other events, animation or other game events. Inherits from WUIDom.

## Using the WUIView component

A WUIView often contains other WUIDom and WUI elements, and is usually a container element, used
for display, hide and show logic. It can interact with NavTree to enable smooth navigation on single
page applications.

## Methods

### create

The create method is called when a view is being created. This method is called by NavTree when a
WUIView is registered. It includes optional parameters, specified during the item registration
process.

Calling the method:

```javascript
newView.create(options, viewName);
```

These options can be used to specify dynamic view behavior, but both parameters should be
considered optional.

### open

The open method can be used to show a WUIView.

The views are automatically scrolled into view,
so the user should not worry about trying to do screen logic.

Calling the method:

```javascript
newView.open();
```

### close

The close method can be used to hide a WUIView.

Calling the method:

```javascript
newView.close();
```

### disableScrolling

The disableScrolling method can be used to disable scrolling events on a WUIView.

Calling the method:

```javascript
newView.disableScrolling();
```

### enableScrolling

The enableScrolling method can be used to enable scrolling events on a WUIView. By default,
scrolling events are enabled on a WUIView.

Calling the method:

```javascript
newView.enableScrolling();
```

## Events

### created

The created event is called when the WUIView's create function has completed, and after it is
registered in a NavTree.

### opening

The opening event is called when the WUIView's open method is called, and it is in the process of
being transitioned to.

### closed

The closed event is called when the WUIView's closed method is called. Destructor logic should be
placed here.

### How to use WUIView

```javascript

function SampleView() {
	WuiView.call(this);

	this.once('created', function () {
		// Load player data
		// Setup button events
	});

	this.on('opening', function () {
		// Start animations
		// Load data
		// Update views with recent data
	});

	this.on('closed', function () {
        // Pause animations
        // Set timeouts
        // Free resources
        // Invalidate caches, if needed
	});

}

inherit(SampleView, WuiView);
module.exports = SampleView;
```