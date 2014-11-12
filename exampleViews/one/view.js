var Super = require( 'modui-base' );
var ModuiPopup = require( 'modui-popup' );

var template = require( './template.tpl' );

module.exports = Super.extend( {
	initialize: function() {
		this.render();
	},
	render: function(){
		this.$el.html( template() );
		this.resolveHandles(); 
	},
	ui : {
    "trigger" : ".trigger!"
  },
	events: {
		'click trigger' : 'exampleOneTrigger'
	},
	exampleOneTrigger: function() {
		ModuiPopup.open( {
			target : this.ui.trigger,
			position : 'right center',
			contents : 'Woah! You actually clicked it!'
		} );
	}
} );
