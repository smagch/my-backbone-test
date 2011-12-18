
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  ;

var app = module.exports = express.createServer();

mongoose.connect('mongodb://localhost/hoge');

// Configuration
var TagSchema = new Schema({
    name : { type : String, required : true }
});

// var PostSchema = new Schema({
//     title : { type : String, required : true}
//   , date : { type : Date, default : Date.now }
//   , tags : [ String ]
// });


var Tag = mongoose.model('Tag', TagSchema);

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

app.get('/', loadTags, function(req, res){
  res.render('index', {
    title: 'index'  
  });
});

function loadTags (req, res, next) {
  Tag.find({}, function (err, docs) {
     req.tags = docs || {};
     next();
   });  
}

app.get('/tags', loadTags, function (req, res) {
  console.log('JSON.stringify(req.tags) : ' + JSON.stringify(req.tags));  
  res.json( req.tags );
});

app.post('/tags', function (req, res) {
    console.log('new tag');
    console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));        
    var tag = new Tag(req.body);
    tag.save(function (err, doc) {
        if(err) {
            res.json('error has occured', 500);
        } else {
            console.log('tag._id : ' + tag._id);            
            res.json({ _id : tag._id }, 200);
        }
    });
});

app.delete('/tags/:id', function (req, res) {
    console.log('delete');
    var id = req.params.id;
    console.log('id : ' + id);    
    Tag.findById(id, function (err, doc) {
        if(err || !doc) {
            console.log('error');
            res.json('error has been occur ', 500);          
        } else {
            doc.remove(function () {});
            console.log('success');
            res.json(200);
        }
    });
});

app.put('/tags/:id', function (req, res) {
  var id = req.params.id;
  console.log('id : ' + id); 
  var name = req.body.name;
  console.log('name : ' + name);
   
  Tag.findById(id, function (err, doc) {
    if(err || !doc) {
      res.json(500);
    } else {
      doc.name = name;
      doc.save();
      res.json(doc._id, 200);
    }
  });
});



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
