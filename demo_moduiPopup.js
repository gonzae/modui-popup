// var $ = require( 'jquery' );
// var _ = require( 'underscore' );

// var Super = require( 'modui-base' );

// var ModuiPopup = require( 'modui-popup' );
// var Backbone = require( 'backbone' );

// Backbone.$ = $;

// var ExampleOneView = require( './exampleViews/views/exampleOne' );
// var ExampleTwoView = require( './exampleViews/views/exampleTwo' );
// var ExampleThreeView = require( './exampleViews/views/exampleThree' );
// var ExampleFourView = require( './exampleViews/views/exampleFour' );

// var kFadeTime = 70; // keep in sync with kFadeTime in main file

// function scrollbarWidth() {
// 	// thanks to http://chris-spittles.co.uk/jquery-calculate-scrollbar-width/
//   var $inner = $('<div style="width: 100%; height:200px;">test</div>'),
//       $outer = $('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
//       inner = $inner[0],
//       outer = $outer[0];
   
//   $('body').append(outer);
//   var width1 = inner.offsetWidth;
//   $outer.css('overflow', 'scroll');
//   var width2 = outer.clientWidth;
//   $outer.remove();

//   return (width1 - width2);
// }

// var MainView = Super.extend( {
// 	initialize: function() {
// 		Backbone.Subviews.add( this );
// 		this.render();
// 		var example4ContainerDim = ( $( '.example4--outer' ).width() + scrollbarWidth() ) / 2;
// 		$( '.example4--outer' ).scrollTop( example4ContainerDim / 2 ).scrollLeft( example4ContainerDim );
// 	},
//   subviewCreators : {
//   	"exampleOne" : function() {
//   		return new ExampleOneView( { } );
//   	},
//   	"exampleTwo" : function() {
//   		return new ExampleTwoView( { } );
//   	},
//   	"exampleThree" : function() {
//   		return new ExampleThreeView( { } );
//   	},
//   	"exampleFour" : function() {
//   		return new ExampleFourView( { } );
//   	}
//   },
// 	render: function(){
// 		var template = _.template( $( '#main_template' ).html(), {});
// 		this.$el.html( template() );
// 	}
// });

// var mainView = new MainView( { el: $( '#main' ) } );

var ModuiExamplePage = require( 'modui-example-page' );
var Backbone = require( 'backbone' );
var $ = require( 'jquery' );
var rainbow = require( './lib/rainbow' );

var ExampleOneView = require( './exampleViews/one/view' );
var ExampleTwoView = require( './exampleViews/two/view' );
var ExampleThreeView = require( './exampleViews/three/view' );
var ExampleFourView = require( './exampleViews/four/view' );

var examplePage = new ModuiExamplePage( {
  title : 'ModuiPopup',
  description : 'modui-popup is a simple popup plugin for backbone.js.',
  examples : [
    { title : 'Text Content', view : new ExampleOneView },
    { title : 'View Content', view : new ExampleTwoView },
    { title : 'Positioning', view : new ExampleThreeView },
    { title : 'Bounding Box', view : new ExampleFourView }
  ]
} );

$( 'body' ).append( examplePage.$el );
examplePage.render();