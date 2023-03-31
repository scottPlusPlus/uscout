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