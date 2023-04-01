const playwright = require('playwright');
const colors = require('colors');

process.on('uncaughtException', function(er) {
    //console.log(er);
});
process.on('unhandledRejection', function(er) {
    //console.log(er);
});

const susDetection = {
	"js": [{
		"name": "CloudFlare",
		"navigations": 2,
		"locate": "<h2 class=\"h2\" id=\"challenge-running\">"
	}, {
		"name": "React",
		"navigations": 1,
		"locate": "Check your browser..."
	}, {
		"name": "DDoS-Guard",
		"navigations": 1,
		"locate": "DDoS protection by DDos-Guard"
	}]
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function log(string) {
	let d = new Date();
	let hours = (d.getHours() < 10 ? '0' : '') + d.getHours();
	let minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
	let seconds = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
	console.log(`(${hours}:${minutes}:${seconds}) ${string}`);
}

function cookiesToStr(cookies) {
	if (Array.isArray(cookies)) {
		return cookies.reduce((prev, {
			name,
			value
		}) => {
			if (!prev) return `${name}=${value}`;
			return `${prev}; ${name}=${value}`;
		}, "");
		return "";
	}
}

function findJs(argument) {
	for (let i = 0; i < susDetection['js'].length; i++) {
		if (argument.includes(susDetection['js'][i].locate)) {
			return susDetection['js'][i]
		}
	}
}

function solverInstance(args) {
	return new Promise((resolve, reject) => {
		log('[info] '.yellow + 'Browser (Firefox)'.blue + ' -> '.blue + 'created.'.green);

		playwright.firefox.launch({
			headless: true,

			proxy: {
				server: 'http://' + args.Proxy
			},
		}).then(async (browser) => {

			const page = await browser.newPage();

			try {
				await page.goto(args.Target);
			} catch (e) {
				console.log('[info] '.yellow + `Failed with ${args.Proxy}`.red)

				await browser.close();
				reject(e);
			}

			const ua = await page.evaluate(
				() => navigator.userAgent
			);

			log('[info] '.yellow + 'Browser got User-Agent'.blue + ' -> '.blue + `${ua}`.green)
			
			const source = await page.content();
			const JS = await findJs(source);

			if (JS) {
				log('[info] '.yellow + `Browser detected`.blue + ` -> `.green + `(${JS.name})`.cyan);

				for (let i = 0; i < JS.navigations; i++) {
					var [response] = await Promise.all([
						page.waitForNavigation(),
					])

					log('[info] '.yellow + 'Browser waiting navigations'.blue + ' -> '.blue + `${i}`.green)
				}
			} else {
				log('[info] '.yellow + 'No JS/Captcha'.blue)
			}

			const cookies = cookiesToStr(await page.context().cookies());
			const titleParsed = await page.title();

			log('[info] '.yellow + 'Browser got Cookies'.blue + ' -> '.blue + `${cookies}`.green)
			log('[info] '.yellow + 'Browser got Title'.blue + ' -> '.blue + `${titleParsed}`.green)

			await browser.close();
			resolve(cookies);
		})
	})
}

module.exports = {
	solverInstance: solverInstance
};