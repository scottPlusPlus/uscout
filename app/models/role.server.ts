import { CollectionRoles } from "@prisma/client";
import { prisma } from "~/db.server";

export const ROLE_TYPE = {
    OWNER: "owner"
}

export async function getRoleType(actorId:string|undefined|null, collectionId:string):Promise<string|null> {
    if (!actorId){
        return null;
    }
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

export async function getRolesTable():Promise<CollectionRoles[]>{
    const roles = await prisma.collectionRoles.findMany({
        take: 100,
        orderBy: { collectionId: "desc" },
    });
    return roles;
}