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
  window.Tag = Backbone.Model.extend({
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
  window.Tags = new Tag();
  
  window.TagView = Backbone.View.extend({
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
  
  

  
  window.AppView = Backbone.View.extend({
      el : $('#wrapper')
    , editButton : $('#tag-edit-button')
    , createButton : $('#tag-create-button')
    , tagList : $('#tag-list')
    , tagView : null
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
          
      }
    , render : function () {
          console.log('render wrapper');
      }
    // , addOne : function (model) {
    //           console.log('addOne');
    //           //var tagView = new TagView({model:model});
    //           $('#tag-list').append(tagView.render().el);                                        
    //       }
    // , addAll : function () {          
    //          console.log('addAll');
    //          //Tags.each(this.addOne);
    //      }
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
          // var model = this.tagView.model;
          //           console.log('JSON.stringify(model) : ' + JSON.stringify(model));
          //           var tags = model.get('tags');
          //           console.log('tags : ' + tags);
          //           _.each(tags, function (tag) {
          //               console.log('tag : ' + tag);
          //               
          //           });
          var model = $('.tag-item').map(function(index){
              return $(this).children('input').val();
          });
          
          //Tags.updateTags(model)
          //Tags.unset()
          //Tags.set({tags : model});
          //Tags.set({tags : model});
          Tags.resetTags(model);
          Tags.save();
          // Tags.save({ tags : model }, {
          //               success : function (e) {
          //                   console.log('success');
          //                   console.log('JSON.stringify(e) : ' + JSON.stringify(e));
          //               }
          //             , error : function (e) {
          //                   console.log('error');
          //                   console.log('JSON.stringify(e) : ' + JSON.stringify(e));
          //               }
          //           });
          
          
          
          
          
          // Tags.forEach(function (tag) {
          //               var id = tag.id || tag.cid;
          //               var name = $('#' + id + ' input').val();
          //               console.log('name : ' + name);
          //               if(tag.get('name') !== name) {
          //                   tag.save({ name : name }, {
          //                       success : function (e) {
          //                           console.log('success');
          //                           console.log('JSON.stringify(e) : ' + JSON.stringify(e));
          //                           
          //                       }
          //                     , error : function (e) {
          //                           console.log('error');
          //                           console.log('JSON.stringify(e) : ' + JSON.stringify(e));
          //                       }
          //                   });                                    
          //               }                                          
          //           });   
      }
    , save : function () {
          
      }
  });  
  window.App = new AppView();
  
});

