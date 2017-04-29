var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

console.log('TODO: adjust for bicopter service (from fuel guage)');

// var serviceName = 'edison-node-fuel-guage';
// var servicePath = '/lib/systemd/system/edison-node-fuel-guage.service';
// var serviceDef =
//     '[Unit]\n' +
//     'Description=Edison OLED Status/Control\n' +
//     '\n' +
//     '[Service]\n' +
//     'ExecStart=/usr/bin/node /home/root/edison-node-fuel-guage/server.js\n' +
//     'WorkingDirectory=/home/root/edison-node-fuel-guage/\n' +
//     'Restart=on-failure\n' +
//     'RestartSec=10\n' +
//     '\n' +
//     '[Install]\n' +
//     'WantedBy=multi-user.target';

// console.log('Installing as systemctl service...');

// async.series([
//     function(cb) {
//         console.log('1. Write service file.')
//         fs.writeFile(servicePath, serviceDef, function(e) {
//             if (e) { console.log('  ERROR, could not write service file. -> ' + servicePath, e); }
//             else {
//                 console.log('   File written.');
//                 cb();
//             }
//         });
//     },
//     function(cb) {
//         console.log('2. Set permissions on service.');
//         exec('chmod 644 ' + servicePath, function(error, out, stderr) {
//             if (error || stderr) { console.log('  ERROR, could not chmod 644 service file. -> ' + servicePath, error||stderr); }
//             else {
//                 console.log('   chmod 644 complete');
//                 cb();
//             }
//         });
//     },
//     function(cb) {
//         exec('chown root:root ' + servicePath, function(error, out, stderr) {
//             if (error || stderr) { console.log('  ERROR, could not chown root:root service file. -> ' + servicePath, error||stderr); }
//             else {
//                 console.log('   chown root:root complete');
//                 cb();
//             }
//         });
//     },
//     function(cb) {
//         console.log('3. systemctl tasks.');
//         exec('systemctl daemon-reload', function(error, out, stderr) {
//             if (error || stderr) { console.log('  ERROR, could not systemctl daemon-reload.', error||stderr); }
//             else {
//                 console.log('   systemctl daemon-reload complete');
//                 cb();
//             }
//         });
//     },
//     function(cb) {
//         exec('systemctl enable ' + serviceName, function(error, out, stderr) {
//             if (error || stderr) { console.log('  ERROR, could not enable service.', error||stderr); }
//             else {
//                 console.log('   systemctl enable complete');
//                 cb();
//             }
//         });
//     },
//     function(cb) {
//         exec('systemctl start ' + serviceName, function(error, out, stderr) {
//             if (error || stderr) { console.log('  ERROR, could not start service.', error||stderr); }
//             else {
//                 console.log('   systemctl start complete');
//                 cb();
//             }
//         });
//     },
// ], function(e, res) { console.log('[' + servicePath + '] installed and running.'); } );


