

var $ = require( 'jquery' );
var _ = require( 'underscore' );
var should = require( 'should' );

var ModuiPopup = require( '../moduiPopup' );
var BaseView = require( 'modui-base' );
var Backbone = require( 'backbone' );

Backbone.$ = $;

var kFadeTime = 100; // keep in sync with kFadeTime in main file

describe( 'modui-popup', function() {
	var targetEl;
	
	beforeEach( function() {
		targetEl = $( '<div class="target" style="width: 400px;height: 100px;border: 1px solid black;margin:200px auto;"></div>' );
		$( 'body' ).append( targetEl );
	} );

	afterEach( function() {
		targetEl.remove();
	} );

	describe( 'opens and closes properly', function() {
		it( 'opens properly and close + close ccallback works as expected', function( done ) {
			var popup = ModuiPopup.open( {
				target : targetEl,
				position : 'top center',
				contents : 'This is a sample popup.'
			} );

			$( '.modui-popup' ).length.should.equal( 1 );
			popup.close( function() {
				$( '.modui-popup' ).length.should.equal( 0 );
				done();
			} );
		} );

		it( 'closes on outside click', function( done ) {
			var popup = ModuiPopup.open( {
				target : targetEl,
				position : 'top center',
				contents : 'This is a sample popup.'
			} );

			setTimeout( function() {
				$( document ).trigger( 'click' );
				
				setTimeout( function() {
					$( '.modui-popup' ).length.should.equal( 0 );
					done();
				}, kFadeTime + 10 );
			}, kFadeTime + 10 );
		} );

		it( 'but does not close when outside click is on target element', function( done ) {
			var popup = ModuiPopup.open( {
				target : targetEl,
				position : 'top center',
				contents : 'This is a sample popup.'
			} );

			setTimeout( function() {
				$( targetEl ).trigger( 'click' );
				
				setTimeout( function() {
					$( '.modui-popup' ).length.should.equal( 1 );
					popup.close( done );
				}, kFadeTime + 10 );
			}, kFadeTime + 10 );
		} );
	} );

	describe( 'has the right contents', function() {
		it( 'html content is rendered correctly', function( done ) {
			var popup = ModuiPopup.open( {
				target : targetEl,
				position : 'top center',
				contents : '<b>This</b> is a sample popup.'
			} );

			popup.$el.text().should.equal( 'This is a sample popup.' );
			popup.$el.html().should.containEql( '<b>This</b> is a sample popup.' );
			popup.close( done );
		} );

		it( 'view content is rendered correctly', function( done ) {
			var MyView = BaseView.extend( {
				render : function() {
					this.$el.html( 'Sam I am I am Sam' );
				}
			} );

			var myContents = new MyView();

			var popup = ModuiPopup.open( {
				target : targetEl,
				position : 'top center',
				contents : myContents
			} );

			popup.$el.html().should.containEql( 'Sam I am I am Sam' );
			popup.close( done );
		} );
	} );

	// so we can see what this component looks like
	after( function() {
		sandbox();
	} );
} );

function sandbox() {
	var targetEl = $( '<div class="target" style="width: 400px;height: 100px;border: 1px solid black;margin:200px auto;"></div>' );
	$( 'body' ).append( targetEl );

	var targetEl2 = $( '<div class="target" style="width: 400px;height: 100px;border: 1px solid black;margin:200px auto;"></div>' );
	$( 'body' ).append( targetEl2 );

	var kPositions = [
		'top center', 
		'top left',
		'top right',
		'right center',
		'bottom right',
		'bottom center',
		'bottom left',
		'left center',
	];

	_.each( kPositions, function( thisPosition ) {
		ModuiPopup.open( {
			target : targetEl,
			position : thisPosition,
			contents : thisPosition,
			signature : _.uniqueId()
		} );
	} );

	var MyView = BaseView.extend( {
		render : function() {
			this.$el.html( 'This content is actually a view.' );
		}
	} );

	var myContents = new MyView();

	ModuiPopup.open( {
		target : targetEl2,
		position : 'left center',
		contents : myContents,
		signature : _.uniqueId()
	} );
}