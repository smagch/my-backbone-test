$(function(){
  'use strict';
  window.Tag = Backbone.Model.extend({
      defaults : {
          name : 'new name'
      }
  });
  
  window.TagList = Backbone.Collection.extend({
      model : Tag
    , url : '/tags'
  });
  
  window.Tags = new TagList();
  
  window.TagView = Backbone.View.extend({
      tagName : 'li' 
    , className : 'tag-item'
    , template : _.template('<div class="tag-display"><%= name %></div><input class="tag-input" value="<%= name %>"></input><span class="tag-delete"></span>')//_.template($('#tag-template').html())
    , events : {
          'click .tag-delete' : 'clear'
      }
    , initialize : function () {
          this.model.bind('change', this.render, this);
          this.model.bind('destroy', this.remove, this);      
      }
    , render : function () {
          console.log('tagView render');
          console.log('JSON.stringify(this.model) : ' + JSON.stringify(this.model));
          $(this.el).html(this.template(this.model.toJSON()));
          var id = this.model.get('_id');
          if(id) {
              this.model.id = this.el.id = id;
          } else {
              this.el.id = this.model.cid;
              //$(this.el).children('input').focus();
          }                    
          return this;
      }
    , remove : function () {
          console.log('remove');
          $(this.el).remove();
    }
    , clear : function () {
          console.log('clear');
          if(this.model) {
              this.model.destroy();
          }
          
      }        
  });
  

  
  window.AppView = Backbone.View.extend({
      el : $('#wrapper')
    , editButton : $('#tag-edit-button')
    , createButton : $('#tag-create-button')
    , tagList : $('#tag-list')
    , events : {
          'click #tag-edit-button' : 'toggleEdit'
        , 'click #tag-create-button' : 'createTag'
      }
    , initialize : function () {
          console.log('initalize wrapper');
          Tags.bind('add', this.addOne, this);
          Tags.bind('reset', this.addAll, this);
          Tags.bind('change', this.save, this);
          Tags.fetch();         
      }
    , render : function () {
          console.log('render wrapper');
      }
    , addOne : function (model) {
          console.log('addOne');
          var tagView = new TagView({model:model});
          $('#tag-list').append(tagView.render().el);                                        
      }
    , addAll : function () {          
          console.log('addAll');
          Tags.each(this.addOne);
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
          var tag = new Tag();
          Tags.add(tag);
      }
    , updateTags : function () {
          Tags.forEach(function (tag) {
              var id = tag.id || tag.cid;
              var name = $('#' + id + ' input').val();
              console.log('name : ' + name);
              if(tag.get('name') !== name) {
                  tag.save({ name : name }, {
                      success : function (e) {
                          console.log('success');
                          console.log('JSON.stringify(e) : ' + JSON.stringify(e));
                          
                      }
                    , error : function (e) {
                          console.log('error');
                          console.log('JSON.stringify(e) : ' + JSON.stringify(e));
                      }
                  });                                    
              }                                          
          });   
      }
    , save : function () {
          
      }
  });  
  window.App = new AppView();
  
});

