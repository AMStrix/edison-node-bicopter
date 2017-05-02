var LOG_DELAY = 5000;
var lastLogTime = 0;

function generateOut() {
    var genStats = function() {
        return { min: null, max: null, total: 0, avg: 0, bias: 0 };
    }
    return {
        measureTicks: 0,
        gyro: { x: genStats(), y: genStats(), z: genStats() },
        acc: { x: genStats(), y: genStats(), z: genStats() },
        mag: { x: genStats(), y: genStats(), z: genStats() }
    };
}

var bias = {
    out: generateOut()
};

function min(a, b) {
    if (a === null) { return b; }
    if (b === null) { return a; }
    return Math.min(a, b);
}
function max(a, b) {
    if (a === null) { return b; }
    if (b === null) { return a; }
    return Math.max(a, b);
}
function mmat(vec, mmat) {
    var f = function(stats, val) {
        stats.min = min(stats.min, val);
        stats.max = max(stats.max, val);
        stats.total += val;
        stats.avg = stats.total / bias.out.measureTicks;
        stats.bias = stats.avg;
    };
    f(mmat.x, vec.x);
    f(mmat.y, vec.y);
    f(mmat.z, vec.z);
};

bias.measure = function(input) {
    var gyro = input.gyro.vector;
    var acc = input.acc.vector;
    var mag = input.mag.vector;
    mmat(input.gyro.vector, bias.out.gyro);
    mmat(input.acc.vector, bias.out.acc);
    bias.out.acc.z.bias += 1; // special adjustment for z-axis
    mmat(input.mag.vector, bias.out.mag);
    bias.out.measureTicks++;
};
bias.reset = function() {
    bias.out = generateOut();
};


function log(x) {
    if (Date.now() - lastLogTime > LOG_DELAY) {
        console.log(x);
        lastLogTime = Date.now();
    }
}

module.exports = bias;