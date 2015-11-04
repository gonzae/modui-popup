( function( root, factory ) {
	// UMD wrapper
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( [ 'underscore', 'backbone', 'jquery', 'modui-base' ], factory );
	} else if ( typeof exports !== 'undefined' ) {
		// Node/CommonJS
		module.exports = factory( require( 'underscore' ), require( 'backbone' ), require( 'jquery' ), require( 'modui-base' ) );
	} else {
		// Browser globals
		factory( root._, root.Backbone, ( root.jQuery || root.Zepto || root.$ ), root.Backbone.ModuiBase );
	}
}( this, function( _, Backbone, $, Super ) {

var lastPossibleViewElement = $( 'body' )[ 0 ];
var mOpenPopups = [];

var kState_Closed = 'closed';
var kState_Open = 'open';
var kState_Closing = 'closing';

var kFadeTime = 100;
var kMinTimeAfterOpenBeforeCloseOnOutsideClick = 100;

var kPositions = [
	'bottom center',
	'top center',
	'right center',
	'left center',
	'bottom center-right',
	'bottom center-left',
	'top center-right',
	'top center-left',
	'bottom left',
	'bottom right',
	'top left',
	'top right'
];

var mWindowEventListenersAttached = false;

Backbone.ModuiPopup = Super.extend( {
	options : [
		'target!',
		'contents',
		{ position : 'bottom center' },
		{ distanceAway : 2 },
		{ pointerOffset : 0 },
		{ keepWithinRect : function() { return {
			top : $( window ).scrollTop(),
			bottom : $( window ).scrollTop() + $( window ).height(),
			left   : 0,
			right  : $( window ).width()
		}; } },
		{ closeOnOutsideClick : true },
		'onClose',
		'signature',
		'zIndex',
		'extraClassName' // appended to regular class names to facilitate styling
	],

	passMessages : { '*' : '.' }, // pass all courier messages directly through to parent view

	className : 'modui-popup',

	initialize : function() {
		var _this = this;

		this._setupTargetEl();

		this._setState( kState_Closed );

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

		if( ! mWindowEventListenersAttached ) {
			_attachWindowEventListeners();
			mWindowEventListenersAttached = true;
		}
	},

	render : function() {
		if( _.isString( this.contents ) ) {
			this.$el.html( '<div class="html-contents">' + this.contents + '</div>' );
		} else if( _.isObject( this.contents ) && _.isFunction( this.contents.render ) ) {
			this.$el.html( '' );
			this.$el.append( this.contents.$el );
			this.contents.render();
			this.contents.delegateEvents();
		} else {
			// if we don't have any contents specified, assume that this is
			// a derived class that defines its own contents with its own render.
			Super.prototype.render.apply( this, arguments );
		}

		if( this.zIndex ) this.$el.css( 'z-index', this.zIndex );
		else if( this.targetEl.zIndex ) {
			// if no explicit z-index is supplied, make sure we are in front of
			// our target (being mindful over browser support).

			var popupZIndex = parseInt( this.$el.css( 'z-index' ), 10 );
			if( _.isNaN( popupZIndex ) || popupZIndex <= this.targetEl.zIndex() ) {
				this.$el.css( 'z-index', this.targetEl.zIndex() + 1 );
			}
		}
	},

	close : function() {
		var _this = this;

		if( this.state !== kState_Open ) return;

		this.$el.unbind( 'clickoutside' );
		this._setState( kState_Closing );

		this.spawn( 'closing' );

		setTimeout( function() {
			if( _this.state === kState_Closing ) {
				_this.remove();
				mOpenPopups = _.without( mOpenPopups, _this );
				_this.spawn( 'closed' );
			}
		}, kFadeTime );

		if( _.isFunction( this.onClose ) ) this.onClose.apply( this, arguments );
	},
 
	reposition : function( allowedPositions, tryAgainIfDimentionsChange ) {
		if( _.isUndefined( allowedPositions ) ) {
			allowedPositions = _.isArray( this.position ) ? _.clone( this.position ) : [ this.position ];
			allowedPositions = _.union( allowedPositions, kPositions );
		}

		if( _.isUndefined( tryAgainIfDimentionsChange ) ) tryAgainIfDimentionsChange = true;

		var targetWidth = Math.round( this.targetEl.outerWidth() );
		var targetHeight = Math.round( this.targetEl.outerHeight() );

		var popupWidth  = Math.round( this.$el.outerWidth() );
		var popupHeight = Math.round( this.$el.outerHeight() );

		var kPointerHeight = 10;
		var kPopupMargin = 10;
		var kPointerInsetForSidePositions = 18;

		var offsetParent = $( window );
		var parentWidth = Math.round( offsetParent.outerWidth() );
		var parentHeight = Math.round( offsetParent.outerHeight() );

		var distanceAway = this.distanceAway;

		var targetOffset = this.targetEl.offset();
		var pointerOffset = this.pointerOffset;

		var cssPositionProps;

		var firstPositionTried;
		var currentPositionBeingTried = firstPositionTried = _.first( allowedPositions );
		var haveTriedOtherPositions = false;
		var amountOutsideOfBoundingRectByPosition = {};
		var allPositionsAreOutOfBounds = false;
		var done = false;

		do {  // run through all our different positions to find one that works
			if( ! _.contains( kPositions, currentPositionBeingTried ) ) {
				throw new Error( 'Invalid position for popup: ' + currentPositionBeingTried );
			}

			switch( currentPositionBeingTried ) {
				case 'bottom center':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ) - kPopupMargin,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'top center':
					cssPositionProps = {
						bottom : 'auto',
						left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ) - kPopupMargin,
						top : targetOffset.top - popupHeight - kPointerHeight - kPopupMargin - distanceAway,
						right : 'auto'
					};
					break;
				case 'right center':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + ( targetHeight / 2 ) - ( popupHeight / 2 ) + pointerOffset ) - kPopupMargin,
						left : targetOffset.left + targetWidth + distanceAway,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'left center':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + ( targetHeight / 2 ) - ( popupHeight / 2 ) + pointerOffset ) - kPopupMargin,
						right : parentWidth - targetOffset.left + distanceAway,
						left : 'auto',
						bottom : 'auto'
					};
					break;
				case 'bottom center-right':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						left : Math.round( targetOffset.left + targetWidth / 2 ) - kPopupMargin - kPointerInsetForSidePositions + pointerOffset,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'bottom center-left':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						left : 'auto',
						right : parentWidth - Math.round( targetOffset.left + targetWidth / 2 ) - kPopupMargin - kPointerInsetForSidePositions + pointerOffset,
						bottom : 'auto'
					};
					break;
				case 'top center-right':
					cssPositionProps = {
						top : targetOffset.top - popupHeight - kPointerHeight - kPopupMargin - distanceAway,
						left : Math.round( targetOffset.left + targetWidth / 2 ) - kPopupMargin - kPointerInsetForSidePositions + pointerOffset,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'top center-left':
					cssPositionProps = {
						top : targetOffset.top - popupHeight - kPointerHeight - kPopupMargin - distanceAway,
						left : 'auto',
						right : parentWidth - Math.round( targetOffset.left + targetWidth / 2 ) - kPopupMargin - kPointerInsetForSidePositions + pointerOffset,
						bottom : 'auto'
					};
					break;
				case 'bottom right':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						right : parentWidth - ( targetOffset.left + targetWidth ) + pointerOffset - kPopupMargin,
						bottom : 'auto',
						left : 'auto'
					};
					break;
				case 'bottom left':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway,
						left : targetOffset.left + pointerOffset - kPopupMargin,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'top right':
					cssPositionProps = {
						top : targetOffset.top - popupHeight - kPointerHeight - kPopupMargin - distanceAway,
						bottom : 'auto',
						right : parentWidth - ( targetOffset.left + targetWidth ) + pointerOffset - kPopupMargin,
						left : 'auto'
					};
					break;
				case 'top left':
					cssPositionProps = {
						bottom : 'auto',
						left : targetOffset.left + pointerOffset - kPopupMargin,
						top : targetOffset.top - popupHeight - kPointerHeight - kPopupMargin - distanceAway,
						right : 'auto'
					};
					break;
			}

			// tentatively place on stage
			this.$el
				.css( cssPositionProps )
				.removeClass( 'top left center bottom right center-left center-right' )
				.addClass( currentPositionBeingTried )
			;

			amountOutsideOfBoundingRectByPosition[ currentPositionBeingTried ] = this._amountOutsideOfBoundingRect();
			var cantFitIntoKeepWithinRectInThisPosition = amountOutsideOfBoundingRectByPosition[ currentPositionBeingTried ] !== 0;

			if( cantFitIntoKeepWithinRectInThisPosition ) {
				if( currentPositionBeingTried === firstPositionTried && haveTriedOtherPositions ) {
					// if we have tried all the different positions and are now are back at our
					// original 'preferred' position, then, shit, all positions were out of bounds.\
					// just leave the popup in its default position, eventhough it is also out of bounds.

					allPositionsAreOutOfBounds = true;
					done = true;
				} else {
					// Popup is outside bounding rect. try a new position.
					haveTriedOtherPositions = true;
					currentPositionBeingTried = _getNextPositionToTry( currentPositionBeingTried, allowedPositions );
				}
			} else done = true;
		} while( ! done );

		if( popupWidth !== Math.round( this.$el.outerWidth() ) || popupHeight !== Math.round( this.$el.outerHeight() ) ) {
			// there is a fringe case in which positining the popup actually changes its width and / or height.
			// for example, if the popup is placed just a few pixels from the edge of the view port, it might shrink
			// and text will wrap. so we have to check to see if the width or height of the popup has changed since
			// we started this re-positioning process. if so, try repositioning it once at the same position. if that
			// doesn't work, then move on to another position to see if we have better luck.
			if( ! tryAgainIfDimentionsChange ) return false;

			// try one more time, with our new width and height.
			if( ! this.reposition( [ currentPositionBeingTried ], false ) ) {
				// if that doesn't work, then give up on this position
				newAllowedPositions = _.without( allowedPositions, currentPositionBeingTried );
				if( newAllowedPositions.length > 0 ) allPositionsAreOutOfBounds = this.reposition( newAllowedPositions );
			}
		}

		if( allPositionsAreOutOfBounds && allowedPositions.length > 1 ) {
			var bestOfTheBadPositions = _.first( _.sortBy( _.pairs( amountOutsideOfBoundingRectByPosition ), function( thisPosition ) {
				return thisPosition[ 1 ];
			} ) )[ 0 ];

			allPositionsAreOutOfBounds = this.reposition( [ bestOfTheBadPositions ], false )
		}

		return ! allPositionsAreOutOfBounds;
	},

	_onSubviewsRendered : function() {
		if( ! _.isUndefined( this.extraClassName ) ) this.$el.addClass( this.extraClassName );
	},

	_amountOutsideOfBoundingRect : function() {
		var myOffset = this.$el.offset();
		if( ! myOffset ) return false; // hidden elements have undefined offsets, not much we can do

		var myWidth = this.$el.outerWidth();
		var myHeight = this.$el.outerHeight();

		var myRect = {
			top : myOffset.top,
			right : myOffset.left + myWidth,
			bottom : myOffset.top + myHeight,
			left : myOffset.left
		};

		var keepWithinRect = _.result( this, 'keepWithinRect' );

		var horizontalOverlap = Math.max( 0, Math.min( myRect.right, keepWithinRect.right ) - Math.max( myRect.left, keepWithinRect.left ) )
		var veritcalOverlap = Math.max( 0, Math.min( myRect.bottom, keepWithinRect.bottom ) - Math.max( myRect.top, keepWithinRect.top ) );

		var myRectArea = myWidth * myHeight;

		return myRectArea - horizontalOverlap * veritcalOverlap;

		// var amountOutOfBoundsVertically = Math.max( keepWithinRect.top - myRect.top, 0 );
		// amountOutOfBoundsVertically += Math.max( myRect.bottom - keepWithinRect.bottom, 0 );

		// var amountOutOfBoundsHorizontally = Math.max( myRect.right - keepWithinRect.right, 0 );
		// amountOutOfBoundsHorizontally += Math.max( keepWithinRect.left - myRect.left, 0 );

		// return amountOutOfBoundsVertically * amountOutOfBoundsHorizontally;

		// var sidesAreOutOfBounds = {
		// 	top : ( myRect.top < keepWithinRect.top ),
		// 	bottom : ( myRect.bottom > keepWithinRect.bottom ),
		// 	right : ( myRect.right > keepWithinRect.right ),
		// 	left : ( myRect.left < keepWithinRect.left )
		// };

		// return _.contains( sidesAreOutOfBounds, true );
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
			if( view && _.isFunction( view.render ) ) {
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

		if( newState === kState_Open ) this.timeOpened = (new Date()).getTime();
	},

	_setupTargetEl : function() {
		var _this = this;

		this.targetEl = _.isObject( this.target ) && _.isFunction( this.target.render ) ? this.target.$el : this.target;

		this.targetEl.on( 'remove', function() {
			_this.close();
		} );
	}
}, {
	open : function( options ) {
		var popupInstance;

		if( options.signature ) {
			var existingPopupsOfThisSignature = _.filter( mOpenPopups, function( thisPopup ) {
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
		}

		if( ! popupInstance ) {
			popupInstance = new this( options );

			$( 'body' ).append( popupInstance.$el );

			popupInstance.render();
			popupInstance.reposition();
			mOpenPopups.push( popupInstance );
		}

		popupInstance._setState( kState_Open );

		return popupInstance;
	}
} );


$( document ).bind( 'mousedown', function( e ) {
	_.each( mOpenPopups, function( thisPopup ) {
		if( thisPopup.closeOnOutsideClick &&
			thisPopup.state === kState_Open &&
			( new Date() ).getTime() - thisPopup.timeOpened > kMinTimeAfterOpenBeforeCloseOnOutsideClick ) {
			var thisPopupEl = thisPopup.$el.get( 0 );
			if( thisPopupEl !== e.target && ! $.contains( thisPopupEl, e.target ) ) {
				thisPopup.close();
			}
		}
	} );
} );

function _attachWindowEventListeners() {
	$( window ).scroll( function() {
		_.each( mOpenPopups, function( thisPopup ) {
			if( _elementPositionIsFixed( thisPopup.targetEl ) || thisPopup.hasElementFixedChanges ) {
				thisPopup.reposition();
				thisPopup.hasElementFixedChanges = true;
			}
		} );
	} );

	$( window ).resize( function() {
		_.each( mOpenPopups, function( thisPopup ) {
			thisPopup.reposition();
		} );
	} );

};

function _elementPositionIsFixed( ele ) {
	if( ele.prop( 'tagName' ) === 'HTML' ) return false;

	return ( ele.css( 'position' ) !== 'fixed' ) ? _elementPositionIsFixed( ele.offsetParent() ) : true;
};

function _getNextPositionToTry( position, positionsToTry ) {
	positionIndex = _.indexOf( positionsToTry, position );
	if( positionIndex === -1 ) throw new Error( 'Could not find position "' + position + '" in the allowed positions.' );

	return positionIndex === positionsToTry.length - 1 ? positionsToTry[ 0 ] : positionsToTry[ positionIndex + 1 ];
}

// return UMD
return Backbone.ModuiPopup;

} ) );