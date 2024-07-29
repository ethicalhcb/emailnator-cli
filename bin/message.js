import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";
import {
  sleep,
  randomDelay,
  simulateScrolling,
  randomMouseMovements,
  setupPage,
  handleCookieConsent,
  config,
} from "./utils.js";

const userAgent = new UserAgent({ deviceCategory: "desktop" });

puppeteer.use(StealthPlugin());

// Function to get a specific message for a given email
export async function message(id, email) {
  try {
    const browser = await puppeteer.launch(config.browserLaunchOptions);
    const page = await setupPage(browser);

    await page.goto(`${config.url}/inbox/${email}/${id}`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Simulate human-like behavior
    await simulateScrolling(page);
    await randomMouseMovements(page);
    await sleep(randomDelay(1000, 3000));

    // Handle cookie consent
    await handleCookieConsent(page);

    // Get mail content
    const mailElements = await page.$$eval(
      config.selectors.mailElements,
      (elements) => elements.map((element) => element.innerHTML)
    );

    await browser.close();
    return mailElements;
  } catch (error) {
    console.error("Error in message:", error);
    return null;
  }
}
