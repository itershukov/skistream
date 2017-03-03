var express = require('express')
    ,path = require('path')
    ,app = express()
    ,http = require('http')
    ,SerialPort = require('serialport')
    ,WebSocket = require('ws')
    ,port = 3000
    ,portAndClients = {};

var server = http.createServer(app)
server.listen(port);

// // view engine setup
app.get('/', function(req, res, next){
  res.sendFile(path.join(__dirname, 'index.html'))
});

const wss = new WebSocket.Server({ port: 19003 });

wss.on('connection', function(ws) {
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

