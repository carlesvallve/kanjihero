#WUIImage

WUIImage is a WUI component that allows an HTML image to be set to a specific game asset or URL.
The image can then be loaded immediately or at any time from code. Methods include getUrl, setUrl,
setAsset and load. Events emitted by this component are 'loaded' and 'error'.

## Methods

### load

The load method can be called to load an image. It refers to the URL assigned to the
element in order to render the image. This method enables code-based lazy loading. This method emits
the error and loaded events.

```javascript
imageElement.load();
```

### getUrl

This method will retrieve the URL associated with the WUIImage element.

```javascript
var urlPath = imageElement.getUrl();
```

### setUrl

This method will assign a URL to the WUIImage element, which is used by the load method to display
the image. **Note** that setting the URL does not load the image, nor does this function validate
the URL that this method passes. Programmers should be cautious to pass well-formed URLs to this
method.

Calling the method:

```javascript
imageElement.setUrl(urlPath);
```

### setAsset

This method can be used with the MAGE assets map to set an asset to the WUIImage component. Note
that the getUrl function should be defined by the asset object, and that the WUIImage component
will always prefer direct URLs provided by setUrl.

Calling the method:

```javascript
imageElement.setAsset(asset);
```

## Events

### loaded

The loaded event is called when the load function renders a WUIImage to the display.

### error

The error method is called, containing an Error object, when the WUIImage has a problem rendering
the image. For example, if no URL is provided.

### Example

```javascript
var WuiImage = require('WuiImage');
var WuiButton = require('WuiButton');
var img;

function getUrl() {
    return 'http://www.example.com/foobar' + '?' + Date.now();
}

var btn = new WUIButton();
this.appendChild(btn);
btn.onclick = function () {
    if (img) {
        img.destroy();
    }

    img = new WuiImage(getUrl());

    var onLoaded = function () {
        workspace.appendChild(img.rootElement);
        img.removeEventListener('error', onError);
    };

    var onError = function () {
        window.alert('Error loading the image');
        img.removeEventListener('loaded', onLoaded);
    };

    // Handle these events exactly once
    img.once('loaded', onLoaded);
    img.once('error', onError);
    img.load();
};


img = new WuiImage(getUrl());
img.load();
};
```