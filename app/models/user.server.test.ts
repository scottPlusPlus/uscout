import { createUser, getUserById } from "./user.server";
import { createCollection, collectionsForUser } from "./collection.server";
import {
  getRoleType,
  addUserToCollection,
  removeUserFromCollection,
  ROLE_TYPE
} from "./role.server";

test("create a user and get its id", async () => {
  const createdUserA = await createUser("userA@gmail.com", "password");

  expect(createdUserA).toBeTruthy();
  expect(createdUserA.id).toBeTruthy();
  expect(createdUserA.id.length).toBeGreaterThan(0);

  const userAById = await getUserById(createdUserA.id);
  expect(userAById).toBeTruthy();
  expect(userAById!.email).toEqual(createdUserA.email);

  const newCollectionData = {
    id: "123",
    title: "My New Collection",
    description: "A description of my new collection."
  };
  await createCollection(newCollectionData, createdUserA.id);

  let userAPermissions = await getRoleType(
    createdUserA.id,
    newCollectionData.id
  );

  expect(userAPermissions).toBeTruthy();

  const createdUserB = await createUser("userB@gmail.com", "password");

  expect(createdUserB).toBeTruthy();
  expect(createdUserB.id).toBeTruthy();
  expect(createdUserB.id.length).toBeGreaterThan(0);

  const userBById = await getUserById(createdUserB.id);
  expect(userBById).toBeTruthy();
  expect(userBById!.email).toEqual(createdUserB.email);

  const createdUserC = await createUser("userC@gmail.com", "password");

  expect(createdUserC).toBeTruthy();
  expect(createdUserC.id).toBeTruthy();
  expect(createdUserC.id.length).toBeGreaterThan(0);

  const userCById = await getUserById(createdUserC.id);
  expect(userCById).toBeTruthy();
  expect(userCById!.email).toEqual(createdUserC.email);

  let userBPermissions = await getRoleType(
    createdUserB.id,
    newCollectionData.id
  );

  expect(userBPermissions).toEqual(null);

  const userCPermissions = await getRoleType(
    createdUserB.id,
    newCollectionData.id
  );
  expect(userCPermissions).toEqual(null);

  const UserB = {
    inputField: userBById!.email,
    roleField: ROLE_TYPE.CONTRIBUTOR
  };

  const UserBObjectString = JSON.stringify(UserB);
  await addUserToCollection(newCollectionData.id, UserBObjectString);

  userBPermissions = await getRoleType(createdUserB.id, newCollectionData.id);

  expect(userBPermissions).toBeTruthy();
  expect(userCPermissions).toBeNull();

  const userBObjectRemove = {
    id: newCollectionData.id + userBById?.id,
    collectionId: newCollectionData.id,
    userId: createdUserB?.id,
    role: ROLE_TYPE.CONTRIBUTOR
  };

  await removeUserFromCollection(JSON.stringify(userBObjectRemove));
  userBPermissions = await getRoleType(createdUserB.id, newCollectionData.id);
  let userCPermissionss = await getRoleType(
    createdUserC.id,
    newCollectionData.id
  );

  expect(userBPermissions).toEqual(null);
  expect(userCPermissionss).toEqual(null);
});
