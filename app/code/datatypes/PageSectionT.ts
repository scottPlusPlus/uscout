import { ItemFront } from "~/models/item.server";

export type PageSectionT  = {
    title: string;
    body: string;
    links: Array<ItemFront>
}