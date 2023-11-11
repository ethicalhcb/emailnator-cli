export async function checkPuppeteerInstallation() {
  try {
    const { downloadBrowser } = await (async () => {
      try {
        return await import("puppeteer/internal/node/install.js");
      } catch {
        console.warn(
          "Skipping browser installation because the Puppeteer build is not available. Run `npm install` again after you have re-built Puppeteer."
        );
        process.exit(0);
      }
    })();
    return new Promise((resolve, reject) => {
      resolve(downloadBrowser());
    });
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(console.warn("Browser download failed", error));
    });
  }
}
