import type { Collection } from "@prisma/client";

import { prisma } from "~/db.server";
import { getRoleType, ROLE_TYPE } from "./role.server";

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
    },
  });
}

export async function actorMayUpdateCollection(actorId:string, collectionId:string):Promise<boolean>{
  const role = await getRoleType(actorId, collectionId);
  if (role == ROLE_TYPE.OWNER){
    return true;
  }
  return false;
}
