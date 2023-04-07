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

const TWITTER_BEARER_TOKEN = "";

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

    const twitterUsername = await twitter.getTwitterHandle(root);

    if (twitterUsername) {
      const options = {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
        }
      };
      const getUserEndpoint =
        "https://api.twitter.com/2/users/by?usernames=" + twitterUsername;
      const getUserResponse1 = await fetch(getUserEndpoint, options);
      const getUserData = await getUserResponse1.json();
      const userId = getUserData.data[0].id;
      const getTweetsEndpoint = `https://api.twitter.com/2/users/${userId}/tweets?max_results=25`;
      console.log("\n= = = = = SENDING TWITTER REQUEST = = = = = \n");
      const getTweetsResponse = await fetch(getTweetsEndpoint, options);
      const getTweetsData = await getTweetsResponse.json();
      const lastTweet = getTweetsData.data[getTweetsData.data.length - 1];
      console.log("response from twitter:\n" + JSON.stringify(getTweetsData));
      console.log("LAST TWEET: ", lastTweet);
      console.log("RETURN: ", {
        url: url,
        fullUrl: url,
        hash,
        title,
        contentType: "twitter",
        summary: getUserData.description,
        authorName: getUserData.name,
        image: getUserData.profile_image_url,
        likes: getUserData.followers_count
      });
      return {
        url: url,
        fullUrl: url,
        hash,
        title,
        contentType: "twitter",
        summary: getTweetsData.description,
        authorName: getTweetsData.name,
        image: getTweetsData.profile_image_url,
        likes: getTweetsData.followers_count
      };
    }

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
    console.log("error with scrapePageImpl:  " + error);
    throw error;
  }
}
