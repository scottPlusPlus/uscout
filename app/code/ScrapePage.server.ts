import { parse } from "node-html-parser";
import { createHash } from "crypto";
import { PromiseQueues } from "./PromiseQueue.server";
import { nowHHMMSS } from "./timeUtils";
import * as reddit from "./reddit";
import * as youtube from "./youtube";
import getScreenshot from "./ScreenshotService.server";
import * as twitter from "./twitter";
const axios = require("axios");

interface PageInfo {
  url: string;
  hash: string;
  title: string;
  summary: string;
  image?: string;
  contentType?: string;
  duration?: number;
  likes?: number;
  dislikes?: number;
  authorName?: string;
  authorLink?: string;
  publishedTime?: number | null;
}

const domainThrottle = new PromiseQueues();

export default async function scrapePage(url: string): Promise<PageInfo> {
  console.log(url + ": starting fetch");
  try {
    return await scrapePageImpl("https://" + url);
  } catch (error) {
    try {
      return await scrapePageImpl("http://" + url);
    } catch (err2) {
      console.log("failed to fetch " + url + ":  " + error.message);
      throw error;
    }
  }
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch HTML for ${url}: ${error.message}`);
    throw error;
  }
}

async function scrapePageImpl(urlStr: string): Promise<PageInfo> {
  const urlObj = new URL(urlStr);
  const domain = urlObj.hostname;
  console.log(`${urlStr}: enque domain ${domain}  ${nowHHMMSS()}`);
  await domainThrottle.enqueue(domain);
  console.log(`${urlStr}: sending fetch ${nowHHMMSS()}`);
  const response = await fetch(urlStr);
  const html = await response.text();

  const hash = createHash("sha256").update(html).digest("hex");

  const root = parse(html);
  const canonicalLink = root.querySelector('link[rel="canonical"]');
  const canonUrl = canonicalLink?.getAttribute("href");
  const url = canonUrl ? canonUrl : urlStr;
  const title = root.querySelector("title")?.text || "";
  const summary =
    root.querySelector('meta[name="description"]')?.getAttribute("content") ||
    "";

  const ogImage = root
    .querySelector('meta[property="og:image"]')
    ?.getAttribute("content");
  const twitterImage = root
    .querySelector('meta[name="twitter:image"]')
    ?.getAttribute("content");
  var image = ogImage || twitterImage;
  if (!image) {
    image = await getScreenshot(url);
  }

  try {
    const scrapedYoutubeContent = await youtube.scrapeYouTubeVideo(urlStr);
    const scrapedRedditContent = await reddit.scrapeReddit(urlStr);

    if (scrapedYoutubeContent) {
      return {
        url,
        hash,
        title,
        summary,
        image,
        contentType: scrapedYoutubeContent.contentType,
        likes: scrapedYoutubeContent.likes,
        authorLink: scrapedYoutubeContent.authorLink,
        authorName: scrapedYoutubeContent.authorName
      };
    } else if (scrapedRedditContent) {
      return {
        url,
        hash,
        title,
        summary,
        image,
        contentType: scrapedRedditContent.contentType,
        likes: scrapedRedditContent.likes,
        dislikes: scrapedRedditContent.dislikes,
        authorLink: scrapedRedditContent.authorLink,
        authorName: scrapedRedditContent.authorName,
        publishedTime: scrapedRedditContent.postCreationTime
      };
    }

    (async () => {
      const twitterHandle = await twitter.getTwitterHandle(root);
      if (twitterHandle) {
        console.log(`Twitter handle found: ${twitterHandle}`);
        const latestTweetDate = await twitter.getLatestTweetDate(twitterHandle);
        if (latestTweetDate) {
          console.log(`Latest tweet date: ${latestTweetDate}`);
        } else {
          console.log("No tweets found.");
        }
      } else {
        console.log("No Twitter handle found.");
      }
    })();

    return {
      url,
      hash,
      title,
      summary,
      image
    };
  } catch (error) {
    console.log("error with scrapePageImpl:  " + error.message);
    throw error;
  }
}
