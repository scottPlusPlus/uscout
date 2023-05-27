import { ItemFront } from "~/models/item.server";

export type PageSectionT  = {
    title: string;
    size?: number;
    body: string;
    links: Array<ItemFront>
    addSeparator?:boolean;
}