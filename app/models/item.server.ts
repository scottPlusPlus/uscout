import type { ItemModel } from "@prisma/client";
import { requestSingle } from "~/code/RequestInfo";
import { sanitizeUrl } from "~/code/urlUtils";

import { prisma } from "~/db.server";
import { actorMayUpdateCollection, getCollection } from "./collection.server";

const STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
};

export type Item = {
  url: string;
  collection: string;
  comment: string;
  tags: string[];
  priority: number;
  created: Date;
  updated: Date;
  status: string;
};

export type ItemFront = {
  url: string;
  comment: string;
  tags: string[];
  priority: number;
  status: string;
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
    status: input.status,
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
    status: input.status,
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
  const itemId = collectionId + sanitizedUrl;
  const existingItem = await prisma.itemModel.findFirst({
    where: {
      id: itemId,
    },
  });
  if (existingItem) {
    throw new Error("Item already exists " + sanitizedUrl);
  }

  try {
    const uInfo = await requestSingle(url);
  } catch (err: any) {
    console.log("failed to get info for " + url + ":  " + err.message);
    throw new Error("Sorry, we had an error with that url.  check server logs");
  }

  const x = await prisma.itemModel.create({
    data: {
      id: itemId,
      collection: collectionId,
      url: sanitizedUrl,
      status: STATUS.APPROVED,
    },
  });
  return itemFromItemModel(x);
}

export async function suggestItem(
  collectionId: string,
  url: string
): Promise<Item> {
  const collection = await getCollection(collectionId);
  if (!collection) {
    throw new Error("invalid collection id " + collectionId);
  }
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    throw new Error("invalid url " + url);
  }
  const itemId = collectionId + sanitizedUrl;
  const existingItem = await prisma.itemModel.findFirst({
    where: {
      id: itemId,
    },
  });
  if (existingItem) {
    throw new Error("Item already exists " + sanitizedUrl);
  }

  try {
    const uInfo = await requestSingle(url);
  } catch (err: any) {
    console.log("failed to get info for " + url + ":  " + err.message);
    throw new Error("Sorry, we had an error with that url.  check server logs");
  }

  const x = await prisma.itemModel.create({
    data: {
      id: itemId,
      collection: collectionId,
      url: sanitizedUrl,
      status: STATUS.PENDING,
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

  console.log("Update Item: " + JSON.stringify(input));

  const id = collectionId + input.url;
  const x = await prisma.itemModel.update({
    where: { id: id },
    data: {
      comment: input.comment,
      tags: JSON.stringify(input.tags),
      priority: input.priority,
      status: input.status,
    },
  });
  const res = itemFromItemModel(x);
  return res;
}

// export async function upsert(input: Item): Promise<Item> {
//   const item = itemModelFromItem(input);
//   const x = await prisma.itemModel.upsert({
//     where: { id: item.id },
//     create: {
//       id: item.id,
//       url: item.url,
//       collection: item.collection,
//       comment: item.comment,
//       tags: item.tags,
//       priority: item.priority,
//     },
//     update: {
//       comment: item.comment,
//       tags: item.tags,
//       priority: item.priority,
//     },
//   });
//   const res = itemFromItemModel(item);
//   return res;
// }

export async function getCollectionItems(collectonId: string): Promise<Item[]> {
  var itemModels = await prisma.itemModel.findMany({
    where: { collection: collectonId },
  });
  itemModels = itemModels.filter((item) => item.status != STATUS.REJECTED);
  return itemModels.map(itemFromItemModel);
}
