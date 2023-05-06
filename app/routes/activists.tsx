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
import { getIpAddress, ipAsNumber } from "~/code/ipUtils";
import { asInt } from "~/code/tsUtils";
import { ExpandableSection } from "~/components/ExpandableSection";
import { AB_FLAGS, getAbFlag, ipAsMask } from "~/code/abUtils";

import heroImage from "../assets/empower_hero.png"
import { activistPageDataJson } from "~/code/activistData";


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

  const infos = await requestMany([...infoUrls]);
  console.log(`have ${infos.length} infos`);
  return json({ sections, infos, ipab });
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

  
  const colorAB = getAbFlag(data.ipab, AB_FLAGS.COLOR);
  const cssSectionFooter = (colorAB ? "bg-teal-50" : "bg-purple-200")+" py-1";

  const cssTitle = "text-xl font-bold py-2";
  const cssLinkGreen = "text-green-500 hover:text-green-600";
  const cssContentsLink = "text-lg text-green-500 hover:text-green-600";
  const cssTextFaded = "text-gray-500 text-sm py-2";
  const css_section_white = " py-4 px-4 lg:px-8";
  // const css_section_bg1 = "bg-slate-100 p-4";
  // const css_section_bg2 = "bg-teal-50 p-4";

  const cssNavColor = colorAB ? "bg-teal-700" : "bg-purple-800";// "bg-gray-800";

  //const css_section_bg1 = "bg-gradient-to-b from-teal-50 to-white py-4 px-4 lg:px-8";
  const css_section_bg1 = "py-4 px-4 lg:px-8";

  const tableOfContents = (pageSections: Array<PageSectionT>) => {
    return (
      <ExpandableSection title={"Contents"} titleId={"contents"} ipab={data.ipab}>
        <nav>
          <ul>
            {pageSections.map((section, index) => (
              <li key={index}>
                <a href={`#s${index}`} className={cssLinkGreen}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </ExpandableSection>
    );
  };

  const cssNavButton = "text-white text-sm font-semibold hover:text-gray-300 px-4";
  console.log("image src = " + heroImage);



  return (
    <div>
      <nav className={"fixed top-0 left-0 w-full py-4 z-10 "+cssNavColor}>
        <div className="px-4 lg:px-8 flex justify-between">
          <div className="flex items-left">
            <a href="#top" className="text-white text-xl font-semibold">Empower-Kit for Activists 🧰</a>
          </div>
          <div className="flex items-center">
            <a href="./feedback?r=activists" className={cssNavButton}>Feedback</a>
            <a href="#top" className={cssNavButton}>Back to Top</a>
          </div>
        </div>
      </nav>
      <div className="py-8"></div>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:max-w-max">
          <div className={css_section_white}>
            <div className="border shadow-md bg-white p-4 px-6">
              <p>A curated toolkit of resources for activists and other heroes looking to make a difference</p>
              <p>If there's something you're looking for you can't find here, <a href="https://about.me/scottplusplus" className={cssLinkGreen}>please let me know</a>.  I want to help. </p>
              <p>If you have anything to add or want to make a suggestion, <a href="https://about.me/scottplusplus" className={cssLinkGreen}>get in touch</a></p>
              <p className={cssTextFaded}>Updated by hand May 2023</p>
            </div>
            <div className="py-4"></div>
            <h3 className={cssTitle}>Contents:</h3>
            <ul>
              {sections.map((section, index) => (
                <li key={index}>
                  <a href={`#s${index}`} className={cssContentsLink}>{section.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:block hidden justify-center items-center">
          <img src={heroImage} className="object-contain max-h-[26rem]"></img>
        </div>
      </div>
      <div className={cssSectionFooter}></div>
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
            <div className={cssSectionFooter}></div>
          </div>

        </section>
      )
      )}
      <Form ref={formRef} className="invisible"></Form>
    </div>
  );
}
