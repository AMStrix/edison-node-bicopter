var m = require('mraa');
var lsm9ds0 = require('jsupm_lsm9ds0');

var ndof = {};

function getFloat(floatObj) {
    return lsm9ds0.floatp_value(floatObj);
}
function genFloat() {
    return new lsm9ds0.new_floatp();
}
var tempVector = {
    x: genFloat(),
    y: genFloat(),
    z: genFloat()
};

function updateVector(funcName, vector) {
    ndof.sensor[funcName](tempVector.x, tempVector.y, tempVector.z);
    vector.x = getFloat(tempVector.x);
    vector.y = getFloat(tempVector.y);
    vector.z = getFloat(tempVector.z);
}

ndof.update = function() {
    ndof.sensor.update();
    updateVector('getGyroscope', ndof.gyro.vector);
    updateVector('getAccelerometer', ndof.acc.vector);
    updateVector('getMagnetometer', ndof.mag.vector);
    ndof.temp = ndof.sensor.getTemperature();
    return ndof;
};

ndof.init = function() {
    ndof.sensor = new lsm9ds0.LSM9DS0();
    ndof.sensor.init();
    ndof.gyro = { vector: {x: null, y: null, z: null} };
    ndof.acc = { vector: {x: null, y: null, z: null} };
    ndof.mag = { vector: {x: null, y: null, z: null} };
    ndof.temp = null;
    ndof.calibrated = false;
    return ndof;
};

ndof.shutdown = function() {
    if (ndof.sensor) {
        ndof.sensor = null;
    }
    lsm9ds0.cleanUp();
    lsm9ds0 = null;
    return ndof;
};

module.exports = ndof;