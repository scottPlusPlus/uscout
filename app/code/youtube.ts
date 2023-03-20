export async function scrapeYouTubeVideo(videoId: string) {
    const API_KEY = ''
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

export function isYouTubeVideo(url: string) {
    // Match YouTube watch URL format
    const watchPattern = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/

    // Match YouTube short URL format
    const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]+)/

    return watchPattern.test(url) || shortPattern.test(url)
}

export function getVideoIdFromUrl(url: string) {
    const regex = /(?:\?v=|\/embed\/|\/watch\?v=|\/\w+\/\w+\/)([\w-]{11})/
    const match = url.match(regex)
    console.log('Match: ', match)
    if (match) {
        return match[1]
    }
    return null
}
