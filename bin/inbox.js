import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
  sleep,
  randomDelay,
  setupPage,
  handleCookieConsent,
  simulateScrolling,
  randomMouseMovements,
  config,
} from "./utils.js";

puppeteer.use(StealthPlugin());

export async function inbox(email) {
  try {
    const browser = await puppeteer.launch(config.browserLaunchOptions);
    const page = await setupPage(browser);

    await page.goto(config.url + "/inbox#" + email);

    // Random delay before handling cookie consent
    await sleep(randomDelay(1000, 3000));
    await handleCookieConsent(page);

    // Simulate human-like behavior
    await simulateScrolling(page);
    await randomMouseMovements(page, 5);

    await page.waitForSelector(config.selectors.inboxTable, { timeout: 10000 });

    const elements = await page.$$(config.selectors.inboxTableAll);

    const contentEmails = await Promise.all(
      elements.map(async (element) => {
        await sleep(randomDelay(100, 300)); // Small delay between processing each element
        const content = await element.evaluate((el) => el.innerHTML);
        return content;
      })
    );

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

    // Final human-like behavior before closing
    await simulateScrolling(page);
    await randomMouseMovements(page, 3);
    await sleep(randomDelay(500, 1500));

    await page.close();
    await browser.close();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
