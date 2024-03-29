
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
// when user session create or load, if user.lang is not defined, then see if Accept-Language
// when get request
// consider multi language support, how do I implement it???
// consider use github for locale volunteer

// static domain case
// jp.dougazei.com  ... set locale jp
// en.dougazei.com  ... set locale en
// kr.dougazei.com  ... set locale kr
// dougazei.com ... set locale by ( session || header.Accept-Language )

// basically below should support permanent link
// 1. About  === dougazei.com/about/jp, route by app.get('/about*')
// 2. Term os use === dougazei.com/term-of-use/jp
// 3. How to === dougazei.com/how-to/jp

// nls variable is by template


// 1. Posts === dougazei.com/:id
// 2. Ranking === dougazei.com/ranking, query by ajax, store query config in localstorage
// 3. index  === dougazei.com show all language posts, locale is by 
// is not care about locale.
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
  app.use(express.static(__dirname + "/public"));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'htuayreve'}));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  var locale = req.session.locale;
  console.log('locale : ' + locale);  
  if(!locale) {
    console.log('session.locale has not');
    locale = 'root';
  }
  console.log('locale : ' + locale);  
  res.render('index', {
      title: 'index'  
    , url : 'index'
    , locale : locale
  });
});

app.get('index', function (req, res) {
  console.log('index get');
  res.redirect('/');
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

app.get('/i18n/:locale', function (req, res) {    
    var locale = req.params.locale;    
    req.session.locale = locale;
    res.redirect('back');
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
