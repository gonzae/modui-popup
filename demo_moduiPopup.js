var ModuiExamplePage = require( 'modui-example-page' );
var Backbone = require( 'backbone' );
var $ = require( 'jquery' );
var rainbow = require( './lib/rainbow' );

var ExampleOneView = require( './exampleViews/one/view' );
var ExampleTwoView = require( './exampleViews/two/view' );
var ExampleThreeView = require( './exampleViews/three/view' );
var ExampleFourView = require( './exampleViews/four/view' );

var examplePage = new ModuiExamplePage( {
  title : 'modui-popup',
  description : 'modui-popup is a simple popup plugin that is part of the backbone.js based modui suite.',
  packageUrl : 'https://github.com/rotundasoftware/modui-popup',
  repositoryUrl : 'https://github.com/rotundasoftware/modui-popup',
  examples : [
    { title : 'Text Content', view : new ExampleOneView() },
    { title : 'View Content', view : new ExampleTwoView() },
    { title : 'Positioning', view : new ExampleThreeView() },
    { title : 'Bounding Box', view : new ExampleFourView() }
  ]
} );

$( 'body' ).append( examplePage.$el );
examplePage.render();