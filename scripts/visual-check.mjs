import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = ".qa";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const errors = [];

const openingPage = await browser.newPage({ viewport: { width: 393, height: 852 } });
await openingPage.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await openingPage.waitForTimeout(700);
const openingVisible = await openingPage.locator(".gift-gate").isVisible();
await openingPage.screenshot({ path: `${outputDir}/opening.png`, fullPage: false });
const pullBox = await openingPage.locator(".gift-ribbon-pull").boundingBox();
if (pullBox) {
  await openingPage.mouse.move(pullBox.x + pullBox.width / 2, pullBox.y + pullBox.height / 2);
  await openingPage.mouse.down();
  await openingPage.mouse.move(pullBox.x + pullBox.width / 2 + 110, pullBox.y + pullBox.height / 2, { steps: 12 });
  await openingPage.mouse.up();
}
const openingDragWorks = await openingPage.locator(".gift-gate").waitFor({ state: "detached", timeout: 5000 }).then(() => true).catch(() => false);
await openingPage.close();

async function inspect(name, viewport, fullPage = false) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${name}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${name}: ${error.message}`));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.locator(".gift-open-button").click();
  await page.locator(".gift-gate").waitFor({ state: "detached", timeout: 5000 });
  await page.waitForTimeout(500);

  if (fullPage) {
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let position = 0; position < pageHeight; position += Math.round(viewport.height * 0.7)) {
      await page.evaluate((y) => window.scrollTo(0, y), position);
      await page.waitForTimeout(90);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
  }

  const report = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const heading = document.querySelector("h1");
    const canvasBox = canvas?.getBoundingClientRect();
    const headingBox = heading?.getBoundingClientRect();
    const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
    let coloredPixels = 0;
    if (canvas && gl) {
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      for (let index = 3; index < pixels.length; index += 64) {
        if (pixels[index] > 0) coloredPixels += 1;
      }
    }
    return {
      viewport: [window.innerWidth, window.innerHeight],
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      heading: headingBox ? [Math.round(headingBox.x), Math.round(headingBox.y), Math.round(headingBox.width), Math.round(headingBox.height)] : null,
      canvas: canvasBox ? [Math.round(canvasBox.x), Math.round(canvasBox.y), Math.round(canvasBox.width), Math.round(canvasBox.height)] : null,
      webgl: Boolean(gl && !gl.isContextLost()),
      coloredPixels,
      videoCards: document.querySelectorAll(".video-memory").length,
      videos: document.querySelectorAll("video").length,
      stickerCards: document.querySelectorAll(".sticker-card").length,
      reasonsPresent: Boolean(document.querySelector(".reasons")),
    };
  });

  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage });
  await page.close();
  return report;
}

const mobile = await inspect("iphone-15", { width: 393, height: 852 }, true);
const desktop = await inspect("desktop", { width: 1440, height: 900 });

const interactionPage = await browser.newPage({ viewport: { width: 393, height: 852 } });
interactionPage.on("console", (message) => {
  if (message.type() === "error") errors.push(`interaction: ${message.text()}`);
});
interactionPage.on("pageerror", (error) => errors.push(`interaction: ${error.message}`));
await interactionPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
await interactionPage.locator(".gift-open-button").click();
await interactionPage.locator(".gift-gate").waitFor({ state: "detached", timeout: 5000 });
await interactionPage.locator(".wish-chip").click();
await interactionPage.waitForTimeout(650);
const wishInteractionWorks = await interactionPage.locator(".wish-chip").evaluate((element) => element.classList.contains("is-wished") && element.textContent?.includes("Wish made"));
await interactionPage.screenshot({ path: `${outputDir}/wish-made.png`, fullPage: false });
await interactionPage.locator(".video-memory").first().scrollIntoViewIfNeeded();
await interactionPage.waitForTimeout(1200);
const firstVideoVisible = await interactionPage.locator(".video-frame").first().isVisible();
await interactionPage.screenshot({ path: `${outputDir}/video-scroll.png`, fullPage: false });
await interactionPage.locator(".video-memory-button").first().click();
await interactionPage.locator(".media-modal").waitFor({ state: "visible" });
const modalVideo = interactionPage.locator(".media-modal video");
await interactionPage.waitForTimeout(250);
const videoStartTime = await modalVideo.evaluate((video) => video.currentTime);
await interactionPage.waitForTimeout(850);
const videoModalPlays = await modalVideo.evaluate((video, startTime) => !video.paused && video.currentTime > startTime + 0.25, videoStartTime);
await interactionPage.screenshot({ path: `${outputDir}/video-modal.png`, fullPage: false });
await modalVideo.evaluate((video) => {
  video.pause();
  video.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await interactionPage.waitForTimeout(350);
const videoModalPauseWorks = await modalVideo.evaluate((video) => video.paused);
await modalVideo.evaluate((video) => video.play());
await interactionPage.waitForTimeout(350);
const videoModalResumes = await modalVideo.evaluate((video) => !video.paused);
await interactionPage.locator(".media-modal-close").click();
await interactionPage.locator(".sticker-card").first().scrollIntoViewIfNeeded();
await interactionPage.locator(".sticker-card").first().click();
const stickerLightboxVisible = await interactionPage.locator(".sticker-lightbox-card").isVisible();
await interactionPage.waitForTimeout(850);
await interactionPage.screenshot({ path: `${outputDir}/sticker-lightbox.png`, fullPage: false });
await interactionPage.locator(".sticker-lightbox-card > button").click();
await interactionPage.locator("#letter").scrollIntoViewIfNeeded();
await interactionPage.locator(".envelope").click();
await interactionPage.waitForTimeout(850);
const letterVisible = await interactionPage.locator(".letter-paper").isVisible();
await interactionPage.screenshot({ path: `${outputDir}/letter-open.png`, fullPage: false });
await interactionPage.close();

await browser.close();

const result = { openingVisible, openingDragWorks, wishInteractionWorks, firstVideoVisible, videoModalPlays, videoModalPauseWorks, videoModalResumes, stickerLightboxVisible, mobile, desktop, letterVisible, errors };
console.log(JSON.stringify(result, null, 2));
if (errors.length || !openingVisible || !openingDragWorks || !wishInteractionWorks || !firstVideoVisible || !videoModalPlays || !videoModalPauseWorks || !videoModalResumes || !stickerLightboxVisible || !mobile.webgl || !desktop.webgl || !letterVisible || mobile.horizontalOverflow || desktop.horizontalOverflow || mobile.videoCards !== 5 || mobile.stickerCards !== 4 || mobile.reasonsPresent) {
  process.exitCode = 1;
}
