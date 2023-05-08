// TODO obviously not safe :p
// manage account https://app.screenshotone.com
// hooked up through Scott's google account (goro)
const API_KEY = "HC1mlpeoccvR6A";

export default async function getScreenshot(url: string): Promise<string> {
  const encodedUrl = encodeURIComponent(url);

  const endpoint =
    `https://api.screenshotone.com/take?access_key=${API_KEY}&url=${encodedUrl}` +
    `&device_scale_factor=1` +
    `&format=jpg` +
    `&block_ads=true` +
    `&block_cookie_banners=true` +
    `&block_trackers=true` +
    `&delay=5` +
    `&cache=true` +
    `&cache_ttl=604800`;
  const _ = await fetch(endpoint);

  //TODO - maybe we want to store the actual image ourselves?
  return endpoint;
}
