import { Item } from "~/models/item.server";
import { ScrapedInfo } from "../datatypes/info";
import { SearchTermT } from "../datatypes/SearchTermT";

export function remapItemPriorities(
  items: Item[],
  infoMap: Map<string, ScrapedInfo>,
  searchParams: SearchTermT[],
  caseSensitive: Boolean = false
): Item[] {
  const includes = (strA: string, strB: string) => {
    return strA.toLowerCase().includes(strB.toLowerCase());
  };

  const prioritizedItems = items.map((item) => {
    item.priority = 0;
    searchParams.forEach((search) => {
      if (search.term.length == 0) {
        return;
      }

      item.tags.forEach((tag) => {
        if (includes(tag, search.term)) {
          item.priority += search.priority * 5;
        }
      });

      if (includes(item.comment, search.term)) {
        item.priority += search.priority;
      }
      if (includes(item.url, search.term)) {
        item.priority += search.priority;
      }

      const info = infoMap.get(item.url)!;
      if (includes(info.title, search.term)) {
        item.priority += search.priority;
      }
      if (includes(info.summary, search.term)) {
        item.priority += search.priority;
      }
    });
    //console.log(`${item.url} priority now ${item.priority}`);
    return item;
  });
  return prioritizedItems;
}

export function itemsFromRemixData(
  items: object[],
  infoMap: Map<string, ScrapedInfo>
): Item[] {
  const allItems:Item[] = items.map((item) => {
    return JSON.parse(JSON.stringify(item));
  });
  var loadedItems = allItems.filter((item) => {
    const info = infoMap.get(item.url);
    if (!info) {
      console.log("missing info for " + item.url);
      return false;
    }
    return true;
  });
  return loadedItems;
}
