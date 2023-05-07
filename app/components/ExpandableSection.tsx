import { useState } from "react";
import { CSS_ACTIVIST_CLASSES } from "~/code/front/CssClasses";

const titleCSS = "text-xl font-bold cursor-pointer py-2";
const cssTitlBg = "py-4 px-4 lg:px-8";

export function ExpandableSection(props: { children: React.ReactNode, title: string, titleId: string, ipab: number, }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const expandChar = isExpanded ? "" : "...";

    const myCss = CSS_ACTIVIST_CLASSES(props.ipab);

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
                <div className={myCss.sectionBody}>
                    {props.children}
                </div>
            )}
        </div>
    );
}