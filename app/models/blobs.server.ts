import { prisma } from "~/db.server";

export async function getBlob(key: string) {
  return prisma.blobs.findUnique({ where: { key } });
}

export async function setBlob(key: string, value: string) {
  return prisma.blobs.upsert({
    where: { key: key },
    update: {
      value: value,
    },
    create: {
      key: key,
      value: value,
    },
  });
}
