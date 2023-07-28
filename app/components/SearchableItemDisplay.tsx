import { CSS_CLASSES } from "~/code/front/CssClasses"
import DynamicInputFields from "./DynamicInputFields"
import ItemDisplay from "./ItemDisplay"
import TagCloud from "./TagCloud"
import { useCallback, useEffect, useState } from "react";
import { SearchTermT } from "~/code/datatypes/SearchTermT";
import { remapItemPriorities } from "~/code/front/itemUtils";
import { Item, ItemFront } from "~/models/item.server";
import { ScrapedInfo } from "~/code/datatypes/info";
import sendAnalyticEvent from "~/code/front/analyticUtils";
import { ACTION_TYPES } from "~/code/actions";
import { deepCopyArray } from "~/code/arrayUtils";

type Props = {
    loadedItems: Item[],
    initialTerms: SearchTermT[],
    infoMap: Map<string, ScrapedInfo>,
    admin: boolean,
    submitAction: (action: string, actionData: string) => void
    setLoading: (loading: boolean) => void,
    searchTermsUpdatedHandler?: (newTerms: SearchTermT[], oldTerms?:SearchTermT[]) => void,
    forceRenderCounter?: number,
}

export default function SearchableItemDisplay(props: Props) {

    const [searchTerms, setSearchTerms] = useState<SearchTermT[]>(props.initialTerms);
    const [sortedItems, setSortedItems] = useState<Item[]>(props.loadedItems);

    useEffect(() => {
        // console.log("SearchableItemDisplay useEffect");
        // console.log("current search terms: " + JSON.stringify(searchTerms));
        handleSearchUpdate(searchTerms);
        // console.log("done with searchableItemDisplay useEffect");
      }, [props.loadedItems, props.forceRenderCounter ?? 0]);

    useEffect(() => {
        // console.log("SID: initial search terms updated");
        handleSearchUpdate(props.initialTerms);
    }, [props.initialTerms]);

    const handleSearchUpdate = (newTerms: SearchTermT[]) => {
        //console.log("SID: handleSearchUpdate: " + JSON.stringify(newTerms));
        const oldTerms = [...searchTerms];
        const oldTermsStr = JSON.stringify(oldTerms);
        //console.log("SID: current terms = " + oldTermsStr);

        const validTerms = newTerms.filter(term => {
            return term.term.length > 0
        });
        const prioritizedItems = remapItemPriorities(props.loadedItems, props.infoMap, validTerms)
        var sorted = prioritizedItems.sort((a, b) => {
            return b.priority - a.priority;
        });
        if (sorted.length > 0 && validTerms.length > 0) {
            sorted = sorted.filter(i => i.priority > 50);
        }

        const newTermsStr = JSON.stringify(newTerms);
        if (oldTermsStr != newTermsStr){
            if (props.searchTermsUpdatedHandler != null){
                props.searchTermsUpdatedHandler(validTerms, oldTerms);
            }
        } else {
            console.log(`old terms ${oldTermsStr} == new terms ${newTermsStr}`);
        }
        setSortedItems(sorted);
        setSearchTerms(newTerms);
    }

    const handleTagClick = (tag: string) => {
        console.log("tag clicked " + tag);
        const newTerms = [...searchTerms];
        const newTerm = { term: tag, priority: 100 };
        newTerms.push(newTerm);
        handleSearchUpdate(newTerms);
    }

    const handleLinkClick = (linkUrl: string) => {
        sendAnalyticEvent("link", linkUrl);
    }

    const hiddenItemMsg = () => {
        var count = () => {
            return props.loadedItems.length - sortedItems.length;
        }
        if (count() <= 0) {
            return null;
        }
        return (<p>{count()} Hidden Items</p>)
    }

    const handleItemEdit = (item: ItemFront) => {
        console.log("handleItemEdit for " + item.url);
        props.submitAction(ACTION_TYPES.UPDATE_ITEM, JSON.stringify(item));
    }

    const handleRemoveItem = (item: ItemFront) => {
        console.log("handleRemoveItem for " + item.url);
        props.submitAction(ACTION_TYPES.REMOVE_ITEM, item.url);
        props.setLoading(true);
    }

    return (
        <>
            <div className={CSS_CLASSES.SECTION_BG}>
                <DynamicInputFields searchTerms={deepCopyArray(searchTerms)} onChange={(x) => { handleSearchUpdate(x) }} />
                <TagCloud items={props.loadedItems} onTagClick={handleTagClick} />
                {hiddenItemMsg()}
            </div>

            <div className="py-4">
                <div className={CSS_CLASSES.ITEM_GRID_COLS}>
                    {sortedItems.map(item => (
                        <ItemDisplay
                            key={item.url}
                            item={item}
                            info={props.infoMap.get(item.url)!}
                            onTagClick={handleTagClick}
                            onLinkClick={handleLinkClick}
                            admin={props.admin}
                            onItemUpdate={handleItemEdit}
                            onItemDelete={handleRemoveItem}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}