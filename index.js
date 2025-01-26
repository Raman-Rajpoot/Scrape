import scrapeInstagramProfile from "./instragram.js";
import scrapeYouTube from "./yt.js";
import scrapeTwitter from "./x.js";

// Function to determine the platform and call the respective scraper
async function scrapeSocialMedia(url) {
  if (!url) {
    console.error("⚠️ Please provide a valid URL.");
    return;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    console.log(`🔍 Detecting platform for: ${url}`);

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      await scrapeYouTube(url);
    } else if (hostname.includes("instagram.com")) {
      await scrapeInstagramProfile(url);
    } else if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      await scrapeTwitter(url);
    } else {
      console.log("⚠️ Unsupported platform. Please provide a YouTube, Instagram, or Twitter/X URL.");
    }
  } catch (error) {
    console.error("❌ Invalid URL format or an error occurred:", error.message);
  }
}

// Example Usage: Call with different URLs
// scrapeSocialMedia("https://www.instagram.com/p/DFSQqljzW9h/");  // 3
// scrapeSocialMedia("https://www.youtube.com/watch?v=4oCkWizuxSc");  // 1.5
scrapeSocialMedia("https://x.com/who_krn");


// scrapeSocialMedia('https://www.instagram.com/reel/DEv9IuINaKd/')