var LOG_DELAY = 5000;
var lastLogTime = 0;
var TICK_DIFF_BUFFER_LEN = 10;
var smoothTickDiffTotal = 0;
var runningTickDiffTotal = 0;

var filter = {
    out: {
        lastCallTime: 0,
        tick: 0,
        tickDiffs: [],
        smoothTickDiffAvg: 0,
        runningTickDiffAvg: 0,
        tickDiffMax: 0,
        tickDiffMin: 999999
    }
};

filter.filter = function(input) {
    var callTime = Date.now();
    var gyro = input.gyro.vector;
    var acc = input.acc.vector;
    var mag = input.mag.vector;
    // log(filter.out);
    collectTimingStats(callTime);
    filter.out.lastCallTime = callTime;
    filter.out.tick++;
};

function collectTimingStats(callTime) {
    if (filter.out.tick > 0) {
        var diff = callTime - filter.out.lastCallTime;
        var index = filter.out.tick % TICK_DIFF_BUFFER_LEN;
        smoothTickDiffTotal = smoothTickDiffTotal - (filter.out.tickDiffs[index]||0) + diff;
        runningTickDiffTotal += diff;
        filter.out.tickDiffs[index] = diff;
        filter.out.smoothTickDiffAvg = smoothTickDiffTotal/TICK_DIFF_BUFFER_LEN;
        filter.out.runningTickDiffAvg = runningTickDiffTotal/filter.out.tick;
        filter.out.tickDiffMax = Math.max(diff, filter.out.tickDiffMax);
        filter.out.tickDiffMin = Math.min(diff, filter.out.tickDiffMin);
    }
}

function log(x) {
    if (Date.now() - lastLogTime > LOG_DELAY) {
        console.log(x);
        lastLogTime = Date.now();
    }
}

module.exports = filter;