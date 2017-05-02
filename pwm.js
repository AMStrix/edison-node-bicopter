"use strict";
var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var DEBUG = false;
var PULSE_CENTER = 1500;
var PULSE_RANGE = 500;

var pwm = {};

pwm.units = {
    a: { channel: 0, initPct: 0 },
    b: { channel: 1, initPct: 0 },
    c: { channel: 2 }
};

pwm.setPercent = function(key, fraction) {
    fraction = fraction > 1 ? 1 : fraction;
    fraction = fraction < 0 ? 0 : fraction;
    var s = pwm.units[key];
    s.current = parseInt((PULSE_CENTER - PULSE_RANGE) + (PULSE_RANGE * 2 * fraction), 10);
    //console.log('wet run ch', s.channel + ' -> ' + s.current);
    pwm.pwm.setPulseLength(s.channel, s.current)
};

pwm.initServos = function() {
    Object.keys(pwm.units).forEach(function(k) {
        var s = pwm.units[k];
        s.setPercent = function(fraction) {
            pwm.setPercent(k, fraction);
        };
        s.setPercent(isNumber(s.initPct) ? s.initPct : 0.0);
    });
};

pwm.init = function() {
    if (pwm.pwm) { return; }
    pwm.pwm = new Pca9685Driver({
        i2c: i2cBus.openSync(1),
        address: 0x40,
        frequency: 100,
        debug: DEBUG
    }, function(e) {
        if (e) console.log('[ERROR] pwm.js init()', e);
        else pwm.initServos();
    });
};

pwm.shutdown = function() {
    if (pwm.pwm) {
        pwm.pwm.dispose();
    }
};

module.exports = pwm;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}