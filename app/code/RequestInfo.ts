import { UInfo } from "@prisma/client";
import UInfoModel from "~/models/uinfo.server";
import scrapePage from "./ScrapePage.server";
import { twentyFourHoursAgo } from "./timeUtils";

import * as createError from 'http-errors';
import { sanitizeUrl } from "./urlUtils";


export async function requestSingle(url: string): Promise<UInfo> {
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl){
        return Promise.reject(createError.BadRequest("Invalid URL"));
    }

    const now = new Date();

    const existing = await UInfoModel.get(sanitizedUrl);
    if (existing){
        if (existing.checked > twentyFourHoursAgo() ){
            console.log("returning cached info for " + sanitizedUrl);
            return existing;
        }
    }

    const scrape = await scrapePage(sanitizedUrl);
    const newInfo:UInfo = {
        url: scrape.url,
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
    }
    return await UInfoModel.set(newInfo);
}

export function requestMany(urls: string[]): Promise<UInfo[]> {
    const promises = urls.map(u => {
        return requestSingle(u);
    });
    return Promise.all(promises);
}