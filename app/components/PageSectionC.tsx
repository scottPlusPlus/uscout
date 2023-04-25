import { PageSectionT } from "~/code/datatypes/PageSectionT";
import { ScrapedInfo } from "~/code/datatypes/info";
import ItemDisplay from "./ItemDisplay";
import Observer from "./Observer";

type Props = {
    data: PageSectionT;
    infoMap: Map<string, ScrapedInfo>;
    titleId: string;
    handleLinkClick: (arg0: string) => void;
    ipab: number;
};

export default function PageSectionC(props: Props) {

    const infoMap = props.infoMap;
    const links = props.data.links.filter(link => {
        const info = infoMap.get(link.url);
        return info != null;
    });

    const doNothing = (x: any) => {
    }

    return (
        <>
            <Observer name={props.data.title} />
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
        </>
    );
};
