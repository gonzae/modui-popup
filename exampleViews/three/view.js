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
		"trigger"		:  ".trigger",
    "target"		: '.example3-table!'
  },
	events: {
		'click trigger' : 'exampleThreeTrigger'
	},
	example3Contents: 'I\'m here!',
	exampleThreeTrigger: function() {
		var position = this.$el.find( 'input[name="trigger"]:checked' ).val();
		ModuiPopup.open( {
			target : this.ui.target,
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
	}
} );
