var ndof = require('./ndof');
var pwm = require('./pwm');

var DELAY = 5;
var interval;
var running = false;
var flight = {};
var throttleDelta = 0.0005;
var lspd = 0.0, rspd = 0.0;
var cnt = 0;
var axsm = [0,0,0,0,0,0,0,0,0,0], axsmavg = 0, axsmacc = 0;

flight.init = function() {
    ndof.init();
    pwm.init();
};

flight.start = function() {
    running = true;
    if (!interval) {
        interval = setInterval(loop, DELAY);
    }
};

flight.stop = function() {
    running = false;
    clearInterval(interval);
    interval = null;
    lspd = 0.0;
    rspd = 0.0;
    pwm.units.a.setPercent(0.0);
    pwm.units.b.setPercent(0.0);
};

function loop() {
    ndof.update();
    loopThrottle();
}
function loopThrottle() {
    var MIN = 0.1, MAX = 0.25;
    var ax = ndof.acc.vector.x;
    axsmacc = axsmacc - axsm[cnt%10];
    axsmacc = axsmacc + ax;
    axsm[cnt%10] = ax;
    axsmavg = axsmacc/axsm.length;
    var d = genDelta(axsmavg, 0);
    rspd = axsmavg < 0 ? rspd + d : rspd - d;
    lspd = axsmavg > 0 ? lspd + d : lspd - d;
    if (rspd < MIN) { rspd = MIN }
    if (lspd < MIN) { lspd = MIN }
    if (rspd > MAX) { rspd = MAX }
    if (lspd > MAX) { lspd = MAX }
    pwm.units.a.setPercent(running ? rspd : 0.0);
    pwm.units.b.setPercent(running ? lspd : 0.0);
    cnt++;
}
function genDelta(ax, target, last) {
    return throttleDelta;
}

flight.getState = function() {
    return {
        running: running,
        ndof: {
            gyro: ndof.gyro,
            acc: ndof.acc,
            mag: ndof.mag,
            temp: ndof.temp
        },
        pwm: {
            a: pwm.units.a.current,
            b: pwm.units.b.current
        },
        lspd: lspd,
        rspd: rspd,
        axsmavg: axsmavg,
        axsm: axsm,
        throttleDelta: throttleDelta
    };
};

flight.setState = function(k, v) {
    console.log('setState', k, v);
    if (k === 'throttleDelta') {
        throttleDelta = parseFloat(v);
    }
};

flight.shutdown = function() {
    flight.stop();
    ndof.shutdown();
    pwm.units.a.setPercent(0.0);
    pwm.units.b.setPercent(0.0);
    pwm.shutdown();
};

module.exports = flight;