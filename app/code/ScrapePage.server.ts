import { parse } from 'node-html-parser'
import { createHash } from 'crypto'
import { PromiseQueues } from './PromiseQueue.server'
import { nowHHMMSS } from './timeUtils'
import * as reddit from './reddit'
import * as youtube from './youtube'

interface PageInfo {
  url: string
  hash: string
  title: string
  summary: string
  image?: string
  contentType?: string
  duration?: number
  likes?: number
  dislikes?: number
  authorName?: string
  authorLink?: string
}

const domainThrottle = new PromiseQueues()

export default async function scrapePage(url: string): Promise<PageInfo> {
  console.log(url + ': starting fetch')
  try {
    return await scrapePageImpl('https://' + url)
  } catch (error) {
    try {
      return await scrapePageImpl('http://' + url)
    } catch (err2) {
      throw error
    }
  }
}

async function scrapePageImpl(urlStr: string): Promise<PageInfo> {
  const urlObj = new URL(urlStr)
  const domain = urlObj.hostname
  console.log(`${urlStr}: enque domain ${domain}  ${nowHHMMSS()}`)
  await domainThrottle.enqueue(domain)
  console.log(`${urlStr}: sending fetch ${nowHHMMSS()}`)
  const response = await fetch(urlStr)
  const html = await response.text()

  const hash = createHash('sha256')
    .update(html)
    .digest('hex')

  const root = parse(html)
  const canonicalLink = root.querySelector('link[rel="canonical"]')
  const canonUrl = canonicalLink?.getAttribute('href')
  const url = canonUrl ? canonUrl : urlStr
  const title = root.querySelector('title')?.text || ''
  const summary =
    root.querySelector('meta[name="description"]')?.getAttribute('content') ||
    ''

  const ogImage = root
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content')
  const twitterImage = root
    .querySelector('meta[name="twitter:image"]')
    ?.getAttribute('content')
  const image = ogImage || twitterImage

  // Youtube stuff
  // let contentType
  let authorLink
  let likes
  let authorName

  // Reddit
  let subRedditName
  let dislikes

  let redditPostTitle
  let postThumbnail
  let postVotes
  let postCreationDate
  let redditAuthorName
  let postCreationTime
  let commentCount

  if (youtube.isYouTubeVideo(urlStr)) {
    let videoId = youtube.getVideoIdFromUrl(urlStr)
    console.log('VideoID: ', videoId)
    const scrapedVideoContent = await youtube.scrapeYouTubeVideo(videoId)
    console.log('Scraped video Content: ', scrapedVideoContent)

    const contentType = scrapedVideoContent.contentType
    const authorLink = scrapedVideoContent.authorLink
    const likes = scrapedVideoContent.likes
    const authorName = scrapedVideoContent.authorName
    console.log('Content Type: ', contentType)
    console.log('Author Link: ', authorLink)
    console.log('Likes: ', likes)
    console.log('Author Name: ', authorName)


    return {
      url,
      hash,
      title,
      summary,
      image,
      contentType,
      authorLink,
      likes,
      // dislikes,
      authorName
    }
  }

  if (reddit.isRedditLink(urlStr)) {

    const contentType = 'Reddit'
    const authorLink = await reddit.getPostAuthorName(urlStr)
    let postVotes = await reddit.getPostVotes(urlStr)
    const likes = postVotes?.upvotes
    const dislikes = postVotes?.downvotes
    const authorName = await reddit.getPostAuthorName(urlStr)
    const title = reddit.getPostTitle(urlStr)



    subRedditName = reddit.getSubredditName(urlStr)
    postThumbnail = await reddit.getPostThumbnail(urlStr)
    postVotes = await reddit.getPostVotes(urlStr)
    postCreationDate = await reddit.getPostCreationTime(urlStr)
    postCreationTime = await reddit.getPostCreationTime(urlStr)
    commentCount = await reddit.getCommentCount(urlStr)

    console.log('Subreddit Name: ', subRedditName)
    console.log('Reddit Post Title: ', redditPostTitle)
    console.log('Reddit Post Thumbnail: ', postThumbnail)
    console.log('Reddit Post Votes: ', postVotes)
    console.log('Reddit Post Creation Date: ', postCreationDate)
    console.log('Reddit Author Name: ', redditAuthorName)
    console.log('Reddit Creation Time: ', postCreationTime)
    console.log('Reddit Comment Count: ', commentCount)
    return {
      url,
      hash,
      title,
      summary,
      image,
      contentType,
      authorLink,
      likes,
      dislikes,
      authorName
    }
  }

  return {
    url,
    hash,
    title,
    summary,
    image,
    // contentType,
    authorLink,
    likes,
    dislikes,
    authorName
  }
}


// Separate this out to another file
