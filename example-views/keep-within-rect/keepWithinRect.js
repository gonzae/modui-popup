var Super = require( 'modui-base' );
var ModuiPopup = require( 'modui-popup' );

var template = require( './keepWithinRect.tpl' );

module.exports = Super.extend( {
	template : template,
	ui : {
		"inner"		:  ".trigger!",
		"outer"		: '.outer!'
	},
	render : function() {
		Super.prototype.render.apply( this, arguments );

		var outer = this.ui.outer;
		var popup = ModuiPopup.open( {
			target : this.ui.inner,
			position : 'top center',
			contents : 'Dance!',
			closeOnOutsideClick : false,
			keepWithinRect : {
				top    : outer.offset().top,
				bottom : outer.offset().top + outer.height(),
				left   : outer.offset().left,
				right  : outer.offset().left + outer.width()
			}
		} );
		this.ui.outer.on( 'scroll', function() {
			popup.reposition();
		} );
	}
} );
