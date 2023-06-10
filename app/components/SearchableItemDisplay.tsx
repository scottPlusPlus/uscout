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
import { debounce } from "lodash";
import { ACTION_TYPES } from "~/code/actions";

type Props = {
    loadedItems: Item[],
    infoMap: Map<string, ScrapedInfo>,
    admin: boolean,
    submitAction: (action: string, actionData: string) => void
    setLoading: (loading: boolean) => void,
}

export default function SearchableItemDisplay(props: Props) {

    const initialSearchParams = [{ term: "", priority: 100 }];

    const [searchTerms, setSearchTerms] = useState<SearchTermT[]>(initialSearchParams);
    const [sortedItems, setSortedItems] = useState<Item[]>(props.loadedItems);

    useEffect(() => {
        handleSearchUpdate(searchTerms);
      }, [props.loadedItems]);


    const handleSearchUpdate = (newTerms: SearchTermT[]) => {
        console.log("handleSearchUpdate: " + JSON.stringify(newTerms));

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.forEach((value, key) => {
            const valAsNum = Number(value);
            if (!isNaN(valAsNum)) {
                newUrl.searchParams.delete(key);
            }
        });
        newTerms.forEach(term => {
            if (term.term.length == 0 || term.priority == 0) {
                return
            }
            newUrl.searchParams.set(term.term, term.priority.toString());
        });

        // if (window.history.replaceState) {
        //     window.history.replaceState({ path: newUrl }, document.title, newUrl);
        // } else {
        //     window.history.pushState({}, '', newUrl);
        // }
        var shownItems = props.loadedItems;
        shownItems = shownItems.filter(item => item.status != "pending");

        //send analytic event if no change in 1/2 second
        debouncedOnChange(`${newUrl.pathname}${newUrl.search}`);

        const validTerms = newTerms.filter(term => {
            return term.term.length > 0
        });
        const prioritizedItems = remapItemPriorities(shownItems, props.infoMap, validTerms)
        var sorted = prioritizedItems.sort((a, b) => {
            return b.priority - a.priority;
        });
        if (sorted.length > 0 && validTerms.length > 0) {
            sorted = sorted.filter(i => i.priority > 50);
        }

        setSortedItems(sorted);
        setSearchTerms(newTerms);
    }

    const handleTagClick = (tag: string) => {
        console.log("tag clicked " + tag);
        const newTerms = [...searchTerms];
        const newTerm = { term: tag, priority: 100 };
        if (newTerms[0].term.length == 0){
            newTerms[0] = newTerm;
        } else {
            newTerms.push({ term: tag, priority: 100 });
        }
        handleSearchUpdate(newTerms);
    }

    const handleLinkClick = (linkUrl: string) => {
        sendAnalyticEvent("link", linkUrl);
    }

    const hiddenItemMsg = () => {
        var count = () => {
            var pendingCount = props.loadedItems.filter(item => item.status == "pending").length;
            return (props.loadedItems.length - pendingCount) - sortedItems.length;
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

    const debouncedOnChange = useCallback(
        debounce((newUrl) => {
            sendAnalyticEvent("search", newUrl);
        }, 500, { trailing: true }), []);


    return (
        <>
            <div className={CSS_CLASSES.SECTION_BG}>
                <DynamicInputFields searchTerms={searchTerms} onChange={(x) => { handleSearchUpdate(x) }} />
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