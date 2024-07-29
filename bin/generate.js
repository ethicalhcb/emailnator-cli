import puppeteer from "puppeteer-extra";
import sqlite3 from "sqlite3";
import {
  sleep,
  randomDelay,
  simulateScrolling,
  randomMouseMovements,
  setupPage,
  handleCookieConsent,
  config,
} from "./utils.js";

/**
 * save email to sql database
 * @param email
 */
export async function saveEmailToDatabase(email) {
  const db = new sqlite3.Database("emails.db");
  const date = new Date().toISOString();
  db.run(
    "CREATE TABLE IF NOT EXISTS emails (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, created_at TEXT)",
    function (err) {
      if (err) {
        console.error(err.message);
      } else {
        db.run("INSERT INTO emails (email, created_at) VALUES (?, ?)", [
          email,
          date,
        ]);
        db.close();
      }
    }
  );
}

// Function to generate a new email
export async function generateEmail() {
  try {
    const browser = await puppeteer.launch(config.browserLaunchOptions);
    const page = await setupPage(browser);

    await page.goto(config.url, { waitUntil: "networkidle2", timeout: 60000 });

    // Simulate human-like behavior
    await simulateScrolling(page);
    const randomSteps = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    await randomMouseMovements(page, randomSteps);
    await sleep(randomDelay(1000, 3000));

    // Handle cookie consent
    await handleCookieConsent(page);

    // Configure email options
    await page.waitForSelector(config.selectors.domainSwitch, {
      timeout: 10000,
    });
    await page.waitForSelector(config.selectors.plusGmailSwitch, {
      timeout: 10000,
    });
    await page.waitForSelector(config.selectors.googleMailSwitch, {
      timeout: 10000,
    });

    await page.click(config.selectors.domainSwitch);
    await sleep(randomDelay(200, 500));
    await page.click(config.selectors.plusGmailSwitch);
    await sleep(randomDelay(200, 500));
    await page.click(config.selectors.googleMailSwitch);

    // Generate email
    await page.waitForSelector(config.selectors.generateButton, {
      timeout: 10000,
    });
    await page.click(config.selectors.generateButton);
    await sleep(randomDelay(200, 500));
    await page.click(config.selectors.generateButton);
    await sleep(randomDelay(500, 1000));

    // Get generated email
    await page.waitForSelector(config.selectors.emailInput, { timeout: 10000 });
    const element = await page.$(config.selectors.emailInput);

    let generatedEmail = null;
    if (element !== null) {
      const text = await (await element.getProperty("value")).jsonValue();
      if (text.endsWith("@gmail.com") || text.includes("+")) {
        generatedEmail = text;
      }
    }

    if (generatedEmail === null) {
      console.warn("Generated email is null");
    }

    await browser.close();
    saveEmailToDatabase(generatedEmail);
    return generatedEmail;
  } catch (error) {
    console.error("Error in generateEmail:", error);
    return null;
  }
}
