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
  } catch (error:any) {
    console.error(`Error fetching user data: ${error.message}`);
  }
}
