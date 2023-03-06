import type { ItemModel } from "@prisma/client";
import { sanitizeUrl } from "~/code/urlUtils";

import { prisma } from "~/db.server";
import { actorMayUpdateCollection, getCollection } from "./collection.server";

export type Item = {
  url: string;
  collection: string;
  comment: string;
  tags: string[];
  priority: number;
  created: Date;
  updated: Date;
};

export type ItemFront = {
  url: string;
  comment: string;
  tags: string[];
  priority: number;
};

function itemFromItemModel(input: ItemModel): Item {
  var tags = [];
  if (input.tags.length > 0) {
    tags = JSON.parse(input.tags);
  }
  return {
    url: input.url,
    collection: input.collection,
    comment: input.comment,
    tags: tags,
    priority: input.priority,
    created: input.created,
    updated: input.updated,
  };
}

function itemModelFromItem(input: Item): ItemModel {
  return {
    id: input.collection + input.url,
    url: input.url,
    collection: input.collection,
    comment: input.comment,
    tags: JSON.stringify(input.tags),
    priority: input.priority,
    created: input.created,
    updated: input.updated,
  };
}

export async function addItem(
  actorId: string,
  collectionId: string,
  url: string
): Promise<Item> {
  console.log(`addItem ${collectionId} ${url}`);
  const mayUpdate = await actorMayUpdateCollection(actorId, collectionId);
  if (!mayUpdate) {
    throw new Error("user does not have permissions");
  }

  const collection = await getCollection(collectionId);
  if (!collection) {
    throw new Error("invalid collection id " + collectionId);
  }
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    throw new Error("invalid url " + sanitizedUrl);
  }
  const x = await prisma.itemModel.create({
    data: {
      id: collectionId + sanitizedUrl,
      collection: collectionId,
      url: sanitizedUrl,
    },
  });
  return itemFromItemModel(x);
}

export async function updateItem(
  actorId: string,
  collectionId: string,
  input: ItemFront
): Promise<Item> {
  const mayUpdate = await actorMayUpdateCollection(actorId, collectionId);
  if (!mayUpdate) {
    throw new Error("user does not have permissions");
  }

  const id = collectionId + input.url;
  const x = await prisma.itemModel.update({
    where: { id: id },
    data: {
      comment: input.comment,
      tags: JSON.stringify(input.tags),
      priority: input.priority,
    },
  });
  const res = itemFromItemModel(x);
  return res;
}

export async function upsert(input: Item): Promise<Item> {
  const item = itemModelFromItem(input);
  const x = await prisma.itemModel.upsert({
    where: { id: item.id },
    create: {
      id: item.id,
      url: item.url,
      collection: item.collection,
      comment: item.comment,
      tags: item.tags,
      priority: item.priority,
    },
    update: {
      comment: item.comment,
      tags: item.tags,
      priority: item.priority,
    },
  });
  const res = itemFromItemModel(item);
  return res;
}

export async function getCollectionItems(collectonId: string): Promise<Item[]> {
  const itemModels = await prisma.itemModel.findMany({
    where: { collection: collectonId },
  });
  return itemModels.map(itemFromItemModel);
}
