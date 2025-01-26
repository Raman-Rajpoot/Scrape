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

// scrapeSocialMedia("https://www.instagram.com/ramanrajpoot_72/"); // Instagram Profile
// scrapeSocialMedia("https://www.instagram.com/p/ClOzfMhKTXC/"); // Instagram Post
// scrapeSocialMedia("https://www.instagram.com/reel/DFSx3pUt4AN/"); // Instagram Reel

// scrapeSocialMedia("https://www.youtube.com/watch?v=6dqAwh2MCg0"); // YouTube Video
// scrapeSocialMedia("https://www.youtube.com/@GangstaPerspectives"); // YouTube Channel

