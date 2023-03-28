import { UInfo } from "@prisma/client";
import UInfoModel from "~/models/uinfo.server";
import scrapePage from "./ScrapePage.server";
import { twentyFourHoursAgo } from "./timeUtils";

import * as createError from "http-errors";
import { sanitizeUrl } from "./urlUtils";

export async function requestSingle(url: string): Promise<UInfo|null> {

  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    return Promise.reject(createError.BadRequest("Invalid URL"));
  }

  const now = new Date();

  const existing = await UInfoModel.get(sanitizedUrl);
  if (existing) {
    console.log(sanitizedUrl + " already exists");
    if (existing.checked < twentyFourHoursAgo()) {
      console.log("but too old, triggering scrape");
      scrapeAndSavePage(sanitizedUrl);
    }
    console.log("returning cached info for " + sanitizedUrl);
    return existing;
  }
  const scrapePromise = scrapeAndSavePage(sanitizedUrl);
  const timeoutPromise = new Promise<null>((resolve, _) => {
    setTimeout(() => {
      console.log(`Timeout exceeded for ${sanitizedUrl}`);
      resolve(null);
    }, 10000);
  });
  return await Promise.race([scrapePromise, timeoutPromise]);
} 


async function scrapeAndSavePage(url: string): Promise<UInfo|null> {
  try {
    const scrape = await scrapePage(url);
    const now = new Date();
    const newInfo: UInfo = {
      url: url,
      fullUrl: scrape.url,
      hash: scrape.hash,
      title: scrape.title,
      summary: scrape.summary,
      image: scrape.image || "",
      contentType: scrape.contentType || null,
      duration: scrape.duration || null,
      likes: scrape.likes || null,
      authorName: scrape.authorName || null,
      authorLink: scrape.authorLink || null,
      created: now,
      updated: now,
      checked: now,
    };
    return await UInfoModel.set(newInfo);
  } catch (error:any) {
    console.log(error.message);
    return null
  }
}

export async function requestMany(urls: string[]): Promise<UInfo[]> {
  console.log("request many: " + JSON.stringify(urls));
  const promises = urls.map((u) => {
    return requestSingle(u);
  });
  const data = await Promise.all(promises);
  const res:UInfo[] = [];
  data.forEach(item => {
    if (item != null){
      res.push(item);
    }
  });
  return res;
}
