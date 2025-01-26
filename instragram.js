import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

async function loginInstagram(page) {
    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;

    if (!username || !password) {
        console.error("⚠️ Please set your Instagram credentials in the .env file!");
        process.exit(1);
    }

    console.log("🔐 Logging in to Instagram...");

    await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "networkidle2" });

    // Wait for input fields
    await page.waitForSelector('input[name="username"]', { visible: true });
    await page.waitForSelector('input[name="password"]', { visible: true });

    // Type username and password slowly
    await page.type('input[name="username"]', username, { delay: 100 });
    await page.type('input[name="password"]', password, { delay: 150 });

    // Click login button
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    console.log("✅ Login successful!");
}

async function scrapePost(page, url) {
    console.log(`📷 Scraping post comments and likes...`);
    
    // Wait for the comments section and likes to load
    await page.waitForSelector('div.x78zum5.xdt5ytf.x1iyjqo2', { visible: true, timeout: 120000 });

    let postData = await page.evaluate(() => {
        const commentElements = document.querySelectorAll('div.x78zum5.xdt5ytf.x1iyjqo2');
        const likesElement = document.querySelector('span.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.xt0psk2.x1i0vuye.xvs91rp.x1s688f.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj');
        const likesCount = likesElement ? likesElement.innerText : "Not Available";
        
        const comments = [];
        commentElements.forEach((commentElement) => {
            const commentText = commentElement.querySelector('span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj');
            const commentContent = commentText ? commentText.textContent : "No comment text available";
            comments.push(commentContent);
        });
        return { likesCount, comments };
    });
    // postData.pop();
    console.log(`\n📊 Instagram Post Data:\n-----------------`);
    console.log(`👍 Likes: ${postData.likesCount}`);
    console.log(`💬 Comments:`);
    postData.comments.forEach((comment, index) => {
        console.log(`${index + 1}. ${comment}`);
    });
}

async function scrapeProfile(page, url) {
    console.log("👤 Scraping profile info...");
    
    // Wait for profile name and data to load
    await page.waitForSelector("header section h2", { visible: true });

    // Extract Profile Name
    let name = await page.evaluate(() => {
        let el = document.querySelector("header section h2");
        return el ? el.innerText.trim() : "Not Found";
    });

    // Extract Followers & Following
    let followers = await page.evaluate(() => {
        let el = document.querySelector('ul li:nth-child(2) a span');
        return el ? el.innerText : "Not Available";
    });

    let following = await page.evaluate(() => {
        let el = document.querySelector('ul li:nth-child(3) a span');
        return el ? el.innerText : "Not Available";
    });

    console.log(`\n📊 Instagram Profile Data:\n-----------------\n👤 Name: ${name}\n👥 Followers: ${followers}\n➕ Following: ${following}`);
}

async function scrapeInstagramReel(page, url) {
    console.log(`🎥 Scraping Instagram Reel Data...`);
    
    // Wait for the necessary elements to load
    await page.waitForSelector('span.xdj266r.x11i5rnm.xat24cr', { timeout: 10000 });

    // Scrape the like count
    const likeCount = await page.$eval('span.xdj266r.x11i5rnm.xat24cr', el => el.innerText.trim());

    console.log('\nLike Count:', likeCount);

    // Scrape the comments
    const comments = await page.$$eval('div.x78zum5.xdt5ytf.x1iyjqo2', commentElements => {
        return commentElements.map(commentElement => {
            const usernameElement = commentElement.querySelector('span._ap3a._aaco._aacw._aacx._aad7._aade');
            const username = usernameElement ? usernameElement.innerText : "Unknown User";

            const commentTextElement = commentElement.querySelector('span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj');
            const commentText = commentTextElement ? commentTextElement.textContent.trim() : "No comment text available";

            return { username, commentText };
        });
    });

    console.log(`\nComments:`);
    comments.forEach((comment, index) => {
        console.log(`${index + 1}. ${comment.username}`);
    });
}

async function scrapeInstagramProfile(url) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    await loginInstagram(page);

    console.log(`🔍 Scraping URL: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Check if URL is a Post
    if (url.includes("/p/")) {
        await scrapePost(page, url);
    }
    else if (url.includes("/reel/")) {
        await scrapeInstagramReel(page, url);
    }
    // Check if URL is a Profile
    else if (url.includes("instagram.com/") && !url.includes("/p/")) {
        await scrapeProfile(page, url);
    }
    // Check if URL is a Reel
 else {
        console.log("⚠️ Invalid URL format. Please provide a valid profile, post, or reel URL.");
    }

    await browser.close();
}


export default scrapeInstagramProfile;