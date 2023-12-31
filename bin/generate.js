import puppeteer from "puppeteer";
import sqlite3 from "sqlite3";

const sleep = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const url = "https://www.emailnator.com";

/**
 * save email to sql database
 * @param email
 */
export async function saveEmailToDatabase(email) {
  const db = new sqlite3.Database("emails.db");
  const date = new Date().toISOString();
  db.run(
    "CREATE TABLE IF NOT EXISTS emails (email TEXT, created_at TEXT)",
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

/**
 * generate email address from emailnator.com
 * @returns email
 */
export async function generateEmail() {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setCacheEnabled(false);
    await page.setOfflineMode(false);
    await page.setBypassServiceWorker(true);

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "stylesheet", "font", "medias"].indexOf(
          request.resourceType()
        ) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
      generateEmail;
    });

    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    await page.goto(url);

    await page.waitForSelector(".fc-button-background");
    await page.click(".fc-button-background");

    await page.waitForSelector("#custom-switch-domain");
    await page.waitForSelector("#custom-switch-plusGmail");
    await page.waitForSelector("#custom-switch-googleMail");

    await page.click("#custom-switch-domain");
    await sleep(300);
    await page.click("#custom-switch-plusGmail");
    await sleep(300);
    await page.click("#custom-switch-googleMail");

    await page.waitForSelector(
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.justify-content-md-center.row > div > button"
    );
    await page.click(
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.justify-content-md-center.row > div > button"
    );
    await sleep(300);
    await page.click(
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.justify-content-md-center.row > div > button"
    );
    await sleep(300);

    await page.waitForSelector(
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.mb-3.input-group > input"
    );
    const element = await page.$(
      "#root > div > main > div.homepage--top > div > div > div > div.mb-3.card > div > div.mb-3.input-group > input"
    );

    if (element !== null) {
      const text = await (await element.getProperty("value")).jsonValue();

      if (!text.endsWith("@gmail.com") && !text.includes("+")) {
        await page.close();
        await browser.close();
        return null;
      }
      await saveEmailToDatabase(text);
      await page.close();
      await browser.close();
      return text;
    } else {
      await page.close();
      await browser.close();
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
