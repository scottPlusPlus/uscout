import { ActionArgs, json, LoaderArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { logger } from "~/code/log/logger";
import { requestMany } from "~/code/scout/RequestInfo";

export const loader = async ({ request }: LoaderArgs) => {
    // handle "OPTIONS" request
    console.log("handling api urls " + request.method);
    return json({ success: true }, 200);
  };

export const action = async ({ request }: ActionArgs) => {
    console.log("api urls Action " + request.method);
    try {
      const data = await request.json();
      logger.info("/api/urls", data);
      const urlsStrings:string[] = data.urls;
      invariant(urlsStrings, "Must pass a 'urls' parameter with array of url-strings you want");
      
      const res = await requestMany(urlsStrings, data.fullHtml ?? false);
      return json({ info: res });
    } catch (err:any){
      logger.error(`api urls Action err! ${err.message}`);
      throw(err);
    }

};