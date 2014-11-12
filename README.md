About
=====

`modui-popup` is a simple popup plugin extending from `modui`.

Install
=======

npm install -g modui-popup

Demo
====

[Click here](http://rotundasoftware.github.io/modui-popup/).

Usage
=====

First, require `modui-popup	 into your app:

		var ModuiPopup = require( 'modui-popup' );</pre>
					<p>You can then create a popup with the `open` function:</p>
					<pre class="code">
		ModuiPopup.open( {
		  target : $( '#example' ),
		  contents : 'Woah! You actually clicked it!'
		} );

Note the two key-value pairs, `target` and `contents`. `target` specifies the DOM element beside which the popup will appear. Meanwhile, the `contents` will appear within the popup. You can assign `contents` as either a static string or a Backbone view, such as:

		ModuiPopup.open( {
		  target : $( '#example' ),
		  contents : new ExampleView()
		} );

position
----------

In addition to the two required key-value pairs, you can also pass in a `position`. By default, the popup will appear 'bottom center'. Valid `position`s include:

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