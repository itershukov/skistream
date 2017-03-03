var express = require('express')
    ,path = require('path')
    // , favicon = require('serve-favicon')
    // ,logger = require('morgan')
    // ,cookieParser = require('cookie-parser')
    // ,bodyParser = require('body-parser')
    ,app = express()
    // ,debug = require('debug')('skistream:server')
    ,http = require('http')
    ,SerialPort = require('serialport')
    ,WebSocket = require('ws')
    ,serveStatic    = require('serve-static')
    ,port = 3000
    ,portAndClients = {}

var server = http.createServer(app)
server.listen(port);

app.use("/public", serveStatic(path.join(__dirname, '/public/')));
app.use("/static", serveStatic(path.join(__dirname, '/static/')));

// // view engine setup
app.get('/', function(req, res, next){
  res.sendFile(path.join(__dirname, './public/index.html'))
});


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

const wss = new WebSocket.Server({ port: 19003 });

wss.on('connection', function(ws) {
  console.log('Connection opened (WS)')
    ws.on('message', function (msg) {
        console.log('Message received (WS) ' + msg);
        try {
          let data = JSON.parse(msg);
          if (data.type === 'PORT') connectToWSerial(data.payload, ws);
        } catch (e){
          console.log('Error in on message (WS) ' + e.text)
        }
    });

    ws.on('close', function () {
        portAndClients[port] && portAndClients[port].forEach((client, index) => {
          if (client == ws) portAndClients[port].splice(index, 1)
        });
        console.log('Connection closed (WS) ');
    });

    ws.on('error', function(e){
        console.log('Error in connection (WS) ' + e);
    })
});


// wss.broadcast = function broadcast(data) {
//     wss.clients.forEach(function each(client) {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(data);
//         }
//     });
// };

function connectToWSerial(port, ws) {

  if (portAndClients[port]) {
      portAndClients[port].push(ws);
      return;
  }

    portAndClients[port] = [];

    var serial = new SerialPort(port, {
        parser: SerialPort.parsers.readline('#13')
    });

    serial.on('open', ()=>{
        console.log("COM post opened");
        portAndClients[port].push(ws);
        sendDataByPort(port,{type: 'OPEN', payload: "COM port opened"});
    });

    serial.on('data', (data)=>{
        console.log("COM data received " + data.length);
        console.log(data);
        sendDataByPort(port, {type: 'DATA', payload: data});
    });

    serial.on('close', ()=>{
        console.log("COM port closed");
        sendDataByPort(port, {type: 'CLOSE', payload: "COM port closed"});
    });

    serial.on('error', (e)=>{
        console.log(`COM post err: ${JSON.stringify(e)}`);
        sendDataByPort(port, {type: 'ERROR', payload: `COM port err: ${e}`});
        delete portAndClients[port]
    });

    serial.on('disconnect', ()=>{
        console.log("COM post disconnected");
        sendDataByPort(port, {type: 'DISCONNECT', payload: 'COM port disconnected'});
    });
};

const sendDataByPort = (port, data)=>{
  portAndClients[port].forEach((ws)=>{
    ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(data));
  });
};

