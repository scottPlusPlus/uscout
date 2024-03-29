import type { ItemModel } from "@prisma/client";
import { requestSingle } from "~/code/scout/RequestInfo";
import { sanitizeUrl } from "~/code/urlUtils";

import { prisma } from "~/db.server";
import { actorMayUpdateCollection, getCollection } from "./collection.server";
import { ADD_ITEM_SETTING, collectionSettings } from "~/code/datatypes/collectionSettings";
import { ROLE_TYPE, getRoleType } from "./role.server";

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
  actorId: string|null,
  collectionId: string,
  url: string
): Promise<Item> {
  console.log(`ACTION: addItem ${collectionId} ${url}`);

  const collection = await getCollection(collectionId);
  if (!collection) {
    throw new Error("invalid collection id " + collectionId);
  }

  const settings = collectionSettings(collection);
  console.log("Add Item setttings = " + settings.addItemSettings);
  if (settings.addItemSettings == ADD_ITEM_SETTING.OPEN_SUGGEST){
    return suggestItem(collectionId, url);
  }
  if (settings.addItemSettings == ADD_ITEM_SETTING.ADMINS){
    const role = await getRoleType(actorId, collectionId);
    if (role?.toLocaleLowerCase() != ROLE_TYPE.OWNER.toLowerCase()){
      throw new Error("user does not have permissions");
    }
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
    if (uInfo?.info == null){
      throw("info is null");
    }
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
  const res = itemFromItemModel(x);
  console.log("add item success");
  return res;
}

export async function suggestItem(
  collectionId: string,
  url: string
): Promise<Item> {
  console.log("ACTION: suggest item: " + url);
  const collection = await getCollection(collectionId);
  if (!collection) {
    throw new Error("invalid collection id " + collectionId);
  }
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    throw new Error("invalid url " + url);
  }
  const itemId = collectionId + sanitizedUrl;
  const ex = await getCollectionItem(collectionId, sanitizedUrl);
  if (ex) {
    console.log("Item already exists " + sanitizedUrl);
    return ex;
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
  const res =  itemFromItemModel(x);
  console.log("suggest item success");
  return res;
}

export async function updateItem(
  actorId: string,
  collectionId: string,
  input: ItemFront
): Promise<Item> {  
  console.log("ACTION: Update Item: " + JSON.stringify(input));

  const mayUpdate = await actorMayUpdateCollection(actorId, collectionId);
  if (!mayUpdate) {
    console.log(" - bad permissions :/");
    throw new Error("user does not have permissions");
  }

  const id = collectionId + input.url;
  console.log(" - update item " + id);
  try {
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
    console.log(" - update item success");
    return res;
  } catch (e:any) {
    console.log(" - failed to update item:");
    console.error(e.message);
    throw e;
  }
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

async function getCollectionItem(collectionId: string, url: string): Promise<Item|null> {
  const itemId = collectionId + url;
  const existingItem = await prisma.itemModel.findFirst({
    where: {
      id: itemId,
    },
  });
  if (!existingItem){
    return null;
  }
  return itemFromItemModel(existingItem);
}

export async function removeItem(
  actorId: string,
  collectionId: string,
  url: string
): Promise<void> {
  console.log("ACTION: removeItem: " + url);
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
  itemModels = itemModels.filter((item) => item.status != STATUS.REJECTED);
  return itemModels.map(itemFromItemModel);
}
