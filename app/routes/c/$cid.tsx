import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { requestMany } from "~/code/RequestInfo";
import { debounce } from 'lodash';

import invariant from "tiny-invariant";
import { actorMayUpdateCollection, getCollection, overrideCollection, updateCollection } from "~/models/collection.server";
import { addItem, getCollectionItems, Item, ItemFront, removeItem, suggestItem, updateItem } from "~/models/item.server";
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
import { useOptionalUser } from "~/utils";
import { getUserId } from "~/session.server";
import { nowHHMMSS } from "~/code/timeUtils";
import { sanitizeUrl } from "~/code/urlUtils";
import EditCollectionData from "~/components/EditCollectionData";
import { ScrapedInfo } from "~/code/datatypes/info";
import CollectionJsonComponent from "~/components/CollectionJsonComponent";
import { CollectionJson, assertValidCollection } from "~/code/datatypes/collectionJson";


type SearchTerm = {
  term: string,
  priority: number
}

const ACTIONS = {
  TYPE_FIELD: "a",
  DATA_FIELD: "aData",
  MAKE_SUGGESTION: "suggestion",
  ADMIN_ADD_ITEM: "addItem",
  UPDATE_ITEM: "updateItem",
  UPDATE_COLLECTION: "collection",
  OVERRIDE_COLLECTION: "override",
  REMOVE_ITEM: "removeItem",
}

//Remix Action
export async function action({ request, params }: ActionArgs) {
  invariant(params.cid, "cid not found");
  console.log("CollectionDetailsPage action");

  const formData = await request.formData();
  const aType = getStringOrThrow(formData, ACTIONS.TYPE_FIELD);
  const userId = await getUserId(request);

  var err: string | null = null;
  var data: Object | null = null;
  try {
    const inputData = getStringOrThrow(formData, ACTIONS.DATA_FIELD);
    if (aType == ACTIONS.MAKE_SUGGESTION) {
      data = await actionAddSubmission(params.cid, inputData);
    } else if (aType == ACTIONS.ADMIN_ADD_ITEM) {
      data = await actionAdminAddItem(params.cid, userId, inputData);
    } else if (aType == ACTIONS.UPDATE_ITEM) {
      data = await actionUpdateItem(params.cid, userId, inputData);
    } else if (aType == ACTIONS.UPDATE_COLLECTION) {
      data = await actionUpdateCollection(params.cid, userId, inputData);
    } else if (aType == ACTIONS.OVERRIDE_COLLECTION) {
      await actionOverrideCollection(params.cid, userId, inputData);
      return redirect("/c/" + params.cid);
    } else if (aType == ACTIONS.REMOVE_ITEM){
      await actionRemoveItem(params.cid, userId, inputData);
      return redirect("/c/" + params.cid);
    } else {
      throw ("invalid action");
    }
   
  } catch (error: any) {
    err = error.message;
    console.error("Action failed: " + err); 
  }

  const now = nowHHMMSS();
  console.log("done with action at " + now);
  return json({ action: aType, error: err, data: data, time: now });
}

async function actionAddSubmission(cid: string, inputData: string): Promise<Object | null> {
  try {
    await suggestItem(cid, inputData);
    return null;
  } catch (err: any) {
    const errMsg = err.message ? err.message : "Error ¯\_(¬_¬)_/¯";
    throw (errMsg);
  }
}

async function actionAdminAddItem(cid: string, actor: string | undefined, inputData: string): Promise<Object | null> {
  if (actor == null) {
    throw ("Must be logged in");
  }
  await addItem(actor, cid, inputData);
  return null;
}

async function actionUpdateItem(cid: string, actor: string | undefined, inputData: string): Promise<Object | null> {
  if (actor == null) {
    throw ("Must be logged in");
  }
  try {
    const itemFront: ItemFront = JSON.parse(inputData);
    return await updateItem(actor, cid, itemFront);  
  } catch (e:any){
    throw e;
  }
}

async function actionUpdateCollection(cid: string, actor: string | undefined, inputData: string): Promise<Object> {
  if (actor == null) {
    throw ("Must be logged in");
  }
  const collection: Collection = JSON.parse(inputData);
  return await updateCollection(actor, collection);
}

async function actionOverrideCollection(cid: string, actor: string | undefined, inputData: string): Promise<void> {
  if (actor == null) {
    throw ("Must be logged in");
  }
  const collection: CollectionJson = assertValidCollection(JSON.parse(inputData));
  await overrideCollection(actor, collection);
}

