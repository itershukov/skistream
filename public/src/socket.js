/**
 * Created by sinires on 02.03.17.
 */

var socket = new WebSocket(options.socket_address);
var statusElement = document.getElementById("socket-status");

socket.onopen = function() {
    statusElement.innerHTML = "socket open. Send com port name"
};

socket.onclose = function(event) {
};

socket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var str = data.payload;
    switch (data.type){
        case "DATA":{
            statusElement.innerHTML = "Stream is ok";
            superstring = str;
            redrawTable(string2array(str));
            break;
        }
        case "CLOSE":
        case "ERROR":
        case "OPEN":{
            statusElement.innerHTML = str
        }
    }
};

socket.onerror = function(error) {
    statusElement.innerHTML = "socket connection error"
};

function sendComPort() {
    var data = document.getElementById("com-port-param").value,
        param = {"type": "PORT", "payload": data.toUpperCase()};
    socket.send(JSON.stringify(param));
}