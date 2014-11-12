var Super = require( 'modui-base' );
var ModuiPopup = require( 'modui-popup' );

var template = require( './template.tpl' );
var Popup = require( './popup/view' );

module.exports = Super.extend( {
	initialize: function() {
		this.render();
	},
	render: function(){
		this.$el.html( template() );
		this.resolveHandles(); 
	},
	ui : {
    "trigger" : ".trigger!",
    "popup"		: ".popup!"
  },
	events: {
		'click trigger' : 'exampleTwoTrigger'
	},
	exampleTwoView: null,
	exampleTwoTrigger: function(){
		if (!this.exampleTwoView) this.exampleTwoView = new Popup( { el: this.ui.popup } );
		ModuiPopup.open( {
			target : this.ui.trigger,
			position : 'right center',
			contents : this.exampleTwoView
		} );
	},
} );
