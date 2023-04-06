import { Collection } from "@prisma/client"
import { Item } from "~/models/item.server"

export type CollectionJson = {
    collection: Collection,
    items: Array<Item>
}

export function assertValidCollection(obj: any): CollectionJson {
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid argument: expected an object.");
    }
  
    const { collection, items } = obj;
  
    if (!collection || typeof collection !== "object") {
      throw new Error(
        "Invalid collection object: expected an object, but got " +
          typeof collection +
          "."
      );
    }
  
    const collectionProps = ["id", "title", "description", "created", "updated"];
    const missingCollectionProps = collectionProps.filter(
      (prop) => !(prop in collection)
    );
  
    if (missingCollectionProps.length > 0) {
      throw new Error(
        "Invalid collection object: missing properties " +
          missingCollectionProps.join(", ") +
          "."
      );
    }
  
    if (typeof collection.created == "string"){
        collection.created = new Date(collection.created);
      }
    if (!(collection.created instanceof Date)) {
      throw new Error(
        "Invalid collection object: created property is not a Date object."
      );
    }
    if (typeof collection.updated == "string"){
        collection.updated = new Date(collection.updated);
      }
    if (!(collection.updated instanceof Date)) {
      throw new Error(
        "Invalid collection object: updated property is not a Date object."
      );
    }
  
    if (!Array.isArray(items)) {
      throw new Error(
        "Invalid items array: expected an array, but got " + typeof items + "."
      );
    }
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
  
      if (!item || typeof item !== "object") {
        throw new Error(
          "Invalid item at index " +
            i +
            ": expected an object, but got " +
            typeof item +
            "."
        );
      }
  
      const itemProps = [
        "url",
        "collection",
        "comment",
        "tags",
        "priority",
        "created",
        "updated",
        "status",
      ];
      const missingItemProps = itemProps.filter((prop) => !(prop in item));
  
      if (missingItemProps.length > 0) {
        throw new Error(
          "Invalid item at index " +
            i +
            ": missing properties " +
            missingItemProps.join(", ") +
            "."
        );
      }
  
      if (!Array.isArray(item.tags)) {
        throw new Error(
          "Invalid item at index " +
            i +
            ": tags property is not an array."
        );
      }
  
      if (typeof item.created == "string"){
        item.created = new Date(item.created);
      }
      if (!(item.created instanceof Date)) {
        throw new Error(
          "Invalid item at index " +
            i +
            ": created property is not a Date object."
        );
      }
  
      if (typeof item.updated == "string"){
        item.updated = new Date(item.updated);
      }
      if (!(item.updated instanceof Date)) {
        throw new Error(
          "Invalid item at index " +
            i +
            ": updated property is not a Date object."
        );
      }
    }
  
    return obj;
  }