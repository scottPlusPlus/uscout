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
import { ipAsMask } from "~/code/abUtils";



// export async function action({ request, params }: ActionArgs) {
//   console.log("running scout admin action");
//   return null;
// }

const sectionVolunteer = `{
    "title": "Where can I volunteer?",
    "body" : "If you're passionate about making a difference in your community but don't know where to start, finding the right volunteer opportunity can be a challenge. Fortunately, there are many online resources available that can help you connect with local organizations and causes that align with your interests and skills.",
    "links" : [ 
        {
            "url": "idealist.org",
            "comment": "A website that helps people find volunteer opportunities based on their interests and skills",
            "tags": [
              "find-volunteers",
              "volunteer"
            ]
    }, {
        "url": "volunteermatch.org",
        "comment": "",
        "tags": [
          "find-volunteers",
          "volunteer"
        ]
      },{
        "url": "meaningfulcode.org",
        "comment": "",
        "tags": [
          "volunteer"
        ]
      }, {
        "url": "www.dosomething.org/us",
        "comment": "Geared towards young people and provides resources for taking action on various social issues.",
        "tags": [
          "politics",
          "take-action",
          "volunteer"
        ]
      }
    ]
}`;

const sectionInspire = `{
    "title": "What are some cool social-good projects to inspire me?",
    "body" : "There are lots of amazing people working on amazing projects to make the world a better place.  Here are just a handful!",
    "links" : [{
        "url": "www.gapminder.org/dollar-street",
        "comment": "",
        "tags": [
          "project"
        ]
      }, {
        "url": "ncase.me/polygons",
        "comment": "",
        "tags": [
          "politics",
          "project"
        ]
      }, {
        "url": "ncase.me/ballot",
        "comment": "",
        "tags": [
          "politics",
          "project"
        ]
      }, {
        "url": "www.starvoting.org",
        "comment": "",
        "tags": [
          "contribute",
          "politics",
          "project"
        ]
      }, {
        "url": "www.youtube.com/watch?v=DOWDNBu9DkU",
        "comment": "",
        "tags": [
          "project",
          "video"
        ]
      }
    ]
}`;

const sectionDonate = `{
    "title": "Where can I find the most impactful places to donate?",
    "body" : "Deciding where to donate your money can be a difficult decision, especially if you want to ensure that your donation has the greatest impact possible. Fortunately, there are several online resources that can help you evaluate different charities and determine which ones are most effective and efficient.",
    "links" : [{
        "url": "givewell.org",
        "comment": "",
        "tags": [
          "donate"
        ]
      }, {
        "url": "charitynavigator.org",
        "comment": "",
        "tags": [
          "donate"
        ]
      }, {
        "url": "charitywatch.org",
        "comment": "",
        "tags": [
          "donate"
        ]
      }, {
        "url": "www.starvoting.org",
        "comment": "",
        "tags": [
          "contribute",
          "politics",
          "project"
        ]
      }
    ]
}`;

const sectionPoverty = `{
    "title": "What's the most efficient / effective way to solve poverty?",
    "body" : "Solving poverty is a complex and multifaceted challenge that requires a combination of short-term and long-term solutions. While there is no single answer to this question, there are several evidence-based approaches that have been shown to be effective in reducing poverty and improving the lives of those who are struggling. Some of the most promising strategies include investing in education and job training, providing access to financial services and resources, implementing progressive tax policies, and promoting inclusive economic growth.",
    "links" : [{
        "url": "worldbank.org/en/topic/poverty/publication/poverty-and-equity-briefs",
        "comment": "",
        "tags": [
          "poverty"
        ]
      }, {
        "url": "un.org/en/global-issues/ending-poverty",
        "comment": "",
        "tags": [
          "poverty"
        ]
      }, {
        "url": "https://poverty.umich.edu/",
        "comment": "",
        "tags": [
          "donate"
        ]
      }
    ]
}`;

const sectionClimate = `{
    "title": "What's the most efficient / effective way to solve the climate crisis?",
    "body" : "The climate crisis is one of the most pressing challenges facing our planet today, and requires urgent action to reduce greenhouse gas emissions and mitigate the impacts of climate change. While there is no single solution to this complex problem, there are several evidence-based strategies that have been shown to be effective in addressing climate change and promoting sustainable development",
    "links" : [
        {
            "url": "climaterealityproject.org",
            "comment": "",
            "tags": [
                "climate"
            ]
        }, {
            "url": "earthguardians.org",
            "comment": "",
            "tags": [
                "climate"
            ]
        }, {
            "url": "climatevisuals.org",
            "comment": "",
            "tags": [
                "climate"
            ]
        }, {    
            "url": "climatekids.nasa.gov",
            "comment": "",
            "tags": [
                "climate"
            ]
        }, {
        "url": "ipcc.ch",
        "comment": "",
        "tags": [
            "climate",
            "governmental"
        ]
      }, {
        "url": "un.org/sustainabledevelopment/climate-action",
        "comment": "",
        "tags": [
            "climate",
            "governmental"
        ]
      }, {
        "url": "wri.org/climate",
        "comment": "",
        "tags": [
            "climate",
            "governmental"
        ]
    }, {
        "url": "thesolutionsproject.org/what-we-do",
        "comment": "",
        "tags": [
            "climate"
        ]
    }, {
        "url": "thecarbonalmanac.org",
        "comment": "",
        "tags": [
          "climate"
        ]
      }
    ]
}`;


const sectionData = `{
    "title": "Where can I find good DATA about big problems?",
    "body" : "Access to reliable and up-to-date data is essential for understanding and addressing the world's biggest challenges, from poverty and inequality to climate change and public health. Fortunately, there are many online resources available that provide access to high-quality data and analysis on a range of global issues.",
    "links" : [
    {
        "url": "ourworldindata.org",
        "comment": "",
        "tags": [
          "data"
        ]
      },{
        "url": "gapminder.org",
        "comment": "",
        "tags": [
          "data"
        ]
        },{
        "url": "data.gov",
        "comment": "",
        "tags": [
          "data"
        ]
      }, {
        "url": "hdr.undp.org",
        "comment": "",
        "tags": [
          "data"
        ]
      }, {
        "url": "healthdata.org/data-tools-practices",
        "comment": "",
        "tags": [
          "data"
        ]
    }, {
        "url": "ballotpedia.org",
        "comment": "",
        "tags": [
          "data"
        ]
      }, {
        "url": "worldometers.info",
        "comment": "",
        "tags": [
          "data"
        ]
      }  
    ]
}`;


const pageDataJson = `[${sectionVolunteer}, ${sectionInspire}, ${sectionDonate}, ${sectionPoverty}, ${sectionClimate}, ${sectionData}]`;

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
  console.log(pageDataJson);

  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const ab = searchParams.get("ab");
  var ipab = asInt(ab, -1);
  if (ipab < 0){
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

  const cssTitle = "text-xl font-bold py-2";
  const cssLinkGreen = "text-green-500 hover:text-green-600";
  const cssTextFaded = "text-gray-500 text-sm py-2";
  const css_section_white = " py-4 px-4 lg:px-8";
  // const css_section_bg1 = "bg-slate-100 p-4";
  // const css_section_bg2 = "bg-teal-50 p-4";

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

  const cssNavButton = "text-white text-sm font-medium hover:text-gray-300 px-4";

  return (
    <div>
      <nav className="fixed top-0 left-0 w-full bg-gray-800 py-4 z-10">
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

      <div className={css_section_white}>
        <p>A curated toolkit of resources for activists and other heroes looking to make a difference</p>
        <p>If there's something you're looking for you can't find here, <a href="https://about.me/scottplusplus" className={cssLinkGreen}>please let me know</a>.  I want to help. </p>
        <p>If you have anything to add or want to make a suggestion, <a href="https://about.me/scottplusplus" className={cssLinkGreen}>get in touch</a></p>
        <p className={cssTextFaded}>Updated by hand April 2023</p>
      </div>
      {tableOfContents(sections)}

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
          </div>

        </section>
      )
      )}
      <Form ref={formRef} className="invisible"></Form>
    </div>
  );
}
