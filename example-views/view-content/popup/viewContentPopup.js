var ModuiPopup = require( 'modui-popup' );
var Backbone = require( 'backbone' );
var Super = require( 'modui-base' );
var ModuiPopup = require( 'modui-popup' );

var template = require( './viewContentPopup.tpl' );

var ExampleTwoModel = Backbone.Model.extend( {} );
var exampleTwoModel = new ExampleTwoModel( { text: 'This is a view' } );

module.exports = Super.extend( {
	initialize: function() {
		this.model = exampleTwoModel;
		this.render();
	},
	render: function() {
		this.$el.html( template( this.model.toJSON() ) );
		this.delegateEvents();
		this.resolveHandles();
		this.ui.input.val( this.model.get( 'text' ) );
	},
	ui : {
		"input" : "input!"
	},
	events: {
		'keyup input' : 'textChanged',
	},
	textChanged: function() {
		var newText = this.ui.input.val();
		this.model.set( 'text', newText );
		this.render();
		this.ui.input.focus().val( newText );
	}
} );