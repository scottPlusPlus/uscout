import { useEffect } from "react";
import { AB_FLAGS, combineFlags, getAbFlag } from "~/code/abUtils";
import { PageSectionT } from "~/code/datatypes/PageSectionT";
import { ScrapedInfo } from "~/code/datatypes/info";
import { CSS_ACTIVIST_CLASSES } from "~/code/front/CssClasses";
import sendAnalyticEvent from "~/code/front/analyticUtils";
import { Item } from "~/models/item.server";

import heroImage0 from "../assets/empower_hero.png"
import heroImage1 from "../assets/empower_hero_2.png"
import heroImage2 from "../assets/empower_hero_3.png"
import heroImage3 from "../assets/empower_hero_4.png"
import { itemsFromRemixData } from "~/code/front/itemUtils";
import ActivistNavHeader from "./ActivistNavHeader";
import { ExpandableSection } from "./ExpandableSection";
import PageSectionC from "./PageSectionC";
import SearchableItemDisplay from "./SearchableItemDisplay";

type PageWithSectionsProps = {
  sections: PageSectionT[],
  infos: ScrapedInfo[],
  ipab: number,
  collectionItems: Item[],
}


export default function PageWithSections(props: PageWithSectionsProps) {

  const sections: Array<PageSectionT> = props.sections;
  const infoMap = new Map<string, ScrapedInfo>();
  props.infos.forEach(info => {
    infoMap.set(info.url, info);
  })

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

  const tableofContents = () => {

    const cssSmall = myCss.linkNormal;
    const cssBig = "text-xl " + myCss.linkNormal;

    const sectionCss = (section: PageSectionT) => {
      if (section.size != null && section.size == 1) {
        return cssSmall;
      }
      return cssBig;
    }

    return (
      <ul>
        {sections.map((section, index) => (
          <li key={index} className="mb-2">
            <a href={`#s${index}`} className={sectionCss(section)}>{section.title}</a>
          </li>
        ))}
        <li key={"more"}>
          <a href={`#sMore`} className={cssBig}>Everything And More !!</a>
        </li>
      </ul>
    )
  }

  const myCss = CSS_ACTIVIST_CLASSES(props.ipab);
  const heroImageIndex = combineFlags(getAbFlag(props.ipab, AB_FLAGS.HERO_1), getAbFlag(props.ipab, AB_FLAGS.HERO_2));
  const heroImages = [heroImage0, heroImage1, heroImage2, heroImage3];
  const heroImage = heroImages[heroImageIndex];
  console.log("image src = " + heroImage);

  const loadedItems = itemsFromRemixData(props.collectionItems, infoMap);

  return (
    <div>
      <ActivistNavHeader ipab={props.ipab} />

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
            {tableofContents()}
            <div className="py-2"></div>
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
            <ExpandableSection title={section.title} titleId={section.title} ipab={props.ipab}>
              <PageSectionC
                data={section}
                infoMap={infoMap}
                titleId={""}
                handleLinkClick={handleLinkClick}
                ipab={props.ipab}
              />
            </ExpandableSection>
            <div className={myCss.sectionFooter}></div>
          </div>

        </section>
      )
      )}
      <section id={"sMore"}>
        <ExpandableSection title="Everything and More" titleId="sMore" ipab={props.ipab}>
          <div >Here you can search through everything in the above sections, and even more cool stuff that didn't necessarily fit anywhere else.</div>
          <div className="py-4"></div>
          <SearchableItemDisplay
            loadedItems={loadedItems}
            infoMap={infoMap}
            admin={false}
            submitAction={fakeSubmitAction}
            setLoading={setLoading}
          />
        </ExpandableSection>
        <div className={myCss.sectionFooter}></div>
      </section>

    </div>
  );
}
