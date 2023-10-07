import { SavedHtml } from "@prisma/client";
import { truncate } from "lodash";
import { nowUnixTimestamp } from "~/code/agnostic/timeUtils";
import { logger } from "~/code/log/logger";
import { prisma } from "~/db.server";

export async function getHtml(url: string):Promise<SavedHtml | null> {
  return prisma.savedHtml.findUnique({ where: { url } });
}

export async function saveHtml(url: string, value: string) {
  logger.info("save html for " + url);
  value = truncate(value, {length: 100000});
  const now = nowUnixTimestamp();
  return prisma.savedHtml.upsert({
    where: { url: url },
    update: {
      html: value,
      updatedUts: now,
    },
    create: {
      url: url,
      html: value,
      updatedUts: now,
    },
  });
}
