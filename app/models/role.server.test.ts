import { describe, it, expect, beforeEach, vi } from "vitest";
import { addUserToCollection, removeUserFromCollection } from "./role.server";
import { createCollection } from "./collection.server";
import { getUserByEmail } from "./user.server";

import { createUser, deleteUserByEmail } from "./user.server";

import { prisma } from "~/db.server";

test("Collection Contributors: test mocked db part1 ", async () => {
  const userObjectA = await getUserByEmail("userA@gmail.com");
  const userObjectB = await getUserByEmail("userB@gmail.com");
  const userObjectC = await getUserByEmail("userC@gmail.com");

  if (userObjectA) {
    await deleteUserByEmail(userObjectA.email);
  }
  if (userObjectB) {
    await deleteUserByEmail(userObjectB.email);
  }
  if (userObjectC) {
    await deleteUserByEmail(userObjectC.email);
  }

  await createUser("userA@gmail.com", "password");
  await createUser("userB@gmail.com", "password");
  await createUser("userC@gmail.com", "password");

  const userObject = await getUserByEmail("userC@gmail.com");
  console.log(userObject); // Trying to get user id

  //need user id to create collection
  //createCollection()

  const newCollectionData = {
    id: "123",
    title: "My New Collection",
    description: "A description of my new collection."
  };
});
