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
  const e = await exists(collectionId, sanitizedUrl);
  if (e) {
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

export async function upsertItem(actorId: string, input: Item): Promise<Item> {
  const e = await exists(input.collection, input.url);
  if (!e) {
    await addItem(actorId, input.collection, input.url);
  }
  return await updateItem(actorId, input.collection, input);
}

async function exists(collectionId: string, url: string): Promise<boolean> {
  const itemId = collectionId + url;
  const existingItem = await prisma.itemModel.findFirst({
    where: {
      id: itemId,
    },
  });
  return existingItem !== null;
}

export async function removeItem(
  actorId: string,
  collectionId: string,
  url: string
): Promise<void> {
  console.log("removeItem: " + url);
  const mayUpdate = await actorMayUpdateCollection(actorId, collectionId);
  if (!mayUpdate) {
    throw new Error("user does not have permissions");
  }
  const itemId = collectionId + url;
  const existingItem = await prisma.itemModel.findFirst({
    where: {
      id: itemId,
    },
  });
  var deleteKey = itemId;
  if (!existingItem){

    const exist2 = await prisma.itemModel.findFirst({
      where : {
        url: url,
        collection: collectionId
      }
    });
    if (exist2){
      deleteKey = exist2.id;
    } else {
      console.log("no match");
      return;
    }
  }
  console.log("item existss...  attempt remove " + deleteKey);
  await prisma.itemModel.delete({
    where: {
      id: deleteKey,
    },
  });
}

export async function getCollectionItems(collectonId: string): Promise<Item[]> {
  var itemModels = await prisma.itemModel.findMany({
    where: { collection: collectonId },
  });
  itemModels.forEach(item=> {
    console.log("have raw item: " + item.id + "  url: " + item.url);
  })
  itemModels = itemModels.filter((item) => item.status != STATUS.REJECTED);
  return itemModels.map(itemFromItemModel);
}
