var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var express = require('express');
var ws = require('websockets');
var flight = require('./flight');

var app = express();
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});
app.use('/', express.static(__dirname + '/public'));
var apps = app.listen(80, function() { console.log('Server started.'); });

var wss = ws.createServer();
wss.on('connect', function(s) {
    s.on('message', function(m) {
        if (m === 'status') {
            s.send(JSON.stringify(flight.getState()));
        }
        if (m === 'start') {
            flight.start();
            s.send(JSON.stringify(flight.getState()));
        }
        if (m === 'stop') {
            flight.stop();
            s.send(JSON.stringify(flight.getState()));
        }
        if (m.match(/^set\./)) {
            if (m.match(/^set\.flight\.throttleDelta/)) {
                var v = m.match(/[0-9].*/);
                if (v) {
                    flight.setState('throttleDelta', v);
                }
            }
            if (m === 'set.flight.measureBias') {
                flight.setState('isMeasureBias');
            }
            if (m === 'set.flight.calibrateEsc') {
                flight.setState('calibrateEsc');
            }
        }
    })
}).listen(88);

flight.init();

function onExit() {
    console.log('\nSHUTDOWN ' + (new Date()));
    flight.shutdown();
    apps.close();
    wss.close();
}

process.on('exit', onExit);
process.on('SIGINT', function(){ process.exit(2); });
