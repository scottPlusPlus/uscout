import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { nowHHMMSS } from "~/code/timeUtils";
import { useEffect, useRef } from "react";

import { PageSectionT } from "~/code/datatypes/PageSectionT";
import PageSectionC from "~/components/PageSectionC";
import { ScrapedInfo } from "~/code/datatypes/info";
import { sanitizeUrl } from "~/code/urlUtils";
import sendAnalyticEvent from "~/code/front/analyticUtils";
import { requestMany } from "~/code/scout/RequestInfo";
import { getIpAddress } from "~/code/ipUtils";
import { asInt } from "~/code/tsUtils";
import { ExpandableSection } from "~/components/ExpandableSection";
import { ipAsMask } from "~/code/abUtils";

import heroImage from "../assets/empower_hero.png"
import { activistPageDataJson } from "~/code/activistData";
import ActivistNavHeader from "~/components/ActivistNavHeader";
import { CSS_ACTIVIST_CLASSES } from "~/code/front/CssClasses";
import SearchableItemDisplay from "~/components/SearchableItemDisplay";
import { Item, getCollectionItems } from "~/models/item.server";
import { itemsFromRemixData } from "~/code/front/itemUtils";


// export async function action({ request, params }: ActionArgs) {
//   console.log("running scout admin action");
//   return null;
// }

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
  const pageDataJson = activistPageDataJson;
  console.log(pageDataJson);

  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const ab = searchParams.get("ab");
  var ipab = asInt(ab, -1);
  if (ipab < 0) {
    const ip = getIpAddress(request);
    ipab = ipAsMask(ip);
  }

  const sections: Array<PageSectionT> = JSON.parse(pageDataJson);
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

export default function AdminPage() {

  const data = useLoaderData<typeof loader>();
  const sections: Array<PageSectionT> = data.sections;
  const uInfos: Array<ScrapedInfo> = !data ? [] : !data.infos ? [] : JSON.parse(JSON.stringify(data.infos));
  const infoMap = new Map<string, ScrapedInfo>();
  uInfos.forEach(info => {
    infoMap.set(info.url, info);
  })

  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();


  useEffect(() => {
    //on first load
    console.log("on first load...");
    const url = new URL(window.location.href);
    var ref = document.referrer;
    if (ref.length > 0) {
      ref = " ref= " + ref;
    }
    console.log("ref = " + ref);
    sendAnalyticEvent("visit", url.toString() + ref);
  }, []);

  const handleLinkClick = (linkUrl: string) => {
    sendAnalyticEvent("link", linkUrl);
  }

  const fakeSubmitAction = (action: string, actionData: string) => {
    return;
  }
  const setLoading = (loading: boolean) => {
    return;
  }

  const myCss = CSS_ACTIVIST_CLASSES(data.ipab);

  console.log("image src = " + heroImage);

  const loadedItems = itemsFromRemixData(data.collectionItems, infoMap);

  return (
    <div>
      <ActivistNavHeader ipab={data.ipab} />

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:max-w-max">
          <div className={myCss.sectionWhite}>
            <div className="border shadow-md bg-white p-4 px-6">
              <p>A curated toolkit of resources for activists and other heroes looking to make a difference</p>
              <p>If there's something you're looking for you can't find here, <a href="https://about.me/scottplusplus" className={myCss.linkNormal}>please let me know</a>.  I want to help. </p>
              <p>If you have anything to add or want to make a suggestion, <a href="https://about.me/scottplusplus" className={myCss.linkNormal}>get in touch</a></p>
              <p className={myCss.textFaded}>Updated by hand May 2023</p>
            </div>
            <div className="py-4"></div>
            <h3 className={myCss.title}>Contents:</h3>
            <ul>
              {sections.map((section, index) => (
                <li key={index}>
                  <a href={`#s${index}`} className={myCss.contentsLink}>{section.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:block hidden justify-center items-center">
          <img src={heroImage} className="object-contain max-h-[26rem]"></img>
        </div>
      </div>
      <div className={myCss.sectionFooter}></div>
      {sections.map((section, index) => (
        <section id={"s" + index}>
          <div key={"" + index}>
            <ExpandableSection title={section.title} titleId={section.title} ipab={data.ipab}>
              <PageSectionC
                data={section}
                infoMap={infoMap}
                titleId={""}
                handleLinkClick={handleLinkClick}
                ipab={data.ipab}
              />
            </ExpandableSection>
            <div className={myCss.sectionFooter}></div>
          </div>

        </section>
      )
      )}
      <ExpandableSection title="Even More" titleId="secEvenMore" ipab={data.ipab}>
        <SearchableItemDisplay
          loadedItems={loadedItems}
          infoMap={infoMap}
          admin={false}
          submitAction={fakeSubmitAction}
          setLoading={setLoading}
        />
      </ExpandableSection>
      <div className={myCss.sectionFooter}></div>
      <Form ref={formRef} className="invisible"></Form>
    </div>
  );
}
