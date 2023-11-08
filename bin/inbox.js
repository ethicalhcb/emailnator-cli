import puppeteer from "puppeteer";

const url = "https://www.emailnator.com";

const sleep = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function inbox(email) {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on("request", (request) => {
            if (["image", "stylesheet", "font", "medias"].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        page.on("dialog", async (dialog) => {
            await dialog.dismiss();
        });

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        await page.goto(url + "/inbox#" + email);

        await page.waitForSelector(".fc-button-background");
        await page.click(".fc-button-background");

        await sleep();

        await page.waitForSelector("div.mb-3.col-lg-6.col-sm-12 table.message_container");
        const elements = await page.$$('div.mb-3.col-lg-6.col-sm-12 table');

        const contentEmails = await Promise.all(elements.map(async (element) => {
            const content = await element.evaluate((el) => el.innerHTML);
            return content;
        }));

        const hrefLinks = contentEmails.map((content) => {
            const hrefRegex = /href="([^"]*)"/g;
            const hrefMatches = content.matchAll(hrefRegex);
            const hrefs = Array.from(hrefMatches, (match) => match[1]);

            return hrefs.filter((href) => href.length > 0);
        });

        const hrefsMails = hrefLinks.filter((href) => href.length > 0);

        const tableRegex = /<table[^>]*>(.*?)<\/table>/g;
        const tableMatches = contentEmails[0].matchAll(tableRegex);
        const tables = Array.from(tableMatches, (match) => match[1]);

        const result = [];
        tables.forEach((element, index) => {
            const tdRegex = /<td[^>]*>(.*?)<\/td>/g;
            const tdMatches = element.matchAll(tdRegex);
            const tds = Array.from(tdMatches, (match) => match[1]);

            hrefsMails.forEach((element) => {
                tds.push(element[index]);
            });

            result.push(tds);
        });

        await page.close();
        await browser.close();
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}
