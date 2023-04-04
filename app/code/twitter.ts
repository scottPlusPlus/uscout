const { parse } = require("node-html-parser");
const { TwitterApi } = require("twitter-api-v2").default;
const axios = require("axios");

const TWITTER_BEARER_TOKEN = "";

export const getTwitterHandle = async (root: any) => {
  try {
    // const response = await axios.get(url);
    // const root = parse(response.data);
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
    console.error("Error fetching URL:", error);
  }
  return null;
};

export const getLatestTweetDate = async (handle: any) => {
  try {
    const client = new TwitterApi(TWITTER_BEARER_TOKEN);
    const { data } = await client.get("users/by/username/" + handle, {
      expansions: "pinned_tweet_id"
    });

    if (data.includes.pinned_tweet_id) {
      const tweet = await client.v2.singleTweet(data.includes.pinned_tweet_id);
      return new Date(tweet.data.created_at);
    }
  } catch (error) {
    console.error("Error fetching latest tweet:", error);
  }

  return null;
};
