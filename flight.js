var ndof = require('./ndof');
var pwm = require('./pwm');
var filter = require('./filter');
var bias = require('./bias');

var DELAY = 5;
var interval;
var running = false;
var flight = {};
var tick = 0;
var isMeasureBias = false;
var measureBiasStart = null;
var hasBiasBeenMeasured = false;

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
    filter.filter(ndof);
    loopBias();
    loopThrottle();
    tick++;
}
function loopBias() {
    if (bias.out.measureTicks > 1000) {
        isMeasureBias = false;
    }
    if (isMeasureBias) {
        bias.measure(ndof);
    }
    ndof.gyro.vector.x -= bias.out.gyro.x.bias;
    ndof.gyro.vector.y -= bias.out.gyro.y.bias;
    ndof.gyro.vector.z -= bias.out.gyro.z.bias;

    ndof.acc.vector.x -= bias.out.acc.x.bias;
    ndof.acc.vector.y -= bias.out.acc.y.bias;
    ndof.acc.vector.z -= bias.out.acc.z.bias;

    ndof.mag.vector.x -= bias.out.mag.x.bias;
    ndof.mag.vector.y -= bias.out.mag.y.bias;
    ndof.mag.vector.z -= bias.out.mag.z.bias;
}
var throttle = { left: 0.0, right: 0.0 };
function loopThrottle() {
    // var MIN = 0.1, MAX = 0.25;
    // var ax = ndof.acc.vector.x;
    // axsmacc = axsmacc - axsm[tick%10];
    // axsmacc = axsmacc + ax;
    // axsm[tick%10] = ax;
    // axsmavg = axsmacc/axsm.length;
    // var d = genDelta(axsmavg, 0);
    // rspd = axsmavg < 0 ? rspd + d : rspd - d;
    // lspd = axsmavg > 0 ? lspd + d : lspd - d;
    // if (rspd < MIN) { rspd = MIN }
    // if (lspd < MIN) { lspd = MIN }
    // if (rspd > MAX) { rspd = MAX }
    // if (lspd > MAX) { lspd = MAX }
    // pwm.units.a.setPercent(running ? rspd : 0.0);
    // pwm.units.b.setPercent(running ? lspd : 0.0);

    var test = 0.1;
    // if (ndof.acc.vector.y > 0.3) {
    //     throttle.left = test;
    // } else {
    //     throttle.left = 0.0;
    // }
    // if (ndof.acc.vector.y < -0.3) {
    //     throttle.right = test;
    // } else {
    //     throttle.right = 0.0;
    // }
    throttle.left = test;
    throttle.right = test;
    pwm.units.b.setPercent(running ? throttle.left : 0.0);
    pwm.units.a.setPercent(running ? throttle.right : 0.0);
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
        filter: filter.out,
        isMeasureBias: isMeasureBias,
        bias: bias.out,
        throttle: throttle
    };
};

flight.setState = function(k, v) {
    console.log('setState', k, v);
    if (k === 'throttleDelta') {
        throttleDelta = parseFloat(v);
    }
    if (k === 'isMeasureBias') {
        bias.reset();
        isMeasureBias = true;
    }
    if (k === 'calibrateEsc') {
        if (throttle.left === 1 || throttle.left === 0) {
            throttle.left = throttle.left == 0 ? 1.0 : 0;
            throttle.right = throttle.right == 0 ? 1.0 : 0;
        } else {
            console.log('WARN cannot calibrate ESC when throttle is not 0 or 100%.');
        }
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