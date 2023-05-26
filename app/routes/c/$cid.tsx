import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { debounce } from 'lodash';

import invariant from "tiny-invariant";
import { actorMayUpdateCollection, getCollection } from "~/models/collection.server";
import { getCollectionItems, Item, ItemFront } from "~/models/item.server";
import { Collection } from "@prisma/client";
import ItemDisplay from "~/components/ItemDisplay";
import DynamicInputFields from "~/components/DynamicInputFields";
import { useCallback, useEffect, useRef, useState } from "react";
import CollectionDataDisplay from "~/components/CollectionDataDisplay";
import { cleanCollectionType } from "~/code/modelUtils";
import SingleFieldForm from "~/components/SingleFieldForm";
import { getStringOrThrow } from "~/code/formUtils";
import { CSS_CLASSES } from "~/code/front/CssClasses";
import TagCloud from "~/components/TagCloud";
import sendAnalyticEvent from "~/code/front/analyticUtils";

import { getUserId } from "~/session.server";
import { nowHHMMSS } from "~/code/timeUtils";
import { sanitizeUrl } from "~/code/urlUtils";
import EditCollectionData from "~/components/EditCollectionData";
import { ScrapedInfo } from "~/code/datatypes/info";
import CollectionJsonComponent from "~/components/CollectionJsonComponent";
import { CollectionJson } from "~/code/datatypes/collectionJson";
import { requestMany } from "~/code/scout/RequestInfo";
import { ACTION_TYPES, collectionAction } from "~/code/actions";
import { SearchTermT } from "~/code/datatypes/SearchTermT";
import { itemsFromRemixData, remapItemPriorities } from "~/code/front/itemUtils";
import { ADD_ITEM_SETTING, collectionSettings } from "~/code/datatypes/collectionSettings";


const ACTIONS = {
  TYPE_FIELD: "a",
  DATA_FIELD: "aData",
}

//Remix Action
export async function action({ request, params }: ActionArgs) {
  invariant(params.cid, "cid not found");
  console.log("CollectionDetailsPage action");

  const formData = await request.formData();
  const aType = getStringOrThrow(formData, ACTIONS.TYPE_FIELD);
  const userId = await getUserId(request);
  const inputData = getStringOrThrow(formData, ACTIONS.DATA_FIELD);

  const actionResult = await collectionAction(userId, params.cid, aType, inputData);
  const now = nowHHMMSS();
  console.log("done with action at " + now);

  if (actionResult.redirect) {
    redirect(actionResult.redirect);
  }
  return json({ action: aType, error: actionResult.err, data: actionResult.data, time: now });
}


//Remix Loader Func
export async function loader({ request, params }: LoaderArgs) {
  invariant(params.cid, "cid not found");
  var now = nowHHMMSS();
  console.log(`Remix LOADER for c/${params.cid} at ${now}`);

  var collection = await getCollection(params.cid);
  if (collection == null) {
    throw new Response("Invalid Collection id", { status: 404 });
  }

  const items = await getCollectionItems(params.cid);
  const urls = items.map((i) => sanitizeUrl(i.url)!);
  const infos = await requestMany(urls);

  console.log(" - have infos, checking admin");
  const userId = await getUserId(request);
  var admin = false;
  if (userId) {
    admin = await actorMayUpdateCollection(userId, params.cid);
  }

  console.log("Remix LOADER returning json");
  return json({ collection, items, infos, userId, admin });
}


