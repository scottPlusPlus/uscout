import UInfoModel from "~/models/uinfo.server";
import scrapePage from "./ScrapePage.server";
import { nowHHMMSS, nowUnixTimestamp, xHoursAgoUts } from "../agnostic/timeUtils";

import * as createError from "http-errors";
import { sanitizeUrl } from "../urlUtils";
import { ScrapedInfo, UInfoV2 } from "../datatypes/info";
import { AsyncQueue } from "../agnostic/AsyncQueue";
import { wait } from "../agnostic/coreUtils";
import { fillEmptyFields } from "../agnostic/objectUtils";
import { logger } from "../log/logger";

const staleScrapeQueue = new AsyncQueue();

export async function requestSingle(url: string): Promise<UInfoV2 | null> {
  logger.info("requestUrl: " + url);
  try {
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) {
      throw createError.BadRequest("Invalid URL");
    }

    const prevScrape = await UInfoModel.getInfo(sanitizedUrl);
    if (prevScrape) {
      console.log(" - " + sanitizedUrl + " already exists");
      const latestStatus = prevScrape.scrapeHistory[0];
      if (latestStatus.status == 200) {
        if (latestStatus.timestamp < xHoursAgoUts(24)) {
          console.log(" - - but too old, kicking to scrape queue");
          const doScrape = async () => {
            await wait(10 * 1000);
            console.log("scraping from stale scrape queue");
            await scrapeAndSavePage(sanitizedUrl, prevScrape);
          };
          staleScrapeQueue.enqueue(doScrape);
        }
        logger.info(" - - returning cached info for " + sanitizedUrl);
        return prevScrape;
      } else {
        logger.info(" - - previous scrape had an error");
        if (latestStatus.timestamp > nowUnixTimestamp() - 3600) {
          logger.info(" - - error not long ago. returning null");
          return null;
        }
      }
    }
    const scrapePromise = scrapeAndSavePage(sanitizedUrl, null);
    const timeoutPromise = new Promise<null>((resolve, reject) => {
      setTimeout(() => {
        reject(`Timeout exceeded for ${sanitizedUrl}`);
      }, 20 * 1000);
    });
    return await Promise.race([scrapePromise, timeoutPromise]);
  } catch (err: any) {
    logger.warn(`requestUrl ${url} failed: ${err.message}`);
    return Promise.reject(err);
  }
}

async function scrapeAndSavePage(
  url: string,
  prevScrape: UInfoV2 | null
): Promise<UInfoV2 | null> {
  const now = nowUnixTimestamp();
  var doExpensive = true;
  var newLatestExpensive = now;
  if (prevScrape) {
    if (prevScrape.latestExpensiveUts) {
      if (prevScrape.latestExpensiveUts > xHoursAgoUts(7 * 24)) {
        doExpensive = false;
        newLatestExpensive = prevScrape.latestExpensiveUts;
      }
    }
  }

  try {
    const scrape = await scrapePage(url, doExpensive);
    if (prevScrape && prevScrape.info) {
      fillEmptyFields(scrape, prevScrape.info);
    }

    const newInfo: UInfoV2 = {
      url: url,
      info: scrape,
      scrapeHistory: [
        {
          timestamp: now,
          status: 200,
        },
      ],
      latestExpensiveUts: newLatestExpensive,
    };
    const r = await UInfoModel.setInfo(newInfo);
    logger.info(`${nowHHMMSS()}: successful scrape for ${url}`, r);
    return r;
  } catch (error: any) {
    logger.warn(`${nowHHMMSS()}: err with scrapeAndSavePage for ${url}:  ${error.message}`);
    console.log("saving that we got an error");
    const newInfo: UInfoV2 = {
      url: url,
      info: null,
      scrapeHistory: [
        {
          timestamp: now,
          status: 400,
        },
      ],
      latestExpensiveUts: newLatestExpensive,
    };
    await UInfoModel.setInfo(newInfo);
    return null;
  }
}

export async function requestMany(urls: string[]): Promise<ScrapedInfo[]> {
  logger.info("request many", urls);
  const promises = urls.map((u) => {
    return requestSingle(u);
  });
  const data = await Promise.all(promises);
  const res: ScrapedInfo[] = [];
  data.forEach((item) => {
    if (item != null) {
      if (item.info != null) {
        res.push(item.info);
      }
    }
  });
  return res;
}