async function actionRemoveItem(cid:string,  actor: string | undefined, inputData: string): Promise<void> {
  if (actor == null) {
    throw ("Must be logged in");
  }
  const itemUrl = inputData;
  return await removeItem(actor, cid, itemUrl);
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


function remapPriorities(items: Item[], infoMap: Map<string, ScrapedInfo>, searchParams: SearchTerm[], caseSensitive: Boolean = false): Item[] {

  const includes = (strA: string, strB: string) => {
    return strA.toLowerCase().includes(strB.toLowerCase());
  }

  const prioritizedItems = items.map((item) => {
    searchParams.forEach(search => {
      if (search.term.length == 0) {
        return;
      }

      item.tags.forEach(tag => {
        if (includes(tag, search.term)) {
          item.priority += (search.priority * 5);
        }
      });

      if (includes(item.comment, search.term)) {
        item.priority += search.priority
      }
      if (includes(item.url, search.term)) {
        item.priority += search.priority;
      }

      const info = infoMap.get(item.url)!;
      if (includes(info.title, search.term)) {
        item.priority += search.priority;
      }
      if (includes(info.summary, search.term)) {
        item.priority += search.priority;
      }
    });
    //console.log(`${item.url} priority now ${item.priority}`);
    return item;
  });
  return prioritizedItems;
}

//Main Render Function = = = = = 
export default function CollectionDetailsPage() {
  console.log("rendering CollectionDetailsPage");

  const [isLoading, setLoading] = useState<Boolean>(false);
  if (isLoading){
    return (
      <p>Loading...</p>
    )
  }


  const data = useLoaderData<typeof loader>();
  const ad = useActionData<typeof action>();

  console.log("have data: " + JSON.stringify(data));
  console.log("have actionData: " + JSON.stringify(ad));


  const infoMap = new Map<string, ScrapedInfo>();
  data.infos.forEach(info => {
    const betterInfo = JSON.parse(JSON.stringify(info));
    infoMap.set(info.url, betterInfo);
  });

  var allItems: Item[] = data.items.map(item => {
    return JSON.parse(JSON.stringify(item));
  });
  var loadedItems = allItems.filter(item => {
    const info = infoMap.get(item.url);
    if (!info) {
      console.log("missing info for " + item.url);
      return false;
    }
    return true;
  });
  const loadedItemUrls = JSON.stringify(loadedItems.map(item => item.url).sort());
  const pendingCount = loadedItems.filter(item => item.status == "pending").length;

  const userId = data.userId;


  // console.log(`Have ${loadedItems.length} loaded items`);
  // console.log("loadedUrls: " + loadedItemUrls);


  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();

  const [showPending, setShowPending] = useState<Boolean>(false);
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [sortedItems, setSortedItems] = useState<Item[]>(loadedItems);
  const [admin, setAdmin] = useState(false);

  const itemsToCountTags = showPending ? loadedItems : loadedItems.filter(item => item.status != "pending");

  useEffect(() => {
    //on first load
    console.log("on first load...");
    const url = new URL(window.location.href);
    console.log("got first url");
    const initialSearchParams: SearchTerm[] = [];
    url.searchParams.forEach((value, key) => {
      const valAsNum = Number(value);
      if (!isNaN(valAsNum)) {
        initialSearchParams.push({ term: key, priority: valAsNum });
      }
    });
    if (initialSearchParams.length == 0) {
      initialSearchParams.push({ term: "", priority: 100 });
    }
    var ref = document.referrer;
    if (ref.length > 0){
      ref = " ref= " + ref;
    }
    sendAnalyticEvent("visit", url.toString()+ref);
    setSearchTerms(initialSearchParams);
    handleSearchUpdate(initialSearchParams, showPending);
  }, [loadedItemUrls]);

  useEffect(() => {
    //on an action...
    console.log("handling action: " + JSON.stringify(ad));
    if (ad?.action == ACTIONS.UPDATE_ITEM) {
      const actionItem: Item = ad?.data as Item;
      const index = loadedItems.findIndex(item => item.url === actionItem.url);
      console.log(`replaced ${actionItem.url} into index ${index}`);
      loadedItems[index] = actionItem;
      handleSearchUpdate(searchTerms, showPending);
    } else if (ad?.action == ACTIONS.ADMIN_ADD_ITEM) {
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

  const handleSearchUpdate = (newTerms: SearchTerm[], newShowPending: Boolean) => {
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
    const prioritizedItems = remapPriorities(shownItems, infoMap, validTerms)
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
    const action = admin ? ACTIONS.ADMIN_ADD_ITEM : ACTIONS.MAKE_SUGGESTION;
    submitAction(action, newUrl);
  }


  const handleItemEdit = (item: ItemFront) => {
    console.log("handleItemEdit for " + item.url);
    submitAction(ACTIONS.UPDATE_ITEM, JSON.stringify(item));
  }

  const handleRemoveItem = (item: ItemFront) => {
    console.log("handleRemoveItem for " + item.url);
    submitAction(ACTIONS.REMOVE_ITEM, item.url);
    setLoading(true);
  }

  const handleOverrideCollection = (data: CollectionJson) => {
    console.log("handleOverrideCollection");
    const action = ACTIONS.OVERRIDE_COLLECTION;
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
    submitAction(ACTIONS.UPDATE_COLLECTION, collectionStr);
  }

  const submitLabel = admin ? "Add Item" : "Suggest a Url";
  const submitError = ad?.error ? ad?.error : undefined;
  const collection = cleanCollectionType(data.collection);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <SingleFieldForm name={submitLabel} errors={submitError} onSubmit={handleAddItem} />
        {data.admin && (
          <button
            className={CSS_CLASSES.SUBMIT_BUTTON}
            type="submit"
            onClick={() => { setAdmin(!admin) }}
          >
            Toggle Admin
          </button>
        )}
      </div>
      {admin && (
        <CollectionJsonComponent collection={collection} items={allItems} onSave={handleOverrideCollection} />
      )}
    </div>
  );
}