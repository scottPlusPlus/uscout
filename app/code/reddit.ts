function isRedditLink(url: string) {
  // Create a regular expression to match Reddit links
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/([rR]\/\w+|u\/\w+|comments\/\w+)/;

  // Test the URL against the regular expression
  return regex.test(url);
}

export function getSubredditName(url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/r\/(\w+)/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

export function getPostTitle(url: string) {
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/(\w+)\//;
  const match = url.match(regex);
  if (match) {
    return match[1].replace(/_/g, " ");
  } else {
    return null;
  }
}

export async function getPostThumbnail(url: string) {
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//;
  const match = url.match(regex);
  if (match) {
    const postUrl = match[0];
    const jsonUrl = postUrl + ".json";
    return fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        const thumbnail = data[0].data.children[0].data.thumbnail;
        return thumbnail;
      });
  } else {
    return null;
  }
}

export async function getPostVotes(url: string) {
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//;
  const match = url.match(regex);
  if (match) {
    const postUrl = match[0];
    const jsonUrl = postUrl + ".json";
    return fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        const upvotes = data[0].data.children[0].data.ups;
        const downvotes = data[0].data.children[0].data.downs;
        return { upvotes, downvotes };
      });
  } else {
    return null;
  }
}

export async function getPostAuthorName(url: string) {
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//;
  const match = url.match(regex);
  if (match) {
    const postUrl = match[0];
    const jsonUrl = postUrl + ".json";
    return fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        const authorName = data[0].data.children[0].data.author;
        return authorName;
      });
  } else {
    return null;
  }
}

export async function getPostCreationTime(url: string): Promise<number | null> {
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//;
  const match = url.match(regex);
  if (match) {
    const postUrl = match[0];
    const jsonUrl = postUrl + ".json";
    return fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        const postCreationTime: number =
          data[0].data.children[0].data.created_utc;
        return postCreationTime;
      });
  } else {
    return null;
  }
}

export async function getCommentCount(url: string) {
  const regex =
    /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//;
  const match = url.match(regex);
  if (match) {
    const postUrl = match[0];
    const jsonUrl = postUrl + ".json";
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      const commentCount = data[0].data.children[0].data.num_comments;
      return commentCount;
    } catch (error) {
      console.error(error);
      return null;
    }
  } else {
    return null;
  }
}

export async function scrapeReddit(urlStr: string) {
  if (isRedditLink(urlStr)) {
    const contentType = "Reddit";
    const authorLink = await getPostAuthorName(urlStr);
    let postVotes = await getPostVotes(urlStr);
    const likes = postVotes?.upvotes;
    const dislikes = postVotes?.downvotes;
    const authorName = await getPostAuthorName(urlStr);
    // const title = getPostTitle(urlStr)

    const postCreationDate = await getPostCreationTime(urlStr);
    const postCreationTime = await getPostCreationTime(urlStr);

    // console.log('Reddit Post Creation Date: ', postCreationDate)
    // console.log('Reddit Author Name: ', redditAuthorName)
    return {
      contentType,
      authorLink,
      likes,
      dislikes,
      authorName,
      postCreationTime
    };
  }
}
