import UInfoModel, { UInfoV2 } from "~/models/uinfo.server";
import scrapePage from "./ScrapePage.server";
import { twentyFourHoursAgoTimestamp } from "./timeUtils";

import * as createError from "http-errors";
import { sanitizeUrl } from "./urlUtils";

export async function requestSingle(url: string): Promise<UInfoV2 | null> {
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    return Promise.reject(createError.BadRequest("Invalid URL"));
  }

  const existing = await UInfoModel.getInfo(sanitizedUrl);
  if (existing) {
    console.log(sanitizedUrl + " already exists");
    const latestStatus = existing.scrapeHistory[0];
    if (latestStatus.status == 200) {
      if (latestStatus.timestamp < twentyFourHoursAgoTimestamp()) {
        console.log("but too old, triggering scrape");
        scrapeAndSavePage(sanitizedUrl);
      }
      console.log("returning cached info for " + sanitizedUrl);
      return existing;
    }
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

async function scrapeAndSavePage(url: string): Promise<UInfoV2 | null> {
  const now = Math.floor(Date.now() / 1000);
  try {
    const scrape = await scrapePage(url);

    const newInfo: UInfoV2 = {
      url: url,
      info: {
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
      },
      scrapeHistory: [
        {
          timestamp: now,
          status: 200,
        },
      ],
    };
    return await UInfoModel.setInfo(newInfo);
  } catch (error: any) {
    console.log(error.message);
    //TODO - save that we got an error
    return null;
  }
}

export async function requestMany(urls: string[]): Promise<UInfoV2[]> {
  console.log("request many: " + JSON.stringify(urls));
  const promises = urls.map((u) => {
    return requestSingle(u);
  });
  const data = await Promise.all(promises);
  const res: UInfoV2[] = [];
  data.forEach((item) => {
    if (item != null) {
      res.push(item);
    }
  });
  return res;
}
