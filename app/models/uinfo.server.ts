import type { UInfo } from "@prisma/client";

import { prisma } from "~/db.server";

export type { UInfo } from "@prisma/client";

async function get(url: string): Promise<UInfo | null> {
  console.log("uinfo get");
  return prisma.uInfo.findFirst({
    where: { url: url },
  });
}

async function set(info: UInfo): Promise<UInfo> {
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
      hash: info.hash,
      title: info.title,
      summary: info.summary,
      image: info.image,
      updated: new Date(),
      checked: new Date(),
    },
    create: {
      url: info.url,
      hash: info.hash,
      title: info.title,
      summary: info.summary,
      image: info.image,
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
};

export default UInfoModel;
