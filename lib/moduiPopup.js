
var Super = require( 'modui-base' );
var Backbone = require( 'backbone' );
var _ = require( 'underscore' );
var $ = require( 'jquery' );

require( './ui/jquery-plugins/outside-events' );

var lastPossibleViewElement = $( 'body' )[ 0 ];
var openPopups = [];

var kState_Closed = 'closed';
var kState_Open = 'open';
var kState_Closing = 'closing';

var kFadeTime = 70;

module.exports = Super.extend( {
	options : [
		'target!',
		'contents',
		{ distanceAway : 2 },
		{ position : 'bottom center' },
		{ pointerPosition : 'bottom center' },
		{ keepWithinRect : function(){ return {
			top : $( window ).scrollTop(),
			bottom : $( window ).scrollTop() + $( window ).height(),
			left   : 0,
			right  : $( window ).width()
		}; } },
		{ pointerOffset : 0 },
		{ closeOnOutsideClick : true },
		'onClose',
		'signature'
	],

	passMessages : { '*' : '.' }, // pass all courier messages directly through to parent view

	className : 'modui-popup',

	initialize : function() {
		var _this = this;

		this._setupTargetEl();

		this._setState( kState_Closed );

		if (this.$el.zIndex) { this.$el.zIndex( this.targetEl.zIndex() + 1 ); }
 

		if( this.closeOnOutsideClick ) {
			setTimeout( function() {
				// in case this popup is triggered by a click, we need to wait
				// until the next event loop before we bind the outside click
				// event to closing the popup. otherwise would close right away
				_this.$el.bind( 'clickoutside', function( e ) {
					// we do not close the popup if the clicked element is within the original
					// target element that this popup is pointing at (or IS that element)
					if( e.target !== _this.targetEl.get( 0 ) && ! $.contains( _this.targetEl.get( 0 ), e.target ) ) {
						_this.close();
					}
				} );
			} );
		}
	},

	render : function() {
		if( _.isString( this.contents ) ) {
			this.$el.html( '<div class="html-contents">' + this.contents + '</div>' );
		} else if( this.contents instanceof Backbone.View ) {
			this.$el.html( '' );
			this.$el.append( this.contents.$el );
			this.contents.render();
		}
		else {
			// if we don't have any contents specified, assume that this is
			// a derived class that defines its own contents with its own render.
			Super.prototype.render.apply( this, arguments );
		}
	},

	close : function( callback ) {
		var _this = this;

		if( this.state !== kState_Open ) return;

		this.$el.unbind( 'clickoutside' );
		this._setState( kState_Closing );

		setTimeout( function() {
			if( _this.state === kState_Closing ) {
				_this.remove();
				openPopups = _.without( openPopups, _this );
				if( _this.onClose ) _this.onClose();
			}

			if( callback ) callback();
		}, kFadeTime );
	},

	reposition : function() {
		var targetWidth = Math.round( this.targetEl.outerWidth() );
		var targetHeight = Math.round( this.targetEl.outerHeight() );

		var popupWidth  = Math.round( this.$el.width() );
		var popupHeight = Math.round( this.$el.outerHeight() );

		//var offsetParent = $( 'html' ).get(0) !== this.targetEl.offsetParent().get( 0 ) ? this.targetEl.offsetParent() : $( window );
		var offsetParent = $( window );
		var parentWidth = Math.round( offsetParent.outerWidth() );
		var parentHeight = Math.round( offsetParent.outerHeight() );

		var distanceAway = this.distanceAway;

		var targetOffset = this.targetEl.offset();
		var pointerOffset = this.pointerOffset;

		var cssPositionProps;

		var currentPositionBeingTried = this.position;
		var allPositionsAreOutOfBounds = false;
		var done = false;

		do {  // run through all our different positions to find one that works
			switch( currentPositionBeingTried ) {
				case 'top left':
					cssPositionProps = {
						bottom : parentHeight - targetOffset.top + distanceAway,
						left : targetOffset.left + pointerOffset,
						top : 'auto',
						right : 'auto'
					};
					break;
				case 'top center':
					cssPositionProps = {
						bottom : parentHeight - targetOffset.top + distanceAway,
						left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ),
						top : 'auto',
						right : 'auto'
					};
					break;
				case 'top right':
					cssPositionProps = {
						top	: 'auto',
						bottom : parentHeight - targetOffset.top + distanceAway,
						right : parentWidth - ( targetOffset.left + targetWidth ) + pointerOffset,
						left : 'auto'
					};
					break;
				case 'left center':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + ( targetHeight / 2 ) - ( popupHeight / 2 ) + pointerOffset ),
						right : parentWidth - targetOffset.left + distanceAway,
						left : 'auto',
						bottom : 'auto'
					};
					break;
				case 'right center':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + ( targetHeight / 2 ) - ( popupHeight / 2 ) + pointerOffset ),
						left : targetOffset.left + targetWidth + distanceAway,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'bottom left':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						left : targetOffset.left + pointerOffset,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'bottom center':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ),
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'bottom right':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						right : parentWidth - ( targetOffset.left + targetWidth ) + pointerOffset,
						bottom : 'auto',
						left : 'auto'
					};
					break;
			}

			// tentatively place on stage
			this.$el
				.css( cssPositionProps )
				.removeClass( 'top left center bottom right' )
				.addClass( currentPositionBeingTried )
			;

			if( this._isOutsideOfBoundingRect() ) {
				// Popup is outside bounding rect. try a new position.
				currentPositionBeingTried = _getNextPositionToTry( currentPositionBeingTried );

				// if we have tried all the different positions and are now are back at our
				// original 'preferred' position, then, shit, all positions were out of bounds.
				allPositionsAreOutOfBounds = currentPositionBeingTried === this.position;
				if( allPositionsAreOutOfBounds ) done = true;
			}
			else done = true;

		} while( ! done );

		return ! allPositionsAreOutOfBounds;
	},

	_isOutsideOfBoundingRect : function() {
		var myOffset = this.$el.offset();
		if( ! myOffset ) return false; // hidden elements have undefined offsets, not much we can do

		var myRect = {
			top : myOffset.top,
			right : myOffset.left + this.$el.width(),
			bottom : myOffset.top + this.$el.outerHeight(),
			left : myOffset.left
		};

		var keepWithinRect = _.result( this, 'keepWithinRect' );

		var sidesAreOutOfBounds = {
			top : ( myRect.top < keepWithinRect.top ),
			bottom : ( myRect.bottom > keepWithinRect.bottom ),
			right : ( myRect.right > keepWithinRect.right ),
			left : ( myRect.left < keepWithinRect.left )
		};

		return _.contains( sidesAreOutOfBounds, true );
	},

	_onOptionsChanged : function( changedOptions ) {
		if( 'target' in changedOptions ) this._setupTargetEl();
		if( 'contents' in changedOptions ) this.render();

		this.reposition();
	},

	_getParentView : function() {
		var parent = null;

		var curElement = this.targetEl;
		while( curElement.length > 0 && curElement[0] !== lastPossibleViewElement ) {
			var view = curElement.data( 'view' );
			if( view && view instanceof Backbone.View ) {
				parent = view;
				break;
			}

			curElement = curElement.parent();
		}

		return parent;
	},

	_setState : function( newState ) {
		this.state = newState;
		this.$el.attr( 'data-state', this.state );
	},

	_setupTargetEl : function() {
		var _this = this;

		this.targetEl = this.target instanceof Backbone.View ? this.target.$el : this.target;

		this.targetEl.on( 'remove', function() {
			_this.close();
		} );
	}
}, {
	open : function( options ) {
		var popupInstance;

		var existingPopupsOfThisSignature = _.filter( openPopups, function( thisPopup ) {
			return thisPopup.signature === options.signature && thisPopup.state === kState_Open;
		} );

		if( existingPopupsOfThisSignature.length ) {
			var popupWeAreGoingTokeep = existingPopupsOfThisSignature.pop();

			popupInstance = popupWeAreGoingTokeep;
			popupInstance.setOptions( options );

			_.each( existingPopupsOfThisSignature, function( thisExtraPopup ) {
				thisExtraPopup.close();
			} );
		}

		if( ! popupInstance ) {
			popupInstance = new this( options );

			$( 'body' ).append( popupInstance.$el );
			popupInstance.render();
			popupInstance.reposition();
			openPopups.push( popupInstance );
		}

		popupInstance._setState( kState_Open );

		return popupInstance;
	}
} );

$( window ).resize(function() {
	_.each( openPopups, function( thisPopup ) {
		thisPopup.reposition();
	} );
} );

function _getNextPositionToTry( position ) {
	switch( position ) {
		case 'top left':
			position = 'bottom left';
			break;
		case 'bottom left':
			position = 'top right';
			break;
		case 'top right':
			position = 'bottom right';
			break;
		case 'bottom right':
			position = 'top center';
			break;
		case 'top center':
			position = 'bottom center';
			break;
		case 'bottom center':
			position = 'right center';
			break;
		case 'right center':
			position = 'left center';
			break;
		case 'left center':
			position = 'top center';
			break;
	}

	return position;
}