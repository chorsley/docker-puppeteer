#!/usr/bin/env node

function sleep(ms) {
    ms = (ms) ? ms : 0;
    return new Promise(resolve => {setTimeout(resolve, ms);});
}

process.on('uncaughtException', (error) => {
    console.error(error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, p);
    process.exit(1);
});

const puppeteer = require('puppeteer');

 console.log(process.argv);

if (!process.argv[2]) {
    console.error('ERROR: no url arg\n');

    console.info('for example:\n');
    console.log('  docker run --shm-size 1G --rm -v /tmp:/screenshots \\');
    console.log('  alekzonder/puppeteer:latest screenshot \'https://www.google.com\'\n');
    process.exit(1);
}

var url = process.argv[2];
console.log(url);

var now = new Date();

var dateStr = now.toISOString();

var width = 800;
var height = 600;

if (typeof process.argv[3] === 'string') {
    var [width, height] = process.argv[3].split('x').map(v => parseInt(v, 10));
}
console.log(process.argv[3]);

var delay = 5000;

if (typeof process.argv[4] === 'string') {
    delay = parseInt(process.argv[4], 10);
}

var ua = null;
console.log(process.argv[4]);
console.log(process.argv[5]);

if (typeof process.argv[5] === 'string') {
    ua = process.argv[5];
    console.log("Setting custom UA: " + ua)
}

var isMobile = false;

let filename = "urlshot.png";

(async() => {

    const browser = await puppeteer.launch({
        //dumpio: true,
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();

    page.setViewport({
        width,
        height,
        isMobile
    });

    if (ua){
        page.setUserAgent(ua);
    }

    //await page.goto(url, {waitUntil: 'networkidle0', timeout: 30000});
    await page.goto(url, { waitUntil: ['domcontentloaded', 'load', 'networkidle0'], timeout: 30000 }).catch((err) => {
          console.log(err);
    });

    await sleep(delay);

    //await Promise.race([page.screenshot({path: `/screenshots/${filename}`, fullPage: false}), new Promise((resolve, reject) => setTimeout(reject, 10000))]);
    await page.screenshot({path: `/screenshots/${filename}`, fullPage: false});

    browser.close();

    console.log(
        JSON.stringify({
            date: dateStr,
            timestamp: Math.floor(now.getTime() / 1000),
            filename,
            width,
            height
        })
    );

})();
