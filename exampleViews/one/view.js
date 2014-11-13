var Super = require( 'modui-base' );
var ModuiPopup = require( 'modui-popup' );

var template = require( './template.tpl' );

module.exports = Super.extend( {
	template : template,
	ui : {
		"textBox" : ".trigger!"
	},
	events: {
		'click textBox' : 'exampleOneTrigger'
	},
	exampleOneTrigger: function() {
		ModuiPopup.open( {
			target : this.ui.textBox,
			position : 'right center',
			contents : 'Woah! You actually <b>clicked</b> me!'
		} );
	}
} );
