import { ScrapedInfo } from "../datatypes/info";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;


export async function hydrateFromYoutube(scrape:ScrapedInfo):Promise<ScrapedInfo|null> {
  if (!isYouTubeVideo(scrape.url)) {
    return null;
  }
  const youtubeInfo = await scrapeYouTubeVideo(scrape.url);
  if (!youtubeInfo){
    return null;
  }
  scrape.contentType= youtubeInfo.contentType;
  scrape.likes = youtubeInfo.likes;
  scrape.authorLink = youtubeInfo.authorLink;
  scrape.authorName = youtubeInfo.authorName;
  return scrape;
}


async function scrapeYouTubeVideoImpl(videoId: string) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  const video = data.items[0];
  // const duration = video.contentDetails.duration;
  const likes = video.statistics.likeCount;
  const authorName = video.snippet.channelTitle;
  const authorLink = `https://www.youtube.com/channel/${video.snippet.channelId}`;
  const contentType = "Video";
  return {
    // duration,
    likes,
    authorName,
    authorLink,
    contentType
  };
}

export function isYouTubeVideo(url: string) {
  // Match YouTube watch URL format
  const watchPattern = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

  // Match YouTube short URL format
  const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]+)/;

  return watchPattern.test(url) || shortPattern.test(url);
}

export function getVideoIdFromUrl(url: string) {
  const regex = /(?:\?v=|\/embed\/|\/watch\?v=|\/\w+\/\w+\/)([\w-]{11})/;
  const match = url.match(regex);
  console.log("Match: ", match);
  if (match) {
    return match[1];
  }
  return null;
}

export async function scrapeYouTubeVideo(urlStr: string) {
    let videoId = getVideoIdFromUrl(urlStr);
    if (videoId === null) {
      return null;
    }
    console.log("VideoID: ", videoId);
    const scrapedVideoContent = await scrapeYouTubeVideoImpl(videoId);
    console.log("Scraped video Content: ", scrapedVideoContent);

    const contentType = scrapedVideoContent.contentType;
    const authorLink = scrapedVideoContent.authorLink;
    const likes = scrapedVideoContent.likes;
    const authorName = scrapedVideoContent.authorName;
    console.log("Content Type: ", contentType);
    console.log("Author Link: ", authorLink);
    console.log("Likes: ", likes);
    console.log("Author Name: ", authorName);

    return {
      contentType,
      authorLink,
      likes,
      // dislikes,
      authorName
    };
}
