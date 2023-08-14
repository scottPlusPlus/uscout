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

const domainThrottle = new PromiseQueues();

export default async function scrapePage(
  url: string,
  doExpensive: boolean = false
): Promise<ScrapedInfo> {
  console.log(url + ": starting fetch");
  try {
    return await scrapePageImpl("https://" + url, doExpensive);
  } catch (error: any) {
    try {
      return await scrapePageImpl("http://" + url, doExpensive);
    } catch (err2) {
      console.log("failed to fetch " + url + ":  " + error.message);
      throw error;
    }
  }
}

//https://scrapestack.com
const scrapeStackApiKey = process.env.SCRAPE_STACK_API_KEY;

async function fetchHtml(url: string): Promise<string> {
  try {
    var response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch HTML for ${url}: ${error.message}`);
    try {
      if (scrapeStackApiKey) {
        console.log(`attempting to scrape ${url} via scrapestack`);
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
      console.log("Scrape Stack could not fetch " + url);
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
    console.log(`${nowHHMMSS()} ${urlStr}: process response of ${len} html chars`);
    const root = parse(html);

    const scrapedInfo = await basicScrapeInfoFromHtml(urlStr, html, root);

    var r = await youtube.hydrateFromYoutube(scrapedInfo);
    if (r != null) {
      return r;
    }

    r = await reddit.hydrateFromReddit(scrapedInfo);
    if (r != null) {
      return r;
    }

    if (doExpensive) {
      console.log("expensive scrape: let's do it");
      r = await twitter.hydrateFromTwitter(scrapedInfo, root);
      if (r != null) {
        return r;
      }

      r = await archive.hydrateFromArchive(scrapedInfo);
      if (r != null) {
        return r;
      }
    } else {
      console.log("expensive scrape: skip");
    }

    return scrapedInfo;
  } catch (error) {
    console.log("error with scrapePageImpl:  " + error);
    throw error;
  }
}

async function basicScrapeInfoFromHtml(
  urlStr: string,
  html: string,
  root: HTMLElement
): Promise<ScrapedInfo> {
  const hash = createHash("sha256").update(html).digest("hex");
  const canonicalLink = root.querySelector('link[rel="canonical"]');
  const canonUrl = canonicalLink?.getAttribute("href");
  const url = canonUrl ? canonUrl : urlStr;
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
    image = await getScreenshot(url);
  }

  const scrapedInfo: ScrapedInfo = {
    url: url,
    fullUrl: url,
    hash,
    title,
    summary,
    image,
    contentType: null,
  };

  return scrapedInfo;
}


function fillWithPageText(summary: string, root: HTMLElement):string {
  var wordCount = summary.split(/\s+/).length;

  const elements = root.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li");
  var results = summary;
  if (results.length > 0){
    results += "\n";
  }

  for(const element of elements){
      var text = element.textContent || "";
      text = text.trim();
      if (!text.endsWith(".")){
        text = text+".";
      }
      results += text + " ";
      const newWords= text.split(/\s+/).length;
      wordCount += newWords;
      if (wordCount > 50){
        results = results.trimEnd() + "..";
        break;
      }
  }
  results = results.trimEnd();
  return results;
};
