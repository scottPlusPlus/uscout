
import { ScrapedInfo } from "../datatypes/info";
import { HTMLElement } from "node-html-parser";

const axios = require("axios");

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
interface TwitterData {
  authorName: string;
  likes: number;
  timeUpdated: number;
  timeUpdatedSource: string;
}

export async function hydrateFromTwitter(scrape:ScrapedInfo, pageRoot:HTMLElement):Promise<ScrapedInfo|null> {
  const twitterUsername = await getTwitterHandle(pageRoot);
  if (!twitterUsername){
    return null;
  }

  try {
    const twitterObject = await fetchTwitterData(twitterUsername);
    console.log("TWITTER OBJECT: ", twitterObject);
    if (!twitterObject){
      return null;
    }

    scrape.likes = twitterObject.likes,
    scrape.authorName = twitterObject.authorName,
    scrape.timeUpdated = twitterObject.timeUpdated,
    scrape.timeUpdatedSource = twitterObject?.timeUpdatedSource
  
    return scrape;
  } catch (error) {
    console.error("Failed to fetch Twitter data: ", error);
    return null;
  }
}

export async function getTwitterHandle(root: any) {
  try {
    const twitterLinks = root.querySelectorAll('a[href*="twitter.com/"]');

    for (const link of twitterLinks) {
      const href = link.getAttribute("href");
      const match = href.match(
        /https?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/
      );
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    console.error("Error searching for twitter handle:", error);
  }
  return null;
};

export async function getUserData(username: string) {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn("Warning: Bearer token does not exist.");
    return null;
  }
  const getUserEndpoint = `https://api.twitter.com/2/users/by?usernames=${username}&user.fields=profile_image_url,description,public_metrics`;
  const config = {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  };

  try {
    const response = await axios.get(getUserEndpoint, config);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user data: ${error.message}`);
  }
}

export async function fetchTwitterData(
  twitterUsername: string
): Promise<TwitterData | null> {
  console.log("fetch twitter data for ", twitterUsername);

  if (!TWITTER_BEARER_TOKEN) {
    console.warn("Warning: Bearer token does not exist.");
    return null;
  }
  const options = {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  };

  try {
    const getUserEndpoint =
      "https://api.twitter.com/2/users/by?usernames=" + twitterUsername;
    const getUserResponse1 = await fetch(getUserEndpoint, options);
    const getUserResponseJson = await getUserResponse1.json();
    const userId = getUserResponseJson.data[0].id;
    const getTweetsEndpoint = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at&max_results=5`;
    console.log("\n= = = = = SENDING TWITTER REQUEST = = = = = \n");
    const getTweetsResponse = await fetch(getTweetsEndpoint, options);
    const getTweetsData = await getTweetsResponse.json();
    const lastTweet = getTweetsData.data[0];
    console.log("Last Tweet: ", lastTweet);
    console.log("response from twitter:\n" + JSON.stringify(getTweetsData));
    const twitterUnixTimestamp = Date.parse(lastTweet.created_at) / 1000;
    const userData = await getUserData(twitterUsername);
    const user = userData.data[0];
    const authorName = user.name;
    const followersCount = user.public_metrics.followers_count;
    console.log("Author name:", authorName);
    console.log("Followers:", followersCount);

    return {
      authorName: authorName,
      likes: followersCount,
      timeUpdated: twitterUnixTimestamp,
      timeUpdatedSource: "twitter.com"
    };
  } catch (error) {
    console.warn("Warning: request to Twitter has failed. Error:", error);
    return null;
  }
}
