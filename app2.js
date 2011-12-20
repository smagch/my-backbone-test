
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , _ = require('underscore')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  ;

var app = module.exports = express.createServer();

mongoose.connect('mongodb://localhost/hoge');

// Configuration

var LinkSchema = new Schema({
    tags : [ String ]
});

var Link = mongoose.model('Link', LinkSchema);

function compile(str, path) {
  return stylus(str)
    .import(__dirname + '/stylesheets/mixins')
    .set('filename', path)
    .set('warn', true)
    .set('compress', true);
}

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(stylus.middleware({ 
       src: __dirname
     , dest: __dirname + '/public'
     , compile: compile
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'index'  
  });
});

app.get('/tags', loadTags, function (req, res) {
  console.log('JSON.stringify(req.tags) : ' + JSON.stringify(req.tags));  
  res.json( req.tags );
});

function loadTags(req, res, next) {
  console.log('load tags');
  Link.findOne({}, function (err, doc) {
    //console.log('doc.tags.length : ' + doc.tags.length);    
    if(!err || doc) {      
      req.tags = doc;
    } else {
      req.tags = {};
    }        
    next();
  });
}

app.post('/tags', function (req, res) {
    console.log('new tag');
    console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));        
    //var tag = new Tag(req.body);
    var model = req.body;
    if(!model && !model.tags) {
        res.json('error', 500);
        return;
    }
    // NO condition because it's test
    // Link.update({}, { $set : {tags : model} }, {upsert : true}, function (err, docs) {
    //         console.log('JSON.stringify(err) : ' + JSON.stringify(err));
    //         console.log('JSON.stringify(docs) : ' + JSON.stringify(docs));        
    //     });

    
    Link.findOne({}, function (err, doc) {
        
        console.log('JSON.stringify(err) : ' + JSON.stringify(err));
        console.log('JSON.stringify(docs) : ' + JSON.stringify(doc));
        if(err || !doc) {
            doc = new Link({tags : model.tags});
            doc.save(function (err) {
                console.log('JSON.stringify(err) : ' + JSON.stringify(err));
                res.json('ok', 200);
            });
            return;
        }
        
        var toRemove = _.difference( doc.tags, model.tags);
        var toAdd = _.difference(model.tags, doc.tags);
        console.log('JSON.stringify(toRemove) : ' + JSON.stringify(toRemove));
        console.log('JSON.stringify(toAdd) : ' + JSON.stringify(toAdd));
        
        Link.update({}, 
            {
                //$addToSet : { $each : { tags : toAdd }}
                $pushAll : { tags : toAdd }
              //, $pullAll : { tags : toRemove }
            }            
          , { upsert : true }
          , function(err, docs){
              console.log('JSON.stringify(err) : ' + JSON.stringify(err));
              console.log('JSON.stringify(docs) : ' + JSON.stringify(docs));
              if(toRemove.length) {
                Link.update({}, {$pullAll : { tags : toRemove }}, null, function(err, docs){
                    console.log('JSON.stringify(err) : ' + JSON.stringify(err));
                    console.log('JSON.stringify(docs) : ' + JSON.stringify(docs));
                    res.json('ok', 200);
                });
              } else {
                  res.json('ok', 200);
              }
       
            }
        );
    });
    //Link.update({}, )
    
    //Link.findOne({}, function (err, doc) {
    
        //console.log('JSON.stringify(doc) : ' + JSON.stringify(doc));            
        // if(!doc) {
        //             doc = new Link({tags : model});
        //         }
        //         model.tags.forEach(function(tag, index) {
        //             console.log('tag : ' + tag);
        //             console.log('index : ' + index);            
        //             doc.tags[index] = tag;
        //         });
        //         
        //         console.log('doc.tags.length : ' + doc.tags.length);
        //         doc.tags.forEach(function (tag) {            
        //             console.log('doc tag : ' + tag);            
        //         });
        //         
        //         
        //         doc.save(function (err, doc2) {
        //            if(err) {
        //              console.log('save error');
        //              res.json('error', 500);
        //            } else {
        //              console.log('save done');
        //              console.log('doc.tags.length : ' + doc2.tags.length);
        //              doc2.tags.forEach(function (tag) {            
        //                  console.log('doc tag : ' + tag);            
        //              });
        //              res.json({_id : doc2._id}, 200);
        //            }
        //         });                                                        
    //});  
});

// app.delete('/tags/:id', function (req, res) {
//     console.log('delete');
//     var id = req.params.id;
//     console.log('id : ' + id);    
//     Tag.findById(id, function (err, doc) {
//         if(err || !doc) {
//             console.log('error');
//             res.json('error has been occur ', 500);          
//         } else {
//             doc.remove(function () {});
//             console.log('success');
//             res.json(200);
//         }
//     });
// });

// app.put('/tags/:id', function (req, res) {
//   var id = req.params.id;
//   console.log('id : ' + id); 
//   var name = req.body.name;
//   console.log('name : ' + name);
//    
//   Tag.findById(id, function (err, doc) {
//     if(err || !doc) {
//       res.json(500);
//     } else {
//       doc.name = name;
//       doc.save();
//       res.json(doc._id, 200);
//     }
//   });
// });



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
