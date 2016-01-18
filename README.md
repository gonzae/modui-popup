# modui-popup

A backbone.js based popup balloon. Looks like this:

![](https://github.com/rotundasoftware/modui-popup/blob/master/popupShot.png)

__For demos see [the modui-popup home page](http://rotundasoftware.github.io/modui-popup/).__

## Installation

If you are using CommonJS,

```
npm install modui-popup
```

Check out [parcelify](https://github.com/rotundasoftware/parcelify) or [cartero](https://github.com/rotundasoftware/cartero) for css compilation, or just include moduiPopup.css in your page.

Or, if you are not using CommonJS, just load moduiPopup.js, and [moduiBase.js](https://github.com/rotundasoftware/modui-base/blob/master/modui-base.js), and modui-popup will be exported to the `ModuiPopup` global. Don't forget to include include moduiPopup.css.

## Usage

Use the static `open` method to popup a popup.

```javascript
var ModuiPopup = require( 'modui-popup' );

ModuiPopup.open( {
  target : $( '#example' ),
  position : 'right center',
  contents : 'This is a popup balloon.'
} );
```

`contents` may either be a text/html string or a backbone view instance.

### ModuiPopup.open() options

The `ModuiPopup.open()` method may be passed an options argument with the following properties.

#### `target`

(required) Determines the element at which the popup will be pointed. May be a jquery object representing a DOM element or an instance of a backbone view.

#### `contents`

(required) Determines the contents of the popup balloon. May be a text or html string, or an instance of a backbone view. If an instance of a view, the view's `render()` function will be called automatically when the popup is shown.

#### `position`

(default: 'bottom center') A string that determines the preferred position of the popup relative to its target. Valid positions are:

'bottom center'
'top center'
'right center'
'left center'
'bottom center right'
'bottom center left'
'top center right'
'top center left'
'bottom left'
'bottom right'
'top left'
'top right'

If the preferred position supplied causes the popup to extend outside of `keepWithinRect`, then the remaining positions are tried in the order above until one is found that does not cause the popup to extend outside of `keepWithinRect`. The `position` option may also be an array of preferred position strings, in which each each position in the array is tried (in the order supplied) before the remaining positions are tried.

#### `strictPositioning`

(default: 'false') If true, *only* the position(s) supplied in the `position` property are tried, and if none of those positions result in the popup being within keepWithinRect, the popup will remain in the last supplied position. (The default behavior is that the supplied positions are treated as the "preferred" positions, but the remaining positions will also be tried if none of the supplied positions work.)

See [the demo page](http://rotundasoftware.github.io/modui-popup/) for an interactive example.

#### `distanceAway`

(default: 2) The number of pixels between the end of the balloon's pointer and the edge of the target element.

#### `pointerOffset`

(default: 0) Set to a positive or negative number of pixels to offset the pointer location that distance from its "default" location.

#### `keepWithinRect`

(default: the window rect) By default, `modui-popup` will reposition popups that fall off the screen. However you can use this option to ensure the balloon always stays within a rect that you supply. The value of this option should represent a rectangle and have `top`, `bottom`, `left`, and `right` properties.

#### `closeOnOutsideClick`

(default: true) When true, the popup will automatically close whenever the mouse is clicked outside of its area (and the area of its target element).

#### `signature`

(default: undefined) Two popups with the same signature will never be visible at one time. If a signature for the popup is provided, ModuiPopup.open() will check to see if an existing popup is open with that signature. If so, it will use that instance (i.e. it will fill the instance with the new contents and point it at the new target element) instead creating a new popup instance. The feature is especially useful when `closeOnOutsideClick` is `false`, since it provides a means to "close" one popup when another is opened.

#### `onClose`

(default: undefined) If provided, this callback method will be invoked when the popup is closed.

## License
MIT
