import { parse } from "node-html-parser";
import { createHash } from "crypto";
import { PromiseQueues } from "./PromiseQueue.server";
import { nowHHMMSS } from "./timeUtils";
import * as reddit from "./reddit";
import * as youtube from "./youtube";
import getScreenshot from "./ScreenshotService.server";
import axios from "axios";

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
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export default async function scrapePage(url: string): Promise<PageInfo> {
  console.log(url + ": starting fetch");
  try {
    return await scrapePageImpl("https://" + url);
  } catch (error: any) {
    try {
      return await scrapePageImpl("http://" + url);
    } catch (err2) {
      console.log("failed to fetch " + url + ":  " + error.message);
      throw error;
    }
  }
}

async function scrapePageImpl(urlStr: string): Promise<PageInfo> {
  try {
    const urlObj = new URL(urlStr);
    const domain = urlObj.hostname;
    console.log(urlObj);
    console.log(domain);

    console.log(`${urlStr}: enque domain ${domain}  ${nowHHMMSS()}`);
    await domainThrottle.enqueue(domain);

    console.log(`${urlStr}: sending fetch ${nowHHMMSS()}`);
    const html = await fetchHtml(urlStr);

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

  return {
    url,
    hash,
    title,
    summary,
    image
  };
}

function isYouTubeVideo(url: string) {
  // Match YouTube watch URL format
  const watchPattern = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

  // Match YouTube short URL format
  const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]+)/;

  return watchPattern.test(url) || shortPattern.test(url);
}

function getVideoIdFromUrl(url: string) {
  const regex = /(?:\?v=|\/embed\/|\/watch\?v=|\/\w+\/\w+\/)([\w-]{11})/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  }
  return null;
}
