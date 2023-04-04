import { parse } from "node-html-parser";
import { createHash } from "crypto";
import { PromiseQueues } from "./PromiseQueue.server";
import { nowHHMMSS } from "./timeUtils";
import * as reddit from "./reddit";
import * as youtube from "./youtube";
import getScreenshot from "./ScreenshotService.server";
import * as twitter from "./twitter";

import axios from "axios";
import { asUndefined } from "./tsUtils";
import { ScrapedInfo } from "./datatypes/info";

const domainThrottle = new PromiseQueues();

export default async function scrapePage(url: string): Promise<ScrapedInfo> {
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

async function scrapePageImpl(urlStr: string): Promise<ScrapedInfo> {
  try {
    const urlObj = new URL(urlStr);
    const domain = urlObj.hostname;
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
        url: url,
        fullUrl: url,
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
        url: url,
        fullUrl: url,
        hash,
        title,
        summary,
        image,
        contentType: scrapedRedditContent.contentType,
        likes: scrapedRedditContent.likes,
        dislikes: scrapedRedditContent.dislikes,
        authorLink: scrapedRedditContent.authorLink,
        authorName: scrapedRedditContent.authorName,
        publishTime: asUndefined(scrapedRedditContent.postCreationTime)
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
      url: url,
      fullUrl: url,
      hash,
      title,
      summary,
      image,
      contentType: null
    };
  } catch (error) {
    console.log("error with scrapePageImpl:  " + error.message);
    throw error;
  }
}
