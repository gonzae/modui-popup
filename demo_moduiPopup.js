var $ = require( 'jquery' );
var _ = require( 'underscore' );

var ModuiPopup = require( 'modui-popup' );
var Backbone = require( 'backbone' );

Backbone.$ = $;

var kFadeTime = 70; // keep in sync with kFadeTime in main file

var ExampleTwoModel = Backbone.Model.extend( {} );
var exampleTwoModel = new ExampleTwoModel( { text: '' } );

var ExampleTwoView = Backbone.View.extend( {
  initialize: function() {
    this.model = exampleTwoModel;
    this.render();
  },
  render: function() {
    var template = _.template( $( '#example2_template' ).html(), {} );
    this.$el.html( template( this.model.toJSON() ) );
  },
  rerender: function() {
  	this.render();
    $( '#example2--input ').val( this.model.get( 'text' ) ).focus();
    this.delegateEvents()
  },
	events: {
		'keyup #example2--input' : 'textChanged',
	},
	textChanged: function() {
		var newText = $( '#example2--input' ).val();
		this.model.set( 'text', newText );
		this.render();
		$( '#example2--input' ).val( newText ).focus();
	}
} );

var MainView = Backbone.View.extend( {
	initialize: function() {
		this.render();
		var example4ContainerDim = $( '.example4--container' ).width() / 2;
		$( '.example4--container' ).scrollTop( example4ContainerDim / 2 ).scrollLeft( example4ContainerDim );
	},
	render: function(){
		var template = _.template( $( '#main_template' ).html(), {});
		this.$el.html( template() );
	},
	events: {
		'focus #example1--trigger' : 'exampleOneTrigger',
		'click #example2--trigger' : 'exampleTwoTrigger',
		'click .example3-radio' : 'exampleThreeTrigger',
		'click #example4--inner' : 'exampleFourTrigger'
	},
	exampleOneTrigger: function() {
		ModuiPopup.open( {
			target : $( '#example1--trigger' ),
			position : 'top center',
			contents : 'Woah! You actually clicked it!'
		} );
	},
	exampleTwoView: null,
	exampleTwoTrigger: function(){
		if (!this.exampleTwoView) this.exampleTwoView = new ExampleTwoView( { el: $('#example2--popup') } );
		ModuiPopup.open( {
			target : $( '#example2--demo' ),
			position : 'right center',
			contents : this.exampleTwoView
		} );
		this.exampleTwoView.rerender();
	},
	example3Contents: 'I\'m here!',
	exampleThreeTrigger: function() {
		var position = $( 'input[name="example3--radio"]:checked' ).val();
		ModuiPopup.open( {
			target : $( '#example3--demo' ),
			position : position,
			contents : this.example3Contents
		} );
		var rando = Math.random();
		switch ( true ){
			case ( rando < .2 ) : this.example3Contents = 'Haha! Now I\'m here!'; break;
			case ( rando < .4 ) : this.example3Contents = 'Over here!'; break;
			case ( rando < .6 ) : this.example3Contents = 'Psych!'; break;
			case ( rando < .8 ) : this.example3Contents = 'No, I\'m over here!'; break;
			default : this.example3Contents = 'Here now!'; break;
		}
	},
	exampleFourTrigger:	function() {
		ModuiPopup.open( {
			target : $( '.example4--inner' ),
			position : 'left center',
			contents : 'Watch me dance!',
			keepWithinRect : function(){ return {
					top : $( '.example4--container' ).offset().top,
					bottom : $( '.example4--container' ).offset().top + $( '.example4--container' ).height(),
					left   : $( '.example4--container' ).offset().left,
					right  : $( '.example4--container' ).offset().left + $( '.example4--container' ).width()
				};
			}
		});
	}
});

var mainView = new MainView( { el: $( '#main' ) } );