import puppeteer from "puppeteer";

async function scrapeYouTube(url) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();
    
    console.log(`🔍 Scraping URL: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });
    
    if (url.includes("watch?v=")) {
        await scrapeYouTubeVideo(page);
    } else if (url.includes("www.youtube.com/@") || url.includes("user/")) {
      await scrapeChannelProfile(page);
  } else {
      console.log("⚠️ Invalid YouTube Channel URL. Please provide a valid channel link.");
  }
    
    await browser.close();
}

async function scrapeChannelProfile(page) {
  console.log("🎥 Scraping Channel profile details...");
  
  // // Extracting the channel name (username)
  // const username = await page.$eval('span.yt-core-attributed-string--link-inherit-color', el => el.innerText.trim());
  // console.log(`🧑‍💻 Username: ${username}`);
  
  const channelName = await page.$eval('.dynamic-text-view-model-wiz__h1', el => el.textContent.trim());
  console.log(`🏷️ Channel Name: ${channelName || 'Not found'}`);
  

  const allTexts = await page.$$eval(
    '.yt-core-attributed-string.yt-content-metadata-view-model-wiz__metadata-text.yt-core-attributed-string--white-space-pre-wrap.yt-core-attributed-string--link-inherit-color',
    elements => elements.map(el => el.textContent.trim())
  );
  

  console.log(`🔔 Subscribers: ${allTexts[1]}`);
 
  console.log(`📹 Videos: ${allTexts[2]}`);
  
 
  console.log(`🏷️ UserName: ${allTexts[0]}`);
}

async function scrapeYouTubeVideo(page) {
    console.log("🎥 Scraping YouTube video details...");
    
    await autoScroll(page);
    
    await page.waitForSelector('span.bold.style-scope.yt-formatted-string', { visible: true });
    const views = await page.$eval('span.bold.style-scope.yt-formatted-string', el => el.innerText.trim());
    const title = await page.$eval('h1.style-scope.ytd-watch-metadata yt-formatted-string', el => el.innerText.trim());


    const channelName = await page.$eval('ytd-channel-name a', el => el.innerText.trim());
  

    console.log(`🎬 Title: ${title}`);
    console.log(`👤 Channel: ${channelName}`);
    console.log(`👁️ Views: ${views}`);
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise(resolve => {
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

export default scrapeYouTube