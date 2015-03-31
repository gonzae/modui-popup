( function( root, factory ) {
	// UMD wrapper
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( [ 'underscore', 'backbone', 'jquery' ], factory );
	} else if ( typeof exports !== 'undefined' ) {
		// Node/CommonJS
		module.exports = factory( require('underscore' ), require( 'backbone' ), require( 'backbone' ).$ );
	} else {
		// Browser globals
		factory( root._, root.Backbone, ( root.jQuery || root.Zepto || root.$ ) );
	}
}( this, function( _, Backbone, $ ) {

	var Super = require( 'modui-base' );
	var Backbone = require( 'backbone' );
	var _ = require( 'underscore' );
	var $ = require( 'jquery' );

	var lastPossibleViewElement = $( 'body' )[ 0 ];
	var mOpenPopups = [];

	var kState_Closed = 'closed';
	var kState_Open = 'open';
	var kState_Closing = 'closing';

	var kFadeTime = 100;

	//module.exports = Super.extend( {
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
			'signature'
		],

		passMessages : { '*' : '.' }, // pass all courier messages directly through to parent view

		className : 'modui-popup',

		initialize : function() {
			var _this = this;

			this._setupTargetEl();

			this._setState( kState_Closed );

			if( this.$el.zIndex ) { this.$el.zIndex( this.targetEl.zIndex() + 1 ); }

			// if( this.closeOnOutsideClick ) {
			// 	setTimeout( function() {
			// 		// in case this popup is triggered by a click, we need to wait
			// 		// until the next event loop before we bind the outside click
			// 		// event to closing the popup. otherwise would close right away
			// 		_this.$el.bind( 'clickoutside', function( e ) {
			// 			// we do not close the popup if the clicked element is within the original
			// 			// target element that this popup is pointing at (or IS that element)
			// 			if( e.target !== _this.targetEl.get( 0 ) && ! $.contains( _this.targetEl.get( 0 ), e.target ) ) {
			// 				_this.close();
			// 			}
			// 		} );
			// 	} );
			// }
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
		},

		close : function( callback ) {
			var _this = this;

			if( this.state !== kState_Open ) return;

			this.$el.unbind( 'clickoutside' );
			this._setState( kState_Closing );

			setTimeout( function() {
				if( _this.state === kState_Closing ) {
					_this.remove();
					mOpenPopups = _.without( mOpenPopups, _this );
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
			var kPointerHeight = 10;

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
							bottom : 'auto',
							left : targetOffset.left + pointerOffset,
							top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
							right : 'auto'
						};
						break;
					case 'top center':
						cssPositionProps = {
							bottom : 'auto',
							left : Math.round( targetOffset.left + ( targetWidth / 2 ) - ( popupWidth / 2 ) + pointerOffset ),
							top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
							right : 'auto'
						};
						break;
					case 'top right':
						cssPositionProps = {
							top : targetOffset.top - popupHeight - kPointerHeight - distanceAway,
							bottom : 'auto',
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
				} else done = true;
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
		},

		_setupTargetEl : function() {
			var _this = this;

			this.targetEl = _.isObject( this.target ) && _.isFunction( this.target.render ) ? this.target.$el : $( this.target );

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

	$( window ).resize( function() {
		_.each( mOpenPopups, function( thisPopup ) {
			thisPopup.reposition();
		} );
	} );

	$( document ).bind( 'mousedown', function( e ) {
		_.each( mOpenPopups, function( thisPopup ) {
			if( thisPopup.closeOnOutsideClick && thisPopup.state === kState_Open ) {
				var thisPopupEl = thisPopup.$el.get( 0 );
				if( thisPopupEl !== e.target && ! $.contains( thisPopupEl, e.target ) ) {
					thisPopup.close();
				}
			}
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

	// return UMD
	return Backbone.ModuiPopup;

} ) );