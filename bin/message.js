import puppeteer from "puppeteer";

export async function message(id, email) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await Promise.all([
        page.setCacheEnabled(false),
        page.setOfflineMode(false),
        page.setBypassServiceWorker(true),
        page.setRequestInterception(true),
        page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        }),
    ]);

    page.on("request", (request) => {
        const resourceType = request.resourceType();
        if (["image", "stylesheet", "font", "medias"].includes(resourceType)) {
            request.abort();
        } else {
            request.continue();
        }
    });

    page.on("dialog", async (dialog) => {
        await dialog.dismiss();
    });

    await page.goto(`https://www.emailnator.com/inbox/${email}/${id}`);

    await page.waitForSelector(".fc-button-background");
    await page.click(".fc-button-background");

    const mailElements = await page.$$eval(
        '#root > div > section > div > div > div.mb-3.col-lg-6.col-sm-12 > div > div > div.card > div > div',
        (elements) => elements.map((element) => element.innerHTML)
    );

    await browser.close();
    return mailElements;
}