//Main Render Function = = = = = 
export default function CollectionDetailsPage() {
  console.log("rendering CollectionDetailsPage");

  const [isLoading, setLoading] = useState<Boolean>(false);
  if (isLoading) {
    return (
      <p>Loading...</p>
    )
  }

  const data = useLoaderData<typeof loader>();
  const ad = useActionData<typeof action>();

  // console.log("have data: " + JSON.stringify(data));
  console.log("have actionData: " + JSON.stringify(ad));

  const infoMap = new Map<string, ScrapedInfo>();
  data.infos.forEach(info => {
    const betterInfo = JSON.parse(JSON.stringify(info));
    infoMap.set(info.url, betterInfo);
  });

  var allItems: Item[] = data.items.map(item => {
    return JSON.parse(JSON.stringify(item));
  });
  var loadedItems = itemsFromRemixData(data.items, infoMap);
  const loadedItemUrls = JSON.stringify(loadedItems.map(item => item.url).sort());
  const pendingCount = loadedItems.filter(item => item.status == "pending").length;

  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();

  const [showPending, setShowPending] = useState<Boolean>(false);
  const [searchTerms, setSearchTerms] = useState<SearchTermT[]>([]);
  const [sortedItems, setSortedItems] = useState<Item[]>([]);
  const [admin, setAdmin] = useState(false);
  const [addItemPending, setAddItemPending] = useState(false);

  const itemsToCountTags = showPending ? loadedItems : loadedItems.filter(item => item.status != "pending");

  useEffect(() => {
    //on load items
    console.log("on first load...");
    const url = new URL(window.location.href);
    console.log("got first url");
    const initialSearchParams: SearchTermT[] = [];
    url.searchParams.forEach((value, key) => {
      const valAsNum = Number(value);
      if (!isNaN(valAsNum)) {
        initialSearchParams.push({ term: key, priority: valAsNum });
      }
    });
    if (initialSearchParams.length == 0) {
      initialSearchParams.push({ term: "", priority: 100 });
    }
    setSearchTerms(initialSearchParams);
    handleSearchUpdate(initialSearchParams, showPending);
  }, [loadedItemUrls]);

  //on first load
  useEffect(()=> {
    const url = new URL(window.location.href);
    var ref = document.referrer;
    if (ref.length > 0) {
      ref = " ref= " + ref;
    }
    sendAnalyticEvent("visit", url.toString() + ref);
  }, []);

  useEffect(() => {
    //on an action...
    console.log("handling action: " + JSON.stringify(ad));
    if (ad?.action == ACTION_TYPES.UPDATE_ITEM) {
      const actionItem: Item = ad?.data as Item;
      const index = loadedItems.findIndex(item => item.url === actionItem.url);
      console.log(`replaced ${actionItem.url} into index ${index}`);
      loadedItems[index] = actionItem;
      handleSearchUpdate(searchTerms, showPending);
    } else if (ad?.action == ACTION_TYPES.ADMIN_ADD_ITEM) {
      setAddItemPending(false);
      handleSearchUpdate(searchTerms, showPending);      
    }
  }, [ad?.time]);

  const submitAction = (action: string, actionData: string) => {
    console.log(`submitAction:  ${action},  ${actionData}`);
    const formData = new FormData(formRef.current || undefined)
    formData.set(ACTIONS.TYPE_FIELD, action);
    formData.set(ACTIONS.DATA_FIELD, actionData);
    // handleSearchUpdate(searchTerms, true);
    submit(formData, { method: "post" });
  }

  const debouncedOnChange = useCallback(
    debounce((newUrl) => {
      sendAnalyticEvent("search", newUrl);
    }, 500, { trailing: true }), []);

  const handleSearchUpdate = (newTerms: SearchTermT[], newShowPending: Boolean) => {
    console.log("handleSearchUpdate: " + JSON.stringify(newTerms));

    const url = new URL(window.location.href);
    url.searchParams.forEach((value, key) => {
      const valAsNum = Number(value);
      if (!isNaN(valAsNum)) {
        url.searchParams.delete(key);
      }
    });
    newTerms.forEach(term => {
      if (term.term.length == 0 || term.priority == 0) {
        return
      }
      url.searchParams.set(term.term, term.priority.toString());
    });
    const newUrl = `${url.origin}${url.pathname}${url.search}`;
    if (window.history.replaceState) {
      window.history.replaceState({ path: newUrl }, document.title, newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }
    var shownItems = loadedItems;
    if (!newShowPending) {
      shownItems = shownItems.filter(item => item.status != "pending");
    }

    //send analytic event if no change in 1/2 second
    debouncedOnChange(`${url.pathname}${url.search}`);

    const validTerms = newTerms.filter(term => {
      return term.term.length > 0
    });
    const prioritizedItems = remapItemPriorities(shownItems, infoMap, validTerms)
    var sorted = prioritizedItems.sort((a, b) => {
      return b.priority - a.priority;
    });
    if (sorted.length > 0 && validTerms.length > 0) {
      sorted = sorted.filter(i => i.priority > 50);
    }

    setSortedItems(sorted);
    setSearchTerms(newTerms);
    setShowPending(newShowPending);
  }

  if (admin && !showPending) {
    console.log("turning on pending...");
    handleSearchUpdate(searchTerms, true);
  }
  if (!admin && showPending) {
    console.log("turning off pending...");
    handleSearchUpdate(searchTerms, false);
  }


  const handleTagClick = (tag: string) => {
    console.log("tag clicked " + tag);
    const newTerms = [...searchTerms];
    newTerms.push({ term: tag, priority: 100 });
    handleSearchUpdate(newTerms, showPending);
  }

  const handleLinkClick = (linkUrl: string) => {
    sendAnalyticEvent("link", linkUrl);
  }


  const handleAddItem = (newUrl: string) => {
    console.log("handleAddItem for " + newUrl);
    const action = ACTION_TYPES.ADMIN_ADD_ITEM; //admin ? ACTION_TYPES.ADMIN_ADD_ITEM : ACTION_TYPES.MAKE_SUGGESTION;
    setAddItemPending(true);
    submitAction(action, newUrl);
  }


  const handleItemEdit = (item: ItemFront) => {
    console.log("handleItemEdit for " + item.url);
    submitAction(ACTION_TYPES.UPDATE_ITEM, JSON.stringify(item));
  }

  const handleRemoveItem = (item: ItemFront) => {
    console.log("handleRemoveItem for " + item.url);
    submitAction(ACTION_TYPES.REMOVE_ITEM, item.url);
    setLoading(true);
  }

  const handleOverrideCollection = (data: CollectionJson) => {
    console.log("handleOverrideCollection");
    const action = ACTION_TYPES.OVERRIDE_COLLECTION;
    submitAction(action, JSON.stringify(data));
  }

  const hiddenItemMsg = () => {
    var count = () => {
      if (showPending) {
        return loadedItems.length - sortedItems.length;
      }
      return (loadedItems.length - pendingCount) - sortedItems.length;
    }
    if (count() <= 0) {
      return null;
    }
    return (<p>{count()} Hidden Items</p>)
  }

  const handleUpdateCollectionData = (collection: Collection) => {
    const collectionStr = JSON.stringify(collection);
    console.log("updating collection: " + collectionStr);
    submitAction(ACTION_TYPES.UPDATE_COLLECTION, collectionStr);
  }

  const collection = cleanCollectionType(data.collection);

  function footer() {
    const toggleText = admin ? "Toggle Admin Off" : "Toggle Admin On";
    const submitError = ad?.error ? ad?.error : undefined;

    const addItemField = () => {
      return (
        <SingleFieldForm name="Add Item" errors={submitError} onSubmit={handleAddItem} disabled={addItemPending} />
      )
    }

    if (data.admin) {
      return (
        <>
          <div className="flex justify-between">
            {addItemField()}
            <div className="justify-end">
              <br></br>
              <button
                className={CSS_CLASSES.SUBMIT_BUTTON}
                type="submit"
                onClick={() => { 
                  setAdmin(!admin);
                }}
              >
                {toggleText}
              </button>
            </div>
          </div>

          {admin && (
            <div>
              <CollectionJsonComponent collection={collection} items={allItems} onSave={handleOverrideCollection} />
            </div>
          )}
        </>
      );
    }

    const settings = collectionSettings(collection);
    if (settings.addItemSettings == ADD_ITEM_SETTING.ADMINS) {
      return null;
    }

    return (
      <div>
        {addItemField()}
      </div>
    )


  }

  return (
    <div>
      <Form ref={formRef} className="invisible"></Form>
      <CollectionDataDisplay collection={collection} />
      {admin && (
        <EditCollectionData collection={collection} onSubmit={handleUpdateCollectionData} />
      )}

      <div className={CSS_CLASSES.SECTION_BG}>
        <DynamicInputFields searchTerms={searchTerms} onChange={(x) => { handleSearchUpdate(x, showPending) }} />
        <TagCloud items={itemsToCountTags} onTagClick={handleTagClick} />
        {hiddenItemMsg()}
      </div>

      <div className="py-4">
        <div className={CSS_CLASSES.ITEM_GRID_COLS}>
          {sortedItems.map(item => (
            <ItemDisplay
              key={item.url}
              item={item}
              info={infoMap.get(item.url)!}
              onTagClick={handleTagClick}
              onLinkClick={handleLinkClick}
              admin={admin}
              onItemUpdate={handleItemEdit}
              onItemDelete={handleRemoveItem}
            />
          ))}
        </div>
      </div>

      <div className={CSS_CLASSES.SECTION_BG}>
        {footer()}
      </div>
    </div>
  );
}