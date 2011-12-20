require.config({
    'baseUrl' : '/javascripts'
  , 'paths' : {
        'jQuery' : 'libs/jquery/main'
       //'jquery' : 'libs/jquery/jquery-1.7.1'
      , 'underscore' : 'libs/underscore/underscore-min'
      , 'backbone' : 'libs/backbone/main'
    }    
});

define([
    'jQuery'   
  , 'underscore'
  , 'backbone'  
  ], function($, _, Backbone){
  'use strict';      
//  console.log('$ : ' + $);
//  console.log('_ : ' + _);
  
  
  //return;
  var Tag = Backbone.Model.extend({
      // defaults : {
      //           hoge : 'hogehoge'
      //       }
      initialize : function () {
          this.set({
              tags : []
          });
      }
    , url : '/tags'    
    , pushTag : function (tag) {
          //var model = this.get('tags');
          //model.push(tag);
          ///this.set({tags : model});
          this.get('tags').push(tag);
          this.trigger('change');
      }
    , resetTags : function (tags) {
          var currentTags = this.get('tags');
          _.each(tags, function(tag, index) { 
              console.log('index : ' + index);              
              currentTags[index] = tag;
          });
          this.trigger('change');
      }
    //     , removeByIndex : function (index) {
    //           this.get('tags').splice(index, 1);
    //           this.trigger('change');
    //       }   
  });
  
  // window.TagList = Backbone.Collection.extend({
  //     model : Tag
  //   , url : '/tags'
  // });
  // 
  // window.Tags = new TagList();
  var Tags = new Tag();
  
  var TagView = Backbone.View.extend({
    //  tagName : 'li' 
      el : $('#tag-list')        
    , template : _.template('<% _.each(tags, function(tag) { %><li class="tag-item"><div class="tag-display"><%= tag %></div><input class="tag-input" value="<%= tag %>"></input><span class="tag-delete"></span></li><%});%>')//_.template($('#tag-template').html())    
    , events : {
          'click .tag-delete' : 'clear'
      }
    , initialize : function () {
          console.log('tag view initialize');
          this.model.bind('change', this.render, this);
          //this.model.bind('destroy', this.remove, this);      
      }
    , pushItem : function (tag) {
          this.model.get('tags').push(tag);
      }
    , removeItemByIndex : function (index) {                    
          console.log('index : ' + index);                              
          this.model.get('tags').splice(index, 1);
      }
    , render : function () {
          console.log('tagView render');
        //  console.log('JSON.stringify(this.model) : ' + JSON.stringify(this.model));
          //console.log('JSON.stringify(this.model.toJSON()) : ' + JSON.stringify(this.model.toJSON()));
          
          //$(this.el).html(this.template(this.model.toJSON()));
          var model = { tags : this.model.get('tags') };
          $(this.el).html(this.template(model));                    
          return this;
      }
    // , remove : function () {
    //           console.log('remove');
    //           $(this.el).remove();
    //     }
    , clear : function () {
          // console.log('clear');
          //           if(this.model) {
          //               this.model.destroy();
          //           }
          
      }        
  });
  
  window.ContentModel = Backbone.Model.extend({
      default : {
          title : 'hogeTitle'
        , position : -1
        , content : 'hogeContent'
      }
  });
  window.ContentCollection = Backbone.Collection.extend({
      model : ContentModel
    , comparator : function (contentModel) {
        return contentModel.get('position');
      }    
  });
  

  
  
  window.ContentView = Backbone.View.extend({
      el : $('#content')
    , template : _.template($('#template').html())
    , menuEl : $('#menu')
    , menuTemplate : _.template($('#template-menu').html())
    , events : {
        //'change' : 'render'
    }
    , initialize : function () {
          console.log('content initialize');
          this._position = 1;
          this.model.bind('change', this.render, this);
          
          var menuModel = this.model.map(function (m) {
              return { 
                  title : m.get('title')
                , position : m.get('position')
              };
          });
          this.menuEl.html(this.menuTemplate({ models : menuModel}));
      }
    , setPosition : function(pos) {
          this._position = pos;
          this.model.trigger('change');
      }
    , render : function () {
          console.log('content render');
          var currentModel = this.model.at(this._position-1).toJSON();
          this.el.html(this.template(currentModel));
          return this;
      }
  });
  

  
  var AppView = Backbone.View.extend({
      el : $('#wrapper')
    , editButton : $('#tag-edit-button')
    , createButton : $('#tag-create-button')
    , tagList : $('#tag-list')
    , tagView : null
    , contentView : null
    , events : {
          'click #tag-edit-button' : 'toggleEdit'
        , 'click #tag-create-button' : 'createTag'
      }
    , initialize : function () {
          console.log('initalize wrapper');
          //Tags.bind('add', this.addOne, this);
          this.tagView = new TagView({model : Tags});
          $('#tag-list').append(this.tagView);
          Tags.bind('reset', this.addAll, this);
          Tags.bind('change', this.save, this);
          Tags.fetch();
          //this.contentView = new ContentView({model : })
          var self = this;
          $.ajax({
              url : '/javascripts/content.js'
            , dataType : 'json'
            , data : { }
            , async : false
            , success : function (data) {
                  console.log('success');
                  var contents = new ContentCollection(data);
                  self.contentView = new ContentView({model : contents});
                  self.contentView.setPosition(1);
                  //backbone.history.loadUrl();
              }
            , error : function (err) {
                  console.log('JSON.stringify(err) : ' + JSON.stringify(err));                  
              }
          });
      }
    , render : function () {
          console.log('render wrapper');
      }
    , toggleEdit : function () {
          console.log('toggleEdit');
          if( this.isEditing() ) {
              this.editButton.text('edit tag');
              this.el.removeClass('editing');
              this.updateTags();              
          } else {
              this.editButton.text('save');
              this.el.addClass('editing');              
          }
      }
    , isEditing : function () {
          return this.el.hasClass('editing');
      }
    , createTag : function () {
          //var tag = new Tag();
          //Tags.add(tag);
          Tags.pushTag('new tag');
      }
    , updateTags : function () {      
          var model = $('.tag-item').map(function(index){
              return $(this).children('input').val();
          });    
          Tags.resetTags(model);
          Tags.save(); 
      }
    , save : function () {
          
      }
  }); 
  
  
  window.App = new AppView();
  var TestRouter = Backbone.Router.extend({
      routes: {
          'info/:index' : 'showInfo'
       // , 'home' : 
      }
    , initialize : function () {
          console.log('initialize');
         
      }
    , showInfo : function (index) {
          console.log('showInfo' + index);
          App.contentView.setPosition(index);
      }
    , home : function () {
          console.log('home');
      }
    , about : function () {
          console.log('about');
      }
    , contact : function () {
          console.log('contact');
      }
  });
  
  window.testRouter = new TestRouter();
  Backbone.history.start();

  
});

