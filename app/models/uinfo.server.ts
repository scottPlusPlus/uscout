import type { UInfo } from "@prisma/client";
import { sanitizeUrl } from "~/code/urlUtils";

import { prisma } from "~/db.server";
import { getRoleType } from "./role.server";

export type { UInfo } from "@prisma/client";

async function get(url: string): Promise<UInfo | null> {
  console.log("uinfo get");
  const sUrl = sanitizeUrl(url)!;
  return prisma.uInfo.findFirst({
    where: { url: sUrl },
  });
}

async function removeUinfo(actorId:string, url: string): Promise<void> {
  console.log("uinfo remove " + url);
  const role = await prisma.collectionRoles.findFirst({
    where: {
        userId: actorId,
      },
  });
  if (!role){
    throw new Error("Must be valid user to remove a thing");
  }
  const sUrl = sanitizeUrl(url)!;
  await prisma.uInfo.delete({
    where: { url: sUrl },
  });
}



async function set(info: UInfo): Promise<UInfo> {
  info.url = sanitizeUrl(info.url)!
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
      duration: info.duration,
      likes: info.likes,
      authorName: info.authorName,
      authorLink: info.authorLink,
      updated: new Date(),
      checked: new Date(),
    },
    create: {
      url: info.url,
      fullUrl: info.fullUrl,
      hash: info.hash,
      title: info.title,
      summary: info.summary,
      image: info.image,
      duration: info.duration,
      likes: info.likes,
      authorName: info.authorName,
      authorLink: info.authorLink,
    },
  });
}

async function getRecent(): Promise<UInfo[]> {
  return prisma.uInfo.findMany({
    take: 100,
    orderBy: { updated: "desc" },
  });
}

const UInfoModel = {
  get: get,
  set: set,
  getRecent: getRecent,
  removeUinfo: removeUinfo
};

export default UInfoModel;
