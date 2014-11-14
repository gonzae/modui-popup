var Super = require( 'modui-base' );
var ModuiPopup = require( 'modui-popup' );

var template = require( './viewContent.tpl' );
var Popup = require( './popup/viewContentPopup' );

module.exports = Super.extend( {
	template : template,
	initialize: function() {
		this.render();
	},
	ui : {
		"clickBtn" : ".trigger!",
		"popup"		: ".popup!"
	},
	events: {
		'click clickBtn' : 'exampleTwoTrigger'
	},
	exampleTwoView: null,
	exampleTwoTrigger: function(){
		if (!this.exampleTwoView) this.exampleTwoView = new Popup( { el: this.ui.popup } );
		ModuiPopup.open( {
			target : this.ui.clickBtn,
			position : 'right center',
			contents : this.exampleTwoView
		} );
	},
} );
