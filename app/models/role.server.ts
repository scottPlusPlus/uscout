import { prisma } from "~/db.server";

export const ROLE_TYPE = {
    OWNER: "owner"
}

export async function getRoleType(actorId:string, collectionId:string):Promise<string|null> {
    const role = await prisma.collectionRoles.findFirst({
        where: {
            userId: actorId,
            collectionId: collectionId
          },
    });
    if (!role){
        return null;
    }
    return role.role;
}