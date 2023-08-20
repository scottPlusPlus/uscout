import { ActionArgs, json, LoaderArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { getIpAddress } from "~/code/ipUtils";
import { addAnalyticEvent } from "~/models/analyticEvent.server";

export const loader = async ({ request }: LoaderArgs) => {
    // handle "OPTIONS" request
    return json({ success: true }, 200);
  };

export const action = async ({ request }: ActionArgs) => {
    json({ success: true }, 200);
    try {
        const data = await request.json();
        const event:string = data.event;
        invariant(event, "Must pass an 'event' parameter");
        const eventData:string = data.data;
        invariant(event, "Must pass an 'data' parameter");
        const ip = getIpAddress(request);
        const currentUnixTimestamp = Math.floor(Date.now() / 1000);
        await addAnalyticEvent(ip, event, eventData, currentUnixTimestamp);
    } catch (e:any){
        console.error("error saving analytic event: " + e.message);
    }
    return null;
};