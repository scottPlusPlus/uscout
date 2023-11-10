import { Collection } from "@prisma/client";
import {
  updateCollection,
  overrideCollection
} from "~/models/collection.server";
import {
  ItemFront,
  addItem,
  removeItem,
  suggestItem,
  updateItem
} from "~/models/item.server";
import {
  addUserToCollection,
  removeUserFromCollection
} from "~/models/role.server";
import {
  CollectionJson,
  assertValidCollection
} from "./datatypes/collectionJson";

export const ACTION_TYPES = {
  MAKE_SUGGESTION: "suggestion",
  ADMIN_ADD_ITEM: "addItem",
  UPDATE_ITEM: "updateItem",
  UPDATE_COLLECTION: "collection",
  OVERRIDE_COLLECTION: "override",
  REMOVE_ITEM: "removeItem",
  CREATE_BLOB: "createBlob",
  UPDATE_BLOB: "updateBlob",
  CREATE_USER: "createUser",
  DELETE_USER: "deleteuser"
};

export async function collectionAction(
  actor: string,
  collectionId: string,
  actionType: string,
  inputData: string
) {
  console.log(`collectionAction: ${actionType} ${inputData}`);

  var err: string | null = null;
  var data: Object | null = null;
  var redirect: string | null = null;
  try {
    if (actionType == ACTION_TYPES.MAKE_SUGGESTION) {
      data = await actionAddSubmission(collectionId, inputData);
    } else if (actionType == ACTION_TYPES.ADMIN_ADD_ITEM) {
      data = await actionAdminAddItem(collectionId, actor, inputData);
    } else if (actionType == ACTION_TYPES.UPDATE_ITEM) {
      data = await actionUpdateItem(collectionId, actor, inputData);
    } else if (actionType == ACTION_TYPES.UPDATE_COLLECTION) {
      data = await actionUpdateCollection(collectionId, actor, inputData);
    } else if (actionType == ACTION_TYPES.OVERRIDE_COLLECTION) {
      await actionOverrideCollection(collectionId, actor, inputData);
      redirect = "/c/" + collectionId;
    } else if (actionType == ACTION_TYPES.REMOVE_ITEM) {
      await actionRemoveItem(collectionId, actor, inputData);
      redirect = "/c/" + collectionId;
    } else if (actionType == ACTION_TYPES.CREATE_USER) {
      await actionAdminAddUser(collectionId, inputData);
      redirect = "/c/" + collectionId;
    } else if (actionType == ACTION_TYPES.DELETE_USER) {
      await actionAdminDeleteUser(inputData);
      redirect = "/c/" + collectionId;
    } else {
      throw "invalid action";
    }
  } catch (error: any) {
    err = error.message;
    console.error("Action failed: " + err);
  }
  return {
    data: data,
    err: err,
    redirect: redirect
  };
}

async function actionAddSubmission(
  cid: string,
  inputData: string
): Promise<Object | null> {
  try {
    await suggestItem(cid, inputData);
    return null;
  } catch (err: any) {
    const errMsg = err.message ? err.message : "Error ¯_(¬_¬)_/¯";
    throw errMsg;
  }
}

async function actionAdminAddItem(
  cid: string,
  actor: string | null | undefined,
  inputData: string
): Promise<Object | null> {
  if (!actor) {
    actor = null;
  }
  return await addItem(actor, cid, inputData);
}

async function actionUpdateItem(
  cid: string,
  actor: string | undefined,
  inputData: string
): Promise<Object | null> {
  if (actor == null) {
    throw new Error("Must be logged in");
  }
  try {
    const itemFront: ItemFront = JSON.parse(inputData);
    return await updateItem(actor, cid, itemFront);
  } catch (e: any) {
    throw e;
  }
}

async function actionUpdateCollection(
  cid: string,
  actor: string | undefined,
  inputData: string
): Promise<Object> {
  if (actor == null) {
    throw new Error("Must be logged in");
  }
  const collection: Collection = JSON.parse(inputData);
  return await updateCollection(actor, collection);
}

async function actionOverrideCollection(
  cid: string,
  actor: string | undefined,
  inputData: string
): Promise<void> {
  if (actor == null) {
    throw new Error("Must be logged in");
  }
  const collection: CollectionJson = assertValidCollection(
    JSON.parse(inputData)
  );
  await overrideCollection(actor, collection);
}

async function actionRemoveItem(
  cid: string,
  actor: string | undefined,
  inputData: string
): Promise<void> {
  if (actor == null) {
    throw new Error("Must be logged in");
  }
  const itemUrl = inputData;
  return await removeItem(actor, cid, itemUrl);
}

async function actionAdminAddUser(cid: string, user: string): Promise<void> {
  await addUserToCollection(cid, user);
}

async function actionAdminDeleteUser(user: string): Promise<void> {
  await removeUserFromCollection(user);
}
