import type { UInfo } from "@prisma/client";
import { sanitizeUrl } from "~/code/urlUtils";
import { prisma } from "~/db.server";

export type { UInfo } from "@prisma/client";

export type UInfoV2 = {
  url:         string
  info: {
    fullUrl:     string,
    hash:        string,
    title:       string,
    summary:     string,
    image:       string,
    contentType: string|null,
    duration:    number|null,
    likes:       number|null,
    authorName:  string|null,
    authorLink:  string|null,
  },
  scrapeHistory: Array<scrapeHistory>,

}

type scrapeHistory = {
  timestamp: number,
  status: number,
}

async function getInfo(url:string):Promise<UInfoV2|null> {
  const sUrl = sanitizeUrl(url)!;
  const data = await prisma.uInfoDb.findFirst({
    where: { url: sUrl },
  });
  if (!data){
    return null;
  }
  const parsedData:UInfoV2 = JSON.parse(data.dataJson);
  return parsedData;
}


async function get(url: string): Promise<UInfo | null> {
  console.log("uinfo get " + url);
  const sUrl = sanitizeUrl(url)!;
  console.log("surl: " + sUrl);
  return prisma.uInfo.findFirst({
    where: { url: sUrl }
  });
}

async function removeUinfo(actorId: string, url: string): Promise<void> {
  console.log("uinfo remove " + url);
  console.log(". check role for " + actorId);
  const role = await prisma.collectionRoles.findFirst({
    where: {
      userId: actorId,
    },
  });
  if (!role) {
    throw new Error("Must be valid user to remove a thing");
  }
  const sUrl = sanitizeUrl(url)!;
  if (url != sUrl) {
    console.warn(`. Input ${url}  !=  ${sUrl}`);
  }
  console.log(`. Input ${url}  vs  ${sUrl}`);
  await prisma.uInfoDb.delete({
    where: { url: url },
  });
}

async function setInfo(info:UInfoV2):Promise<UInfoV2> {
  const url = info.url;
  console.log("saveInfo: " + info.url);
  const data = JSON.stringify(info);
  await prisma.uInfoDb.upsert({
    where: {url: url},
    update: {
      dataJson: data
    },
    create: {
      url: url,
      dataJson: data
    }
  });
  return info;
}

async function set(info: UInfo): Promise<UInfo> {
  info.url = sanitizeUrl(info.url)!;
  console.log(info.url + ": saving info");
  if (!info.image) {
    const existing = await get(info.url);
    if (existing) {
      if (existing.image) {
        info.image = existing.image;
      }
    }
  }

  return prisma.uInfo.upsert({
    where: { url: info.url },
    update: {
      fullUrl: info.fullUrl,
      hash: info.hash,
      title: info.title,
      summary: info.summary,
      image: info.image,
      contentType: info.contentType,
      duration: info.duration,
      likes: info.likes,
      //dislikes: info.dislikes,
      authorName: info.authorName,
      authorLink: info.authorLink,
      //publishedTime: info.publishedTime,
      updated: new Date(),
      checked: new Date()
    },
    create: {
      url: info.url,
      fullUrl: info.fullUrl,
      hash: info.hash,
      title: info.title,
      summary: info.summary,
      image: info.image,
      contentType: info.contentType,
      duration: info.duration,
      likes: info.likes,
      //dislikes: info.dislikes,
      authorName: info.authorName,
      authorLink: info.authorLink,
      //publishedTime: info.publishedTime
    }
  });
}

async function getRecent(): Promise<UInfoV2[]> {
  const infos = await prisma.uInfoDb.findMany({
    take: 100,
    orderBy: { updated: "desc" }
  });
  const res = infos.map(info => {
    const infoOut:UInfoV2 = JSON.parse(info.dataJson);
    return infoOut;
  });
  return res;
}

const UInfoModel = {
  getInfo: getInfo,
  setInfo: setInfo,
  getRecent: getRecent,
  removeUinfo: removeUinfo
};

export default UInfoModel;
