import { parse } from "node-html-parser";
import { createHash } from "crypto";
import { PromiseQueues } from "./PromiseQueue.server";
import { nowHHMMSS } from "./timeUtils";
import getScreenshot from "./ScreenshotService.server";

interface PageInfo {
  url: string;
  hash: string;
  title: string;
  summary: string;
  image?: string;
  contentType?: string;
  duration?: number;
  likes?: number;
  authorName?: string;
  authorLink?: string;
}

const domainThrottle = new PromiseQueues();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export default async function scrapePage(url: string): Promise<PageInfo> {
  console.log(url + ": starting fetch");
  try {
    return await scrapePageImpl("https://" + url);
  } catch (error:any) {
    try {
      return await scrapePageImpl("http://" + url);
    } catch (err2) {
      console.log("failed to fetch " + url + ":  " + error.message);
      throw error;
    }
  }
}

async function scrapePageImpl(urlStr: string): Promise<PageInfo> {
  const urlObj = new URL(urlStr);
  const domain = urlObj.hostname;
  console.log(urlObj)
  console.log("Hello World!")
  console.log(domain)

  console.log(`${urlStr}: enque domain ${domain}  ${nowHHMMSS()}`);
  await domainThrottle.enqueue(domain);
  console.log(`${urlStr}: sending fetch ${nowHHMMSS()}`);
  const response = await fetch(urlStr);
  const html = await response.text();

  const hash = createHash("sha256").update(html).digest("hex");

  const root = parse(html);
  const canonicalLink = root.querySelector('link[rel="canonical"]');
  const canonUrl = canonicalLink?.getAttribute('href');
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
  if(!image){
    image = await getScreenshot(url);
  }

  //TODO - if url is a youtube video
  //set content type = Video
  //call a separate function to scrape the video
  //duration, likes, authorName, authorLink
  //add all that to the output PageInfo
  let contentType;
  let authorLink;
  let likes;
  let authorName;

  if (isYouTubeVideo(urlStr)) {
    let videoId = getVideoIdFromUrl(urlStr);
    if (videoId){
      const scrapedVideoContent = await scrapeYouTubeVideo(videoId);
      contentType = "Video";
      authorLink = scrapedVideoContent.authorLink;
      likes = parseInt(scrapedVideoContent.likes);
      authorName = scrapedVideoContent.authorName;
      console.log("author name = " + authorName);
    }

  }

  return { url, hash, title, summary, image, contentType, authorLink, likes, authorName };
}

async function scrapeYouTubeVideo(videoId: string) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  console.log("Data: ", data)

  const video = data.items[0];
  // const duration = video.contentDetails.duration;
  const likes = video.statistics.likeCount;
  const authorName = video.snippet.channelTitle;
  const authorLink = `https://www.youtube.com/channel/${video.snippet.channelId}`;
  const contentType = "Video"

  return {
    // duration,
    likes,
    authorName,
    authorLink,
    contentType
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
