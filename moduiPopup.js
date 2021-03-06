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
	'bottom center right',
	'bottom center left',
	'top center right',
	'top center left',
	'bottom left',
	'bottom right',
	'top left',
	'top right',
	'right top',
	'right bottom',
	'left top',
	'left bottom'
];

var kPositionClasses = _.map( kPositions, function( thisPosition ) {
	return thisPosition.replace( /\ /g, '-' );
} );

var mWindowEventListenersAttached = false;

Backbone.ModuiPopup = Super.extend( {
	options : [
		'target!',
		'contents',
		{ position : 'bottom center' },
		{ strictPositioning : false },
		{ distanceAway : 12 }, // margin / pointer is 10 pixels. With this default the tip of the pointer ends up 2 pixels from target
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
		{ 'extraClassName' : '' }, // appended to regular class names to facilitate styling
		{ 'kPointerHeight' : 10 }
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

		if( ! _.isUndefined( this.zIndex ) ) this.$el.css( 'z-index', this.zIndex );
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
		var _this = this;

		if( _.isUndefined( allowedPositions ) ) {
			allowedPositions = [];
			if( this.currentPosition && this.state === 'open' ) allowedPositions.push( this.currentPosition );

			if( _.isArray( this.position ) ) allowedPositions = allowedPositions.concat( this.position )
			else allowedPositions.push( this.position );

			if( ! this.strictPositioning ) allowedPositions = _.union( allowedPositions, kPositions );
		}

		allowedPositions = _.unique( allowedPositions );

		if( _.isUndefined( tryAgainIfDimentionsChange ) ) tryAgainIfDimentionsChange = true;

		var targetWidth = Math.round( this.targetEl.outerWidth() );
		var targetHeight = Math.round( this.targetEl.outerHeight() );

		var popupWidth  = Math.round( this.$el.outerWidth() );
		var popupHeight = Math.round( this.$el.outerHeight() );
		var popupMargin = Math.round( ( this.$el.outerWidth( true ) - this.$el.outerWidth() ) / 2 ); // later we assume vertical is the same as this horizontal margin

		var kPointerHeight = this.kPointerHeight;
		var pointerInsetForSidePositions = Math.round( kPointerHeight + kPointerHeight * .66 );

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
		var degreeOfUndesirabilityByPosition = {};
		var allPositionsAreOutOfBounds = false;
		var done = false;

		do {  // run through all our different positions to find one that works
			if( ! _.contains( kPositions, currentPositionBeingTried ) ) {
				throw new Error( 'Invalid position for popup: ' + currentPositionBeingTried );
			}

			switch( currentPositionBeingTried ) {
				case 'bottom center':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway - popupMargin,
						left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ) - popupMargin,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'top center':
					cssPositionProps = {
						bottom : 'auto',
						left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ) - popupMargin,
						top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
						right : 'auto'
					};
					break;
				case 'right top':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + pointerOffset ) - popupMargin,
						left : targetOffset.left + targetWidth + distanceAway - popupMargin,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'right bottom':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + targetHeight + pointerOffset ) - popupMargin,
						left : targetOffset.left + targetWidth + distanceAway - popupMargin,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'right center':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + ( targetHeight / 2 ) - ( popupHeight / 2 ) + pointerOffset ) - popupMargin,
						left : targetOffset.left + targetWidth + distanceAway - popupMargin,
						bottom : 'auto',
						right : 'auto'
					};
					break;
				case 'left top':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + pointerOffset ) - popupMargin,
						right : parentWidth - targetOffset.left + distanceAway - popupMargin,
						left : 'auto',
						bottom : 'auto'
					};
					break;
				case 'left bottom':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + targetHeight + pointerOffset ) - popupMargin,
						right : parentWidth - targetOffset.left + distanceAway - popupMargin,
						left : 'auto',
						bottom : 'auto'
					};
					break;
				case 'left center':
					cssPositionProps = {
						top	: Math.round( targetOffset.top + ( targetHeight / 2 ) - ( popupHeight / 2 ) + pointerOffset ) - popupMargin,
						right : parentWidth - targetOffset.left + distanceAway - popupMargin,
						left : 'auto',
						bottom : 'auto'
					};
					break;
				case 'bottom center right':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway - popupMargin,
						left : Math.round( targetOffset.left + targetWidth / 2 ) - popupMargin - pointerInsetForSidePositions + pointerOffset,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'bottom center left':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway - popupMargin,
						left : 'auto',
						right : parentWidth - Math.round( targetOffset.left + targetWidth / 2 ) - popupMargin - pointerInsetForSidePositions + pointerOffset,
						bottom : 'auto'
					};
					break;
				case 'top center right':
					cssPositionProps = {
						top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
						left : Math.round( targetOffset.left + targetWidth / 2 ) - popupMargin - pointerInsetForSidePositions + pointerOffset,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'top center left':
					cssPositionProps = {
						top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
						left : 'auto',
						right : parentWidth - Math.round( targetOffset.left + targetWidth / 2 ) - popupMargin - pointerInsetForSidePositions + pointerOffset,
						bottom : 'auto'
					};
					break;
				case 'bottom right':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway - popupMargin,
						right : parentWidth - ( targetOffset.left + targetWidth ) + pointerOffset - popupMargin,
						bottom : 'auto',
						left : 'auto'
					};
					break;
				case 'bottom left':
					cssPositionProps = {
						top	: targetOffset.top + targetHeight + distanceAway - popupMargin,
						left : targetOffset.left + pointerOffset - popupMargin,
						right : 'auto',
						bottom : 'auto'
					};
					break;
				case 'top right':
					cssPositionProps = {
						top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
						bottom : 'auto',
						right : parentWidth - ( targetOffset.left + targetWidth ) + pointerOffset - popupMargin,
						left : 'auto'
					};
					break;
				case 'top left':
					cssPositionProps = {
						bottom : 'auto',
						left : targetOffset.left + pointerOffset - popupMargin,
						top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
						right : 'auto'
					};
					break;
			}

			this.$el
				.css( cssPositionProps )
				.removeClass( 'top left bottom right' )
				.removeClass( kPositionClasses.join( ' ' ) )
				.addClass( currentPositionBeingTried.split( ' ' )[ 0 ] )
				.addClass( currentPositionBeingTried.replace( /\ /g, '-' ) )
			;

			degreeOfUndesirabilityByPosition[ currentPositionBeingTried ] = this._getDegreeOfUndesirabilityOfCurrentPosition();
			var cantFitIntoKeepWithinRectInThisPosition = degreeOfUndesirabilityByPosition[ currentPositionBeingTried ] !== 0;

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


		if( allPositionsAreOutOfBounds && allowedPositions.length > 1 ) {
			var bestOfTheBadPositions = _.first( _.sortBy( _.pairs( degreeOfUndesirabilityByPosition ), function( thisPosition ) {
				// if the current position and another position are tied, give preference to the current position
				return thisPosition[ 1 ] + ( thisPosition[ 0 ] === _this.currentPosition && _this.state === 'open' ? -1 : 0 );
			} ) )[ 0 ];

			allPositionsAreOutOfBounds = this.reposition( [ bestOfTheBadPositions ] )
		}

		if( popupWidth !== Math.round( this.$el.outerWidth() ) || popupHeight !== Math.round( this.$el.outerHeight() ) ) {
			// there is a fringe case in which positining the popup actually changes its width and / or height.
			// for example, if the popup is placed just a few pixels from the edge of the view port, it might shrink
			// and text will wrap. so we have to check to see if the width or height of the popup has changed since
			// we started this re-positioning process. if so, try repositioning it once at the same position. if that
			// doesn't work, then move on to another position to see if we have better luck.
			if( ! tryAgainIfDimentionsChange ) return false;

			allPositionsAreOutOfBounds = this.reposition( [ currentPositionBeingTried ], false );

			// try one more time, with our new width and height.
			// if( ! this.reposition( [ currentPositionBeingTried ], false ) ) {
			// 	// if that doesn't work, then give up on this position
			// 	newAllowedPositions = _.without( allowedPositions, currentPositionBeingTried );
			// 	if( newAllowedPositions.length > 0 ) allPositionsAreOutOfBounds = this.reposition( newAllowedPositions );
			// }
		}

		this.currentPosition = currentPositionBeingTried;

		return ! allPositionsAreOutOfBounds;
	},

	_onSubviewsRendered : function() {
		if( ! _.isUndefined( this.extraClassName ) ) this.$el.addClass( this.extraClassName );
	},

	_getDegreeOfUndesirabilityOfCurrentPosition : function() {
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

		var amountOutsideBoundingRect = myRectArea - horizontalOverlap * veritcalOverlap;

		var documentRect = {
			top : 0,
			left : 0,
			right : $( document ).width(),
			bottom : $( document ).height()
		};

		horizontalOverlap = Math.max( 0, Math.min( myRect.right, documentRect.right ) - Math.max( myRect.left, documentRect.left ) )
		veritcalOverlap = Math.max( 0, Math.min( myRect.bottom, documentRect.bottom ) - Math.max( myRect.top, documentRect.top ) );
		
		var amountOutsideDocument = myRectArea - horizontalOverlap * veritcalOverlap;
		
		return Math.max( Math.round( amountOutsideBoundingRect + amountOutsideDocument * 10 ), 0 );
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
			thisPopup.reposition();
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