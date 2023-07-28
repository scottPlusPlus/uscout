import { Collection } from "@prisma/client"
import { parseJson } from "~/code/jsonUtils";

export type CollectionSettings = {
    addItemSettings: string
}

export const ADD_ITEM_SETTING = {
    ADMINS: "admins",
    OPEN: "open",
    OPEN_SUGGEST: "open_suggest",
}

export function collectionSettings(collection:Collection):CollectionSettings {
    var settings = parseJson<CollectionSettings>(collection.settings);
    if (settings != null){
        return settings;
    }
    return defaultSettings();
}

export function defaultSettings():CollectionSettings {
    return {
        addItemSettings: ADD_ITEM_SETTING.OPEN
    }
}
