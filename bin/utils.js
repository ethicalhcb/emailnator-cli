// /bin/utils.js

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

// Helper function to pause execution
export const sleep = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// Function to generate a random delay
export function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to get a new user agent
export function getNewUserAgent() {
  return new UserAgent({ deviceCategory: "desktop" }).toString();
}

// Function to simulate human-like scrolling
export async function simulateScrolling(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Function to add random mouse movements
export async function randomMouseMovements(page, steps) {
  await page.mouse.move(
    Math.random() * page.viewport().width,
    Math.random() * page.viewport().height,
    { steps: steps }
  );
}

// Function to set up the browser page with common configurations and anti-detection measures
export async function setupPage(browser) {
  const page = await browser.newPage();

  // Set a new custom user agent for each page
  const customUserAgent = getNewUserAgent();
  await page.setUserAgent(customUserAgent);

  // Set additional headers to mimic a real browser
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.google.com/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  });

  // Set viewport to a common resolution
  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });

  await Promise.all([
    page.setCacheEnabled(false),
    page.setJavaScriptEnabled(true),
    page.setOfflineMode(false),
    page.setBypassServiceWorker(true),
    page.setRequestInterception(true),
  ]);

  // Override certain browser features to make detection harder
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
  });

  // Intercept and modify certain requests
  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // Automatically dismiss any dialogs
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
  });

  return page;
}

// Function to handle cookie consent
export async function handleCookieConsent(page) {
  try {
    await page.waitForSelector(".fc-button-background", { timeout: 5000 });
    await page.click(".fc-button-background");
  } catch (error) {}
}

// Configuration object
export const config = {
  url: "https://www.emailnator.com",
  browserLaunchOptions: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
    ignoreHTTPSErrors: true,
  },
  selectors: {
    cookieConsent: ".fc-button-background",
    inboxTable: "div.mb-3.col-lg-6.col-sm-12 table.message_container",
    inboxTableAll: "div.mb-3.col-lg-6.col-sm-12 table",
    messageContent:
      "#root > div > section > div > div > div.mb-3.col-lg-6.col-sm-12 > div > div > div.card > div > div",
    domainSwitch: "#custom-switch-domain",
    plusGmailSwitch: "#custom-switch-plusGmail",
    googleMailSwitch: "#custom-switch-googleMail",
    generateButton:
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.justify-content-md-center.row > div > button",
    emailInput:
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.mb-3.input-group > input",
    mailElements:
      "#root > div > section > div > div > div.mb-3.col-lg-6.col-sm-12 > div > div > div.card > div > div",
  },
};
