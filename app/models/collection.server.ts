import type { Collection } from "@prisma/client";

import { prisma } from "~/db.server";
import { getRoleType, ROLE_TYPE } from "./role.server";
import { CollectionJson } from "~/code/datatypes/collectionJson";
import { getCollectionItems, Item, removeItem, upsertItem } from "./item.server";
import { ADD_ITEM_SETTING, collectionSettings } from "~/code/datatypes/collectionSettings";

export async function getCollection(id: string) {
  return prisma.collection.findUnique({ where: { id } });
}

export async function collectionsForUser(userId: string): Promise<string[]> {
  const roles = await prisma.collectionRoles.findMany({
    where: {
      userId: userId,
    },
  });
  const collectionIds = roles.map(role => role.collectionId);
  return collectionIds;
}

export async function createCollection(
  { id, title, description }: Pick<Collection, "id" | "title" | "description">,
  userId: string
): Promise<Collection> {
  console.log(`create collection ${title} for ${userId}`);
  const create = prisma.collection.create({
    data: {
      id,
      title,
      description,
    },
  });

  const setRole = prisma.collectionRoles.create({
    data: {
      id: id + userId,
      collectionId: id,
      userId: userId,
      role: ROLE_TYPE.OWNER,
    },
  });

  const [collection, _] = await prisma.$transaction([create, setRole]);
  return collection;
}

export async function updateCollection(
  actorId: string,
  collection: Collection,
): Promise<Collection> {

  const mayUpdate = await actorMayUpdateCollection(actorId, collection.id);
  if (!mayUpdate){
    throw new Error("user does not have permissions");
  }

  return prisma.collection.update({
    where: { id: collection.id },
    data: {
      title: collection.title,
      description: collection.description,
      settings: collection.settings,
    },
  });
}

export async function overrideCollection(
  actorId: string,
  data: CollectionJson
){
  const mayUpdate = await actorMayUpdateCollection(actorId, data.collection.id);
  if (!mayUpdate){
    throw new Error("user does not have permissions");
  }
  await updateCollection(actorId, data.collection);

  const currentItems = await getCollectionItems(data.collection.id);
  const newUrls = new Set(data.items.map(item => item.url));
  const itemsToRemove = currentItems.filter(item => !newUrls.has(item.url));
  console.log("items to remove:\n" + JSON.stringify(currentItems));

  //intentionally done in sequence, in case of dupes
  for (const item of itemsToRemove) {
    await removeItem(actorId, data.collection.id, item.url);
  }
  for (const item of data.items) {
    await upsertItem(actorId, item);
  }
}

export async function actorMayUpdateCollection(actorId:string, collectionId:string):Promise<boolean>{
  const role = await getRoleType(actorId, collectionId);
  if (role?.toLocaleLowerCase() == ROLE_TYPE.OWNER.toLowerCase()){
    return true;
  }
  return false;
}
