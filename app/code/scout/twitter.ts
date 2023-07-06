const axios = require("axios");

const TWITTER_BEARER_TOKEN = "";

export const getTwitterHandle = async (root: any) => {
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
    console.error("Error fetching URL:", error);
  }
  return null;
};

export async function getUserData(username: string) {
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

export async function fetchTwitterData(twitterUsername: string): Promise<any> {
  const options = {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  };
  const getUserEndpoint =
    "https://api.twitter.com/2/users/by?usernames=" + twitterUsername;
  const getUserResponse1 = await fetch(getUserEndpoint, options);
  const getUserResponseJson = await getUserResponse1.json();
  const userId = getUserResponseJson.data[0].id;
  const getTweetsEndpoint = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at&max_results=5`;
  console.log("\n= = = = = SENDING TWITTER REQUEST = = = = = \n");
  const getTweetsResponse = await fetch(getTweetsEndpoint, options);
  const getTweetsData = await getTweetsResponse.json();
  const lastTweet = getTweetsData.data[getTweetsData.data.length - 1];
  console.log("Last Tweet: ", lastTweet);
  console.log("response from twitter:\n" + JSON.stringify(getTweetsData));
  const twitterUnixTimestamp = Date.parse(lastTweet.created_at) / 1000;
  const userData = await getUserData(twitterUsername);
  const user = userData.data[0];
  const authorName = user.name;
  const description = user.description;
  const profileImageUrl = user.profile_image_url;
  const followersCount = user.public_metrics.followers_count;
  console.log("Author name:", authorName);
  console.log("Description:", description);
  console.log("Profile image URL:", profileImageUrl);
  console.log("Followers:", followersCount);

  return {
    contentType: "twitter",
    summary: description,
    authorName: authorName,
    image: profileImageUrl,
    likes: followersCount,
    timeUpdated: twitterUnixTimestamp
  };
}
