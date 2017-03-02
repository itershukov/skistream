var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var debug = require('debug')('skistream:server'),
    http = require('http'),
    SerialPort = require('serialport'),
    WebSocket = require('ws'),
    port = 3000;

var server = http.createServer(app)
server.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', port);

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/port', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.get('/port', function(req, res, next) {
//     res.render('index', { title: 'Express' });
//     console.log(req)
// });

const wss = new WebSocket.Server({ port: 19003 });

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

(function connectToWSerial() {
    var serial = new SerialPort('COM1', {
        parser: SerialPort.parsers.readline('#13')
    });

    serial.on('open', ()=>{
        console.log("COM post opened")
    });

    serial.on('data', (data)=>{
        console.log("COM data received");
        console.log(data);
        setImmediate(() => wss.broadcast(JSON.stringify(data)))
    });

    serial.on('close', ()=>{
        console.log("COM post closed")
    });

    serial.on('error', (e)=>{
        console.log(`COM post err: ${JSON.stringify(e)}`)
    });

    serial.on('disconnect', ()=>{
        console.log("COM post disconnected")
    });
})();