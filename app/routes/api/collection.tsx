import { ActionArgs, json, LoaderArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { collectionSettings } from "~/code/datatypes/collectionSettings";
import { logger } from "~/code/log/logger";
import { requestMany } from "~/code/scout/RequestInfo";
import { sanitizeUrl } from "~/code/urlUtils";
import { getCollection } from "~/models/collection.server";
import { getCollectionItems } from "~/models/item.server";

export const loader = async ({ request }: LoaderArgs) => {
    // handle "OPTIONS" request
    console.log("handling api collection " + request.method);
    return json({ success: true }, 200);
  };

export const action = async ({ request }: ActionArgs) => {
    console.log("api collection Action " + request.method);
    try {
      const data = await request.json();
      console.log("data: " + data);

      const j = JSON.stringify(data);
      console.log(j);
      const collectionId:string = data.cid;
      invariant(collectionId, "Must pass a 'cid' parameter with cid of collection you want");
      const key:string = data.key;
      invariant(key, "Must pass a 'key' parameter with valid api key for that collection");
  
      const collection = await getCollection(collectionId);
      if (collection == null) {
        throw new Response("Invalid key", {status:401});
      }

      const settings = collectionSettings(collection);
      if (!settings.apiKeys.includes(key)){
        throw new Response("Invalid key", {status:401});
      }

      const items = await getCollectionItems(collectionId);
      const urls = items.map((i) => sanitizeUrl(i.url)!);
      const infos = await requestMany(urls);

      return json({ collection: collection, items: items, infos: infos });
    } catch (err:any){
      logger.error(`api collection err! ${err.message}`);
      throw(err);
    }
};