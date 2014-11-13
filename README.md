# modui-popup

A popup balloon for the backbone.js-based modui suite.

__For demos see [the modui-popup home page](http://rotundasoftware.github.io/modui-popup/).__

## Installation

npm install modui-popup

## Usage

First, require `modui-popup	 into your app, then use the static `open` method to popup a popup.

```javascript
var ModuiPopup = require( 'modui-popup' );

ModuiPopup.open( {
  target : $( '#example' ),
  contents : 'This is a popup balloon!'
} );
```

Note the two key-value pairs, `target` and `contents`. `target` specifies the DOM element beside which the popup will appear. Meanwhile, the `contents` will appear within the popup. You can assign `contents` as either a static string or a Backbone view instance.

If you are using [parcelify](https://github.com/rotundasoftware/parcelify) or [cartero](https://github.com/rotundasoftware/cartero), the modui-popup styles will automatically be included in your css output. Otherwise, you'll need to include `moduiPopup.css` in your project manually.

### ModuiPopup.open() options

The ModuiPopup.open() method may be passed an options argument with the following properties.

#### `target` (required)

Determines the element at which the popup will be pointed. May be a jquery object representing a DOM element or an instance of a backbone view.

#### `contents` (required)

Determines the contents of the popup balloon. May be a text or html string, or an instance of a backbone view. If an instance of a view, the view's render() function will be called automatically when the popup is shown.

#### `position` (default: 'bottom center')

Determines the position of the popup relative to its target. Valid positions are:

* top left
* top center
* top right
* left center
* right center
* bottom left
* bottom center
* bottom right

keepWithinRect
----------------

By default, `modui-popup` will reposition popups that fall off the screen. You might want a more specific bounding box than the window itself, though. In the fourth example above, we show a popup box that is bound within a div. You can get this effect by assigning `keepWithinRect` a function that returns an object with coordinate key-values:

		ModuiPopup.open( {
		  target : $( '#example' ),
		  contents : new ExampleView(),
		  keepWithinRect : function() { return {
		      top : $( '#example' ).offset().top,
		      bottom : $( '#example' ).offset().top + $( '#example' ).height(),
		      left   : $( '#example' ).offset().left,
		      right  : $( '#example' ).offset().left + $( '#example' ).width()
		    };
		  }
		} );