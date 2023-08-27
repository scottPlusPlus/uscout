import { CollectionRoles } from "@prisma/client";
import { prisma } from "~/db.server";

export const ROLE_TYPE = {
  OWNER: "owner",
  CONTRIBUTOR: "contributor"
};

type UserRole = "owner" | "contributor";

export async function getRoleType(
  actorId: string | undefined | null,
  collectionId: string
): Promise<string | null> {
  if (!actorId) {
    return null;
  }
  const role = await prisma.collectionRoles.findFirst({
    where: {
      userId: actorId,
      collectionId: collectionId
    }
  });
  if (!role) {
    return null;
  }
  return role.role;
}

export async function getRolesTable(): Promise<CollectionRoles[]> {
  const roles = await prisma.collectionRoles.findMany({
    take: 100,
    orderBy: { collectionId: "desc" }
  });
  return roles;
}

export async function addUserToCollection(
  userId: string,
  collectionId: string,
  role: UserRole
): Promise<void> {
  if (!userId) {
    console.log("User ID is not provided.");
  }

  let assignedRole: string = "";

  switch (role) {
    case "owner":
      assignedRole = ROLE_TYPE.OWNER;
      break;
    case "contributor":
      assignedRole = ROLE_TYPE.CONTRIBUTOR;
      break;
    default:
      console.log("The specified role does not exist.");
      throw new Error("The specified role does not exist.");
  }

  try {
    await prisma.collectionRoles.upsert({
      where: {
        collectionId_userId: {
          collectionId: collectionId,
          userId: userId
        }
      },
      update: {
        role: assignedRole
      },
      create: {
        id: collectionId + userId,
        collectionId: collectionId,
        userId: userId,
        role: assignedRole
      }
    });
    console.log("User successfully added to the collection.");
  } catch (error) {
    console.error("Error adding user as owner:", error);
    console.error(`Error adding user with role ${role}:`, error);
  }
}

export async function removeUserFromCollection(
  userId: string,
  collectionId: string,
  role: UserRole
): Promise<void> {
  if (!userId && !collectionId) {
    console.log("User ID or Collection ID is not provided.");
    return;
  }

  switch (role) {
    case "owner":
      console.log("Unable to remove admin from collection.");
      return;
    case "contributor":
      try {
        await prisma.collectionRoles.delete({
          where: {
            collectionId_userId: {
              collectionId: collectionId,
              userId: userId
            }
          }
        });
        console.log("User successfully removed from the collection.");
      } catch (error) {
        console.error(
          `Error removing user ${userId} from collection ${collectionId}:`,
          error
        );
      }
    default:
      console.log("The specified role does not exist.");
      throw new Error("The specified role does not exist.");
  }
}
