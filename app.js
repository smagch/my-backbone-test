(function(){
'use strict';

var ColorModel = Backbone.Model.extend({
	color : 'FF0000',
	urlRoot : '/color'
});
var colorModel = new ColorModel({ color : '000000',  id : 'test' });
	
var PlaneView = Backbone.View.extend({
  	tagName : 'div',
  	className : 'plane',
	// events : {
	// 		'change' : 'render'
	// 	},
	el : document.querySelector('.plane'),
	model : colorModel,
	render : function() {
		console.log('render : ' + this.model.get('color'));
		this.el.style.backgroundColor = '#' + this.model.get('color');
		return this;
	}
});



var InputView = Backbone.View.extend({
	tagName : 'input',
	el : document.querySelector('#color-input'),
	model : colorModel,	
	keyDownHandler : function(e) {
		console.log('key down');
		if(e.keyIdentifier === 'Enter' ) {
			console.log('key enter down');
			this.model.set({ color : this.el.value });
			//console.log('this.model.get("color") : ' + this.model.get("color"));
			this.model.save();
		}
	}
});


//colorModel.bind('change', 
var planeView = new PlaneView();

colorModel.bind('change:color', planeView.render, planeView);


// planeView.bind('click', function(e) {
// 	console.log('plane clicked');
// });
var inputView = new InputView();
inputView.el.addEventListener('keydown', inputView.keyDownHandler.bind(inputView));
$('#fetch-button').bind('click', function(e) {
	console.log('click');
	colorModel.fetch();
	console.log('model.get("color") : ' + colorModel.get("color"));	
});

$('#destroy-button').bind('click', function(e, qq) {
	console.log('destroy clicked');
	colorModel.destroy();
});

})();
