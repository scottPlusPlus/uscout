import type { Collection } from "@prisma/client";

import { prisma } from "~/db.server";


export async function getCollection(id: string) {
  return prisma.collection.findUnique({ where: { id } });
}

export function createCollection({
  title,
  description,
}: Pick<Collection, "title" | "description">): Promise<Collection> {
  return prisma.collection.create({
    data: {
      title,
      description,
    },
  });
}

export function updateCollection(collection: Collection): Promise<Collection> {
  return prisma.collection.update({
    where: { id: collection.id },
    data: {
      title: collection.title,
      description: collection.description,
    },
  });
}
