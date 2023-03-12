import { parse } from 'node-html-parser'
import { createHash } from 'crypto'
import { PromiseQueues } from './PromiseQueue.server'
import { nowHHMMSS } from './timeUtils'

interface PageInfo {
  url: string
  hash: string
  title: string
  summary: string
  image?: string
  contentType?: string
  duration?: number
  likes?: number
  authorName?: string
  authorLink?: string
  subRedditName?: string
  redditPostId?: string
  redditPostTitle?: string
}

const domainThrottle = new PromiseQueues()

export default async function scrapePage (url: string): Promise<PageInfo> {
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

async function scrapePageImpl (urlStr: string): Promise<PageInfo> {
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
  let contentType
  let authorLink
  let likes
  let authorName

  // Reddit stuff
  let subRedditName
  let redditPostId
  let redditPostTitle
  let posterUsername
  let postThumbnail
  let postVotes
  let postCommentCount
  let postCreationDate
  let postText
  let postScore
  let redditAuthorName
  let postCreationTime
  let commentCount

  if (isYouTubeVideo(urlStr)) {
    let videoId = getVideoIdFromUrl(urlStr)
    console.log('VideoID: ', videoId)
    const scrapedVideoContent = await scrapeYouTubeVideo(videoId)
    console.log('Scraped video Content: ', scrapedVideoContent)
    contentType = 'Video'
    authorLink = scrapedVideoContent.authorLink
    likes = scrapedVideoContent.likes
    authorName = scrapedVideoContent.authorName
  }

  if (isRedditLink(urlStr)) {
    subRedditName = getSubredditName(urlStr)
    redditPostId = getPostId(urlStr)
    redditPostTitle = getPostTitle(urlStr)
    posterUsername = getPosterUsername(urlStr)
    postThumbnail = await getPostThumbnail(urlStr)
    postVotes = await getPostVotes(urlStr)
    // postCommentCount = getPostCommentsCount(urlStr)
    postCreationDate = await getPostCreationDate(urlStr)
    postText = await getPostText(urlStr)
    // postScore = getPostScore(urlStr)
    redditAuthorName = await getPostAuthorName(urlStr)
    postCreationTime = await getPostCreationTime(urlStr)
    commentCount = await getCommentCount(urlStr)

    console.log('Subreddit Name: ', subRedditName)
    console.log('Reddit Post Id: ', redditPostId)
    console.log('Reddit Post Title: ', redditPostTitle)
    console.log('Reddit Post Username: ', posterUsername)
    console.log('Reddit Post Thumbnail: ', postThumbnail)
    console.log('Reddit Post Votes: ', postVotes)
    console.log('Reddit Post Comment Count: ', postCommentCount)
    console.log('Reddit Post Creation Date: ', postCreationDate)
    console.log('Reddit Post text: ', postText)
    console.log('Reddit Post Score: ', postScore)
    console.log('Reddit Author Name: ', redditAuthorName)
    console.log('Reddit Creation Time: ', postCreationTime)
    console.log('Reddit Comment Count: ', commentCount)
  }

  return {
    url,
    hash,
    title,
    summary,
    image,
    contentType,
    authorLink,
    likes,
    authorName
  }
}

async function scrapeYouTubeVideo (videoId: string) {
  const API_KEY = 'API_KEY'
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${API_KEY}`

  const response = await fetch(apiUrl)
  const data = await response.json()
  const video = data.items[0]
  // const duration = video.contentDetails.duration;
  const likes = video.statistics.likeCount
  const authorName = video.snippet.channelTitle
  const authorLink = `https://www.youtube.com/channel/${video.snippet.channelId}`
  const contentType = 'Video'

  return {
    // duration,
    likes,
    authorName,
    authorLink,
    contentType
  }
}

function isYouTubeVideo (url: string) {
  // Match YouTube watch URL format
  const watchPattern = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/

  // Match YouTube short URL format
  const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]+)/

  return watchPattern.test(url) || shortPattern.test(url)
}

function getVideoIdFromUrl (url: string) {
  const regex = /(?:\?v=|\/embed\/|\/watch\?v=|\/\w+\/\w+\/)([\w-]{11})/
  const match = url.match(regex)
  console.log('Match: ', match)
  if (match) {
    return match[1]
  }
  return null
}

function isRedditLink (url: string) {
  // Create a regular expression to match Reddit links
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/([rR]\/\w+|u\/\w+|comments\/\w+)/

  // Test the URL against the regular expression
  return regex.test(url)
}

function getSubredditName (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/r\/(\w+)/
  const match = url.match(regex)
  if (match) {
    return match[1]
  } else {
    return null
  }
}

function getPostId (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/comments\/(\w+)/
  const match = url.match(regex)
  if (match) {
    return match[1]
  } else {
    return null
  }
}

function getPostTitle (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/(\w+)\//
  const match = url.match(regex)
  if (match) {
    return match[1].replace(/_/g, ' ')
  } else {
    return null
  }
}

function getPosterUsername (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\/(\w+)\//
  const match = url.match(regex)
  if (match) {
    return match[1]
  } else {
    return null
  }
}

async function getPostThumbnail (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    return fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const thumbnail = data[0].data.children[0].data.thumbnail
        return thumbnail
      })
  } else {
    return null
  }
}

async function getPostVotes (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    return fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const upvotes = data[0].data.children[0].data.ups
        const downvotes = data[0].data.children[0].data.downs
        return { upvotes, downvotes }
      })
  } else {
    return null
  }
}

// function getPostCommentsCount (url: ExecFileOptionsWithStringEncoding) {
//   const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
//   const match = url.match(regex)
//   if (match) {
//     const postUrl = match[0]
//     const jsonUrl = postUrl + '.json'
//     return fetch(jsonUrl)
//       .then(response => response.json())
//       .then(data => {
//         const commentsCount = data[0].data.children[0].data.num_comments
//         return commentsCount
//       })
//   } else {
//     return null
//   }
// }

async function getPostCreationDate (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    return fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const creationDate = new Date(
          data[0].data.children[0].data.created_utc * 1000
        )
        return creationDate
      })
  } else {
    return null
  }
}

async function getPostText (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    return fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const postText = data[0].data.children[0].data.selftext
        return postText
      })
  } else {
    return null
  }
}

// function getPostScore (url: ScrollSetting) {
//   const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
//   const match = url.match(regex)
//   if (match) {
//     const postUrl = match[0]
//     const jsonUrl = postUrl + '.json'
//     return fetch(jsonUrl)
//       .then(response => response.json())
//       .then(data => {
//         const postScore = data[0].data.children[0].data.score
//         return postScore
//       })
//   } else {
//     return null
//   }
// }

async function getPostAuthorName (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    return fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const authorName = data[0].data.children[0].data.author
        return authorName
      })
  } else {
    return null
  }
}

async function getPostCreationTime (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    return fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        const postCreationTime = data[0].data.children[0].data.created_utc
        return postCreationTime
      })
  } else {
    return null
  }
}

async function getCommentCount (url: string) {
  const regex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r\/\w+\/)?comments\/\w+\/\w+\//
  const match = url.match(regex)
  if (match) {
    const postUrl = match[0]
    const jsonUrl = postUrl + '.json'
    try {
      const response = await fetch(jsonUrl)
      const data = await response.json()
      const commentCount = data[0].data.children[0].data.num_comments
      return commentCount
    } catch (error) {
      console.error(error)
      return null
    }
  } else {
    return null
  }
}
