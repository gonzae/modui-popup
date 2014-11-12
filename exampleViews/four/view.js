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
		"trigger"		:  ".trigger!",
    "outer"		: '.example4--outer!'
  },
	events: {
		'click trigger' : 'exampleFourTrigger'
	},
	exampleFourTrigger:	function() {
		var outer = this.ui.outer;
		var popup = ModuiPopup.open( {
			target : this.ui.trigger,
			position : 'top center',
			contents : 'Dance!',
			keepWithinRect : function(){ return {
					top : outer.offset().top,
					bottom : outer.offset().top + outer.height(),
					left   : outer.offset().left,
					right  : outer.offset().left + outer.width()
				};
			}
		} );
		this.ui.outer.on( 'scroll', function() {
			popup.reposition();
		} );
	}
} );
