import { CollectionRoles } from "@prisma/client";
import { getIdByEmail } from "./user.server";

import { prisma } from "~/db.server";

export const ROLE_TYPE = {
  OWNER: "owner",
  CONTRIBUTOR: "contributor"
};

export type UserRole = "owner" | "contributor";

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
  collectionId: string,
  user: string
): Promise<void> {
  let assignedRole: string = "";
  const userObject = JSON.parse(user);
  let idByEmailObject = await getIdByEmail(userObject.inputField);
  if (idByEmailObject) {
    const contributorId = idByEmailObject.id;
    const email = idByEmailObject.email;

    switch (userObject.roleField) {
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
            userId: contributorId
          }
        },
        update: {
          role: assignedRole
        },
        create: {
          id: collectionId + contributorId,
          collectionId: collectionId,
          userId: contributorId,
          role: assignedRole
        }
      });
      console.log("User successfully added to the collection.");
    } catch (error) {
      console.error("Error adding user as owner:", error);
      console.error(
        `Error adding user with role ${userObject.roleField}:`,
        error
      );
    }
  } else {
    throw new Error("User not found by email.");
  }
}

// export async function removeUserFromCollection(
//   userId: string,
//   collectionId: string,
//   role: UserRole
// ): Promise<void> {
//   if (!userId && !collectionId) {
//     console.log("User ID or Collection ID is not provided.");
//     return;
//   }

//   switch (role) {
//     case "owner":
//       console.log("Unable to remove admin from collection.");
//       return;
//     case "contributor":
//       try {
//         await prisma.collectionRoles.delete({
//           where: {
//             collectionId_userId: {
//               collectionId: collectionId,
//               userId: userId
//             }
//           }
//         });
//         console.log("User successfully removed from the collection.");
//       } catch (error) {
//         console.error(
//           `Error removing user ${userId} from collection ${collectionId}:`,
//           error
//         );
//       }
//     default:
//       console.log("The specified role does not exist.");
//       throw new Error("The specified role does not exist.");
//   }
// }
