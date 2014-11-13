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
  description : 'A popup balloon for the backbone.js based modui suite. Demos courtesy of <a href="https://github.com/timothycommoner">Tim Commoner</a>.',
  packageUrl : 'https://github.com/rotundasoftware/modui-popup',
  repositoryUrl : 'https://github.com/rotundasoftware/modui-popup',
  examples : [
    { title : 'Text content', view : new ExampleOneView() },
    { title : 'View content', view : new ExampleTwoView() },
    { title : 'Positioning', view : new ExampleThreeView() },
    { title : 'Keep within rect', view : new ExampleFourView() }
  ]
} );

$( 'body' ).append( examplePage.$el );
examplePage.render();