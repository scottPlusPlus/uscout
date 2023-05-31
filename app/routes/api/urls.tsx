import { ActionArgs, json, LoaderArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { requestMany } from "~/code/scout/RequestInfo";

export const loader = async ({ request }: LoaderArgs) => {
    // handle "OPTIONS" request
    console.log("handling api urls " + request.method);
    return json({ success: true }, 200);
  };

export const action = async ({ request }: ActionArgs) => {
    console.log("api urls Action " + request.method);
    const data = await request.json();
    const j = JSON.stringify(data);
    console.log(j);
    const urlsStrings:string[] = data.urls;
    invariant(urlsStrings, "Must pass a 'urls' parameter with array of url-strings you want");

    const res = await requestMany(urlsStrings);
    return json({ info: res });
};