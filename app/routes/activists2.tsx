import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, redirect, json } from "@remix-run/server-runtime";
import { ipAsMask } from "~/code/abUtils";
import { PageSectionT } from "~/code/datatypes/PageSectionT";
import { ScrapedInfo } from "~/code/datatypes/info";
import { itemsFromRemixData } from "~/code/front/itemUtils";
import { getIpAddress } from "~/code/ipUtils";
import { requestMany } from "~/code/scout/RequestInfo";
import { nowHHMMSS } from "~/code/agnostic/timeUtils";
import { asInt } from "~/code/tsUtils";
import { sanitizeUrl } from "~/code/urlUtils";
import PageWithSections from "~/components/PageWithSections";
import { getCollectionItems } from "~/models/item.server";
import * as dataFallback from "~/code/activistDataJson.json";

type PageDataT = {
  intro: string,
  updated: string,
  sections: Array<PageSectionT>,
  collectionKey: string,
}

const fallbackPageData = dataFallback as PageDataT;
const root_url = "https://www.empower-kit.com";

export function meta() {
  return {
    title: "Empower-Kit",
    "og:image": root_url + "/images/empower-kit.png",
    "twitter:image": root_url + "/images/empower-kit.png",
    "og:description": "A toolkit for activists.  Removing the barriers between 'wanting to help' and 'helping'",
    "twitter:description": "A toolkit for activists.  Removing the barriers between 'wanting to help' and 'helping'",
  };
}

export async function loader({ request, params }: LoaderArgs) {
  console.log(`Remix LOADER activists at ${nowHHMMSS()}`);

  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const ab = searchParams.get("ab");
  var ipab = asInt(ab, -1);
  if (ipab < 0) {
    const ip = getIpAddress(request);
    ipab = ipAsMask(ip);
    return redirect("/activists2?ab="+ipab);
  }

  const pageData = fallbackPageData;

  const sections: Array<PageSectionT> = pageData.sections;
  const infoUrls = new Set<string>();
  sections.forEach(data => {
    data.links.forEach(link => {
      link.url = sanitizeUrl(link.url)!;
      link.status = "approved";
      link.priority = 0;
      infoUrls.add(link.url);
    });
  });

  const collectionItems = await getCollectionItems("activists");
  collectionItems.forEach(item => {
    infoUrls.add(item.url);
  });
  const infos = await requestMany([...infoUrls]);
  console.log(`have ${infos.length} infos`);
  return json({ sections, infos, ipab, collectionItems });
};

export default function ActivistsPage() {

  const data = useLoaderData<typeof loader>();
  const sections: Array<PageSectionT> = data.sections;
  const uInfos: Array<ScrapedInfo> = !data ? [] : !data.infos ? [] : JSON.parse(JSON.stringify(data.infos));
  const infoMap = new Map<string, ScrapedInfo>();
  uInfos.forEach(info => {
    infoMap.set(info.url, info);
  })

  const loadedItems = itemsFromRemixData(data.collectionItems, infoMap);

  return (

    <PageWithSections sections={sections} infos={uInfos} ipab={data.ipab} collectionItems={loadedItems}/>
  )

}