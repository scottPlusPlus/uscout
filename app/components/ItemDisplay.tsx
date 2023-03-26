import { UInfo } from "@prisma/client";
import { CSS_CLASSES } from "~/code/CssClasses";
import { ItemFront } from "~/models/item.server";
import EditableItem from "./EditableItem";
import Image3x2 from "./Image3x2";

type ItemProps = {
    item: ItemFront,
    info: UInfo,
    onTagClick: (arg0: string) => void,
    onLinkClick?: (url: string) => void,
    onItemUpdate: (arg0: ItemFront) => void
    admin: boolean
}

export default function ItemDisplay(props: ItemProps) {
    // console.log("Render ItemDisplay for " + props.item.url);
    // console.log("info:  " + JSON.stringify(props.info));

    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (props.onLinkClick) {
            props.onLinkClick(props.item.url);
        }
    }

    return (
        <div className="border border-gray-300 rounded-lg shadow-md">
            <a onClick={handleLinkClick} href={props.info.fullUrl} target="_blank">
                <Image3x2 src={props.info.image} />
            </a>
            <div className="p-4">
                <h2 className="font-bold text-lg mb-2">{props.info.title}</h2>
                <p className="text-gray-700 text-base">{props.info.summary}</p>
                <p className="text-gray-700 text-base">- - - - - </p>
                <p className="text-gray-700 text-base">{props.item.comment}</p>
                {
                    props.item.status == "pending" && (
                        <button key={"pending"} className={CSS_CLASSES.ITEM_TAG}>
                            {"pending"}
                        </button>
                    )
                }
                {props.item.tags.map(tag => (
                    <button key={tag} onClick={() => { props.onTagClick(tag) }} className={CSS_CLASSES.ITEM_TAG}>
                        {tag}
                    </button>
                ))}
            </div>
            <div>
            { props.admin && (
                <EditableItem item={props.item} info={props.info} onSave={props.onItemUpdate} />
            )}
            </div>
        </div>
    );
}