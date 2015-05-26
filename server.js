var express = require('express'),
    stylus = require('stylus'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost/angulardb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'error connecting to the database...'));
db.once('open', function callback(){
    console.log('angular db opened');
});

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
   mongoMessage = messageDoc.message;
});

app.get('/partials/:partialPath', function(request, response) {
    response.render('partials/' + request.params.partialPath);
});

app.get('*', function(request, response) {
	response.render('index', {
        mongoMessage: mongoMessage
    });
});

var port = 3030;
app.listen(port);
console.log('Listening on port ' + port + '...');