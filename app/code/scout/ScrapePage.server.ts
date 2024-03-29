import { HTMLElement, parse } from "node-html-parser";
import { createHash } from "crypto";
import { PromiseQueues } from "../PromiseQueue.server";
import { nowHHMMSS } from "../agnostic/timeUtils";
import * as reddit from "./reddit";
import * as youtube from "./youtube";
import getScreenshot from "./ScreenshotService.server";
import * as twitter from "./twitter";
import * as archive from "./archive";

import axios from "axios";
import { ScrapedInfo } from "../datatypes/info";
import { logger } from "../log/logger";
import { saveHtml } from "~/models/savedHtmlDb.server";
import { sanitizeUrl } from "../urlUtils";

const domainThrottle = new PromiseQueues();

export default async function scrapePage(
  url: string,
  doExpensive: boolean = false
): Promise<ScrapedInfo> {
  logger.info(url + ": starting fetch");
  try {
    return await scrapePageImpl("https://" + url, doExpensive);
  } catch (error: any) {
    try {
      return await scrapePageImpl("http://" + url, doExpensive);
    } catch (err2) {
      logger.warn("failed to fetch " + url + ":  " + error.message);
      throw error;
    }
  }
}

//https://scrapestack.com
const scrapeStackApiKey = process.env.SCRAPE_STACK_API_KEY;

async function fetchHtml(url: string): Promise<string> {
  try {
    var response = await axios.get(url);
    console.log(`status from ${url}: ${response.status}`);
    if (!response.data || typeof response.data !== "string"){
      const msg = `unexpected response from url`;
      logger.warn(msg);
      throw new Error(msg);      
    }
    return response.data;
  } catch (error: any) {
    logger.warn(`fetchHtml failed for ${url}: ${error.message}`);
    try {
      if (scrapeStackApiKey) {
        logger.info(`attempting to scrape ${url} via scrapestack`);
        const scrapeStackUrl = `http://api.scrapestack.com/scrape?access_key=${scrapeStackApiKey}&url=${url}&render_js=1`;
        response = await axios.get(scrapeStackUrl);
        console.log(
          `scrapestack got response from ${url} with status ${response.status}`
        );
        return response.data;
      } else {
        console.log("no scrapeStackApiKey");
      }
    } catch (error: any) {
      logger.warn("fetchHtml: Scrape Stack could not fetch " + url);
    }
    throw error;
  }
}

async function scrapePageImpl(
  urlStr: string,
  doExpensive: boolean = false
): Promise<ScrapedInfo> {
  try {
    const urlObj = new URL(urlStr);
    const domain = urlObj.hostname;
    console.log(`${nowHHMMSS()} ${urlStr}: enque domain ${domain}`);
    await domainThrottle.enqueue(domain);

    console.log(`${nowHHMMSS()} ${urlStr}: sending fetch`);
    const html = await fetchHtml(urlStr);
    if (!html || typeof html !== "string"){
      throw new Error("failed getting html for " + urlStr);
    }
    const len = html.length;
    logger.info(`${nowHHMMSS()} ${urlStr}: process response of ${len} html chars`);
    
    const root = parse(html);

    const scrapedInfo = await basicScrapeInfoFromHtml(urlStr, html, root);
    await saveHtml(scrapedInfo.url, html);

    var r = await youtube.hydrateFromYoutube(scrapedInfo);
    if (r != null) {
      return r;
    }

    r = await reddit.hydrateFromReddit(scrapedInfo);
    if (r != null) {
      return r;
    }

    if (doExpensive) {
      logger.info("expensive scrape: let's do it");
      r = await twitter.hydrateFromTwitter(scrapedInfo, root);
      if (r != null) {
        return r;
      }

      r = await archive.hydrateFromArchive(scrapedInfo);
      if (r != null) {
        return r;
      }
    } else {
      logger.info("expensive scrape: skip");
    }

    return scrapedInfo;
  } catch (error) {
    logger.warn("error with scrapePageImpl:  " + error);
    throw error;
  }
}

async function basicScrapeInfoFromHtml(
  urlStr: string,
  html: string,
  root: HTMLElement
): Promise<ScrapedInfo> {
  const saneUrl = sanitizeUrl(urlStr)!;
  const hash = createHash("sha256").update(html).digest("hex");
  const canonicalLink = root.querySelector('link[rel="canonical"]');
  const canonUrl = canonicalLink?.getAttribute("href");
  const fullUrl = canonUrl ? canonUrl : urlStr;
  const title = root.querySelector("title")?.text || "";
  var summary =
    root.querySelector('meta[name="description"]')?.getAttribute("content") ||
    "";
  summary = fillWithPageText(summary, root);

  const ogImage = root
    .querySelector('meta[property="og:image"]')
    ?.getAttribute("content");
  const twitterImage = root
    .querySelector('meta[name="twitter:image"]')
    ?.getAttribute("content");
  var image = ogImage || twitterImage;
  if (!image) {
    image = await getScreenshot(fullUrl);
  }

  const scrapedInfo: ScrapedInfo = {
    url: saneUrl,
    fullUrl: fullUrl,
    hash,
    title,
    summary,
    image,
    contentType: null,
  };

  return scrapedInfo;
}


export function fillWithPageText(summary: string, root: HTMLElement):string {
  var wordCount = summary.split(/\s+/).length;

  const body = root.querySelector('body');
  if (body == null){
    return summary;
  }
  const elements = body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li");
  var results = summary;
  if (results.length > 0){
    results += "\n";
  }

  for(const element of elements){
      var text =  extractVisibleText(element);

      //if we end with a-z (so not some punctuation) add a .
      const lastChar = text.charAt(text.length - 1);
      const reg =  /^[a-zA-Z]$/;
      if (reg.test(lastChar)){
        text = text+". ";
      } else {
        text = text+" ";
      }
      const textWords = text.split(/\s+/);
      const newWords= textWords.length;
      if (wordCount + newWords > 60){
        results += textWords.slice(0, 60-wordCount).join(" ") + ".";
      } else {
        results += text;
      }
      wordCount += newWords;
      if (wordCount > 50){
        results = results.trimEnd() + "..";
        break;
      }
  }
  results = results.trimEnd();
  return results;
};

function extractVisibleText(element: HTMLElement): string {
  let visibleText = '';

  for (const childNode of element.childNodes) {
    if (childNode.nodeType === 3) {
      // Text node
      visibleText += childNode.rawText;
    }
  }

  return visibleText.trim();
}
