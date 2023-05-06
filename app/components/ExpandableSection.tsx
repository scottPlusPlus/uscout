import { useState } from "react";
import { AB_FLAGS, getAbFlag } from "~/code/abUtils";

const titleCSS = "text-xl font-bold cursor-pointer py-2";
const cssTitlBg = "py-4 px-4 lg:px-8";
const cssBodyA = "py-4 px-4 lg:px-8 bg-gradient-to-b from-white to-teal-50";
const cssBodyB = "py-4 px-4 lg:px-8 bg-gradient-to-b from-white to-purple-200";
const cssEndA = "bg-teal-50 py-1";
const cssEndB = "bg-purple-200 py-1";


export function ExpandableSection(props: { children: React.ReactNode, title: string, titleId: string, ipab: number, }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const expandChar = isExpanded ? "" : "...";


    const ab = getAbFlag(props.ipab, AB_FLAGS.COLOR);
    const cssBody = ab ? cssBodyA : cssBodyB;

    const handleTitleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <div className={cssTitlBg}>
                <h3
                    className={titleCSS}
                    onClick={handleTitleClick}
                    id={props.titleId}
                >
                    {props.title} {expandChar}
                </h3>
            </div>
            {isExpanded && (
                <div className={cssBody}>
                    {props.children}
                </div>
            )}
        </div>
    );
}