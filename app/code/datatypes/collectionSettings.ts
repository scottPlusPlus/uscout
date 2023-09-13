import { Collection } from "@prisma/client"
import { parseJson } from "~/code/jsonUtils";
import { fillEmptyFields } from "../agnostic/objectUtils";

export type CollectionSettings = {
    addItemSettings: string,
    apiKeys:Array<String>,
}

export const ADD_ITEM_SETTING = {
    ADMINS: "admins",
    OPEN: "open",
    OPEN_SUGGEST: "open_suggest",
}

export function collectionSettings(collection:Collection):CollectionSettings {
    var settings = parseJson<CollectionSettings>(collection.settings);
    const dSettings = defaultSettings();
    if (!settings){
        return dSettings;
    }
    fillEmptyFields(settings, dSettings);
    return settings;
}

export function defaultSettings():CollectionSettings {
    return {
        addItemSettings: ADD_ITEM_SETTING.ADMINS,
        apiKeys:[]
    }
}
