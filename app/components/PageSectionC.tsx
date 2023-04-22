import React, { useState } from "react";
import { PageSectionT } from "~/code/datatypes/PageSectionT";
import { ScrapedInfo } from "~/code/datatypes/info";
import ItemDisplay from "./ItemDisplay";
import Observer from "./Observer";

type Props = {
    data: PageSectionT;
    infoMap: Map<string, ScrapedInfo>;
    titleId:string;
    handleLinkClick:(arg0:string)=>void;
};

const titleCSS = "text-xl font-bold cursor-pointer py-2";
const bodyCSS = "bg-gradient-to-b from-white to-teal-50";
const cssTitlBg = "py-4 px-4 lg:px-8";
const cssBody = "py-4 px-4 lg:px-8 bg-gradient-to-b from-white to-teal-50"

export default function PageSectionC(props: Props) {
    const [isExpanded, setIsExpanded] = useState(true);

    const infoMap = props.infoMap;
    const links = props.data.links.filter(link => {
        const info = infoMap.get(link.url);
        return info != null;
    });

    const handleTitleClick = () => {
        setIsExpanded(!isExpanded);
    };

    const doNothing = (x: any) => {
    }

    const expandChar = isExpanded ? "-" : "+";

    return (
        <div> 
            <div className={cssTitlBg}>
                <h3
                    className={titleCSS}
                    onClick={handleTitleClick}
                    id={props.titleId}
                >
                    {props.data.title} {expandChar}
                </h3>
            </div>
            {isExpanded && (
                <div className={cssBody}>
                    <Observer name={props.data.title}/>
                    <div >{props.data.body}</div>
                    <div className="py-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {links.map(item => (
                                <ItemDisplay
                                    key={item.url}
                                    item={item}
                                    info={infoMap.get(item.url)!}
                                    onTagClick={doNothing}
                                    onLinkClick={props.handleLinkClick}
                                    admin={false}
                                    onItemUpdate={doNothing}
                                    onItemDelete={doNothing}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-teal-50 py-1"></div>
        </div>
    );
};
