import { Collection, UInfo } from "@prisma/client";

export function cleanCollectionType(c:any):Collection {
    return c as Collection;
}

export function cleanUinfoType(x:any):UInfo {
    return x as UInfo;
}