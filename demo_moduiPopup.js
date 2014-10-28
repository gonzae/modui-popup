var $ = require( 'jquery' );
require('jquery-ui/resizable');
var _ = require( 'underscore' );

var ModuiPopup = require( './lib/moduiPopup' );
var BaseView = require( 'modui-base' );
var Backbone = require( 'backbone' );

Backbone.$ = $;

var kFadeTime = 70; // keep in sync with kFadeTime in main file

var ExampleTwoModel = Backbone.Model.extend({});
var exampleTwoModel = new ExampleTwoModel({ text: '' });

var ExampleTwoView = Backbone.View.extend({
  initialize: function(){
    this.model = exampleTwoModel;
    this.render();
  },
  render: function(){
    var template = _.template( $("#example_2_template").html(), {} );
    this.$el.html( template(this.model.toJSON()) );
  },
	events: {
		"keyup #example_2--input" : "textChanged",
	},
	textChanged: function(){
		var newText = $('#example_2--input').val();
		this.model.set('text', newText);
		this.render();
		$('#example_2--input').val(newText).focus();
	}
});

var MainView = Backbone.View.extend({
	initialize: function(){
		this.render();
	},
	render: function(){
		var template = _.template( $("#main_template").html(), {});
		this.$el.html( template() );
	},
	events: {
		"focus #example_1--trigger": "exampleOneTrigger",
		"click #example_2--trigger": "exampleTwoTrigger",
		"click .e3-radio": "exampleThreeTrigger",
		"click .ui-resizable-handle": "exampleFourTrigger"
	},
	exampleOneTrigger: function(){
		ModuiPopup.open({
			target : $("#example_1--trigger"),
			position : 'top center',
			contents : 'Woah! You actually clicked it!'
		});
	},
	exampleTwoTrigger: function(){
		var exampleTwoView = new ExampleTwoView({ el: $("#example_2--popup") });
		ModuiPopup.open( {
			target : $("#example_2--demo"),
			position : 'right center',
			contents : exampleTwoView
		} );
		exampleTwoView.render();
	},
	example3Contents: "I'm here!",
	exampleThreeTrigger: function(){
		var position = $('input[name="example_3--radio"]:checked').val();
		ModuiPopup.open( {
			target : $("#example_3--demo"),
			position : position,
			contents : this.example3Contents
		} );
		var rando = Math.random();
		switch (true){
			case (rando < .2): this.example3Contents = "Haha! Now I'm here!"; break;
			case (rando < .4): this.example3Contents = "Suprise! I'm here now!"; break;
			case (rando < .6): this.example3Contents = "I'm here!"; break;
			case (rando < .8): this.example3Contents = "No, I'm over here!"; break;
			default: this.example3Contents = "Look out! I'm here!"; break;
		}
	},
	exampleFourTrigger:	function(){
		ModuiPopup.open({
			target : $(".example_4--outer"),
			position : 'right center',
			contents : 'Watch me dance!'
		});
	}
});

var mainView = new MainView({ el: $("#main") });;

$("#example_4--demo").resizable();