define(['backbone'], function (Backbone) {
    return Backbone.Model.extend({      
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
    });
});