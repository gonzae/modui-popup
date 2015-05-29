var ModuiExamplePage = require( 'modui-example-page' );
var Backbone = require( 'backbone' );
var $ = require( 'jquery' );
var rainbow = require( './lib/rainbow' );

var TextContentExampleView = require( './example-views/text-content/textContent' );
var ViewContentExampleView = require( './example-views/view-content/viewContent' );
var PositioningExampleView = require( './example-views/positioning/positioning' );
var KeepWithinRectExampleView = require( './example-views/keep-within-rect/keepWithinRect' );

var examplePage = new ModuiExamplePage( {
  title : 'modui-popup',
  description : 'A popup balloon for the backbone.js based modui suite.',
  packageUrl : 'https://github.com/rotundasoftware/modui-popup',
  repositoryUrl : 'https://github.com/rotundasoftware/modui-popup',
  examples : [
    { title : 'Text content', view : new TextContentExampleView() },
    { title : 'View content', view : new ViewContentExampleView() },
    { title : 'Positioning', view : new PositioningExampleView() },
    { title : 'Keep within rect', view : new KeepWithinRectExampleView() }
  ]
} );

$( 'body' ).append( examplePage.$el );
examplePage.render();
