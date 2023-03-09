import { parse } from "node-html-parser";
import { createHash } from "crypto";
import { PromiseQueues } from "./PromiseQueue.server";
import { nowHHMMSS } from "./timeUtils";

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
  const image = ogImage || twitterImage;

  //TODO - if url is a youtube video
  //set content type = Video
  //call a separate function to scrape the video
  //duration, likes, authorName, authorLink
  //add all that to the output PageInfo

  return { url, hash, title, summary, image };
}
