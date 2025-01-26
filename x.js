import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

async function loginTwitter(page) {
  try {
    console.log("Navigating to login...");
    await page.goto("https://x.com/login", { waitUntil: "domcontentloaded" });

    // Wait for login form
    await page.waitForSelector('input[name="text"]', { visible: true });
    console.log("Username field found, typing username...");

    // Enter username/email
    await page.type('input[name="text"]', process.env.TWITTER_USERNAME, { delay: 50 });
    await page.keyboard.press("Enter");
    await page.waitFor(5000); // Wait longer for password field to appear

    // Check if password field appears
    await page.waitForSelector('input[name="password"]', { visible: true });
    console.log("Password field found, typing password...");

    // Enter password
    await page.type('input[name="password"]', process.env.TWITTER_PASSWORD, { delay: 50 });
    await page.keyboard.press("Enter");

    // Wait for successful navigation to the homepage
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });
    console.log("Login successful");
  } catch (error) {
    console.error("Login failed: ", error);
  }
}

async function scrapeTwitter(url) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  await loginTwitter(page); // Log in first

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for the profile or any content to load
  try {
    await page.waitForSelector('.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3', { timeout: 60000 });
    console.log("Page loaded, extracting username...");
    
    // Extract Username using the provided class
    const username = await page.$eval('.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3', element => element.textContent.trim());

    // Extract Followers and Following count
    const followersFollowingText = await page.$$eval('.css-175oi2r.r-13awgt0.r-18u37iz.r-1w6e6rj', elements => {
      return elements.map(element => element.textContent.trim());
    });

    // Regex to extract following and followers
    const regex = /(\d[\d,]*)\s*Following.*?(\d[\d,]*)\s*Followers/;
    const match = followersFollowingText.join(" ").match(regex);

    if (match) {
      const following = match[1];  
      const followers = match[2];  
      console.log({ username, following, followers });
    } else {
      console.log("Couldn't extract following and followers");
    }
  } catch (error) {
    console.log("Error extracting data: ", error);
  }

  await browser.close();
}

export default scrapeTwitter;
