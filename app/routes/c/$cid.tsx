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
import DoubleFieldForm from "~/components/DoubleFieldForm";
import { getStringOrThrow } from "~/code/formUtils";
import { CSS_CLASSES } from "~/code/front/CssClasses";
import TagCloud from "~/components/TagCloud";
import sendAnalyticEvent from "~/code/front/analyticUtils";

import { getUserId } from "~/session.server";
import { nowHHMMSS } from "~/code/agnostic/timeUtils";
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
import SearchableItemDisplay from "~/components/SearchableItemDisplay";
import Spinner from '../../components/Spinner';


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

interface FormData {
  inputField: string;
  roleField: string;
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

  if (ad?.action == "updateItem") {
    const adddd = JSON.parse(JSON.stringify(ad));
    const loadedItem = loadedItems.find(item => { return item.url == adddd.data.url });
    console.log("have loaded item: " + JSON.stringify(loadedItem));
  }


  const loadedItemUrls = JSON.stringify(loadedItems.map(item => item.url).sort());
  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();

  const [showPending, setShowPending] = useState<boolean>(false);
  const [initialSearchTerms, setInitialSearchTerms] = useState<SearchTermT[]>([]);
  const [admin, setAdmin] = useState(false);
  const [addItemPending, setAddItemPending] = useState(false);
  const [addUserPending, setAddUserPending] = useState(false);
  const [searchBarRenderCounter, setSearchBarRenderCounter] = useState("");
  const [itemsToView, setItemsToView] = useState<Item[]>([]);


  function refreshItemsWithNewPending(newShowPending: boolean) {
    //console.log("refresh items with pending");
    const newItemsToView = newShowPending ? loadedItems : loadedItems.filter(item => item.status != "pending");
    setShowPending(newShowPending);
    setItemsToView(newItemsToView);
  }

  useEffect(() => {
    //on load items
    console.log("on first load...");
    const url = new URL(window.location.href);
    console.log("got first url");
    const initialTems: SearchTermT[] = [];
    url.searchParams.forEach((value, key) => {
      const valAsNum = Number(value);
      if (!isNaN(valAsNum)) {
        initialTems.push({ term: key, priority: valAsNum });
      }
    });
    refreshItemsWithNewPending(showPending);
    setInitialSearchTerms(initialTems);
    //refreshSearch();
  }, [loadedItemUrls]);

  function refreshSearch() {
    setSearchBarRenderCounter(searchBarRenderCounter + 1);
  }

  //on first load
  useEffect(() => {
    const url = new URL(window.location.href);
    var ref = document.referrer;
    if (ref.length > 0) {
      ref = " ref= " + ref;
    }
    sendAnalyticEvent("visit", url.toString() + ref);
    refreshItemsWithNewPending(showPending);
  }, []);

  useEffect(() => {
    //on an action...
    console.log("handling action: " + JSON.stringify(ad));
    if (ad?.action == ACTION_TYPES.UPDATE_ITEM) {
      const actionItem: Item = ad?.data as Item;
      const index = loadedItems.findIndex(item => item.url === actionItem.url);
      console.log(`replaced ${actionItem.url} into index ${index}`);
      loadedItems[index] = actionItem;
      refreshItemsWithNewPending(showPending);
      refreshSearch();
    } else if (ad?.action == ACTION_TYPES.ADMIN_ADD_ITEM) {
      setAddItemPending(false);
      refreshSearch();
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


  if (admin && !showPending) {
    console.log("turning on pending...");
    refreshItemsWithNewPending(true);
  }
  if (!admin && showPending) {
    console.log("turning off pending...");
    refreshItemsWithNewPending(false);
  }

  const handleSearchTermsUpdated = (newTerms: SearchTermT[], oldTerms?: SearchTermT[]) => {
    //console.log("cid: handleSearchTermsUpdated: " + JSON.stringify(newTerms));
    //console.log("current url = " + window.location.href);
    const newUrl = new URL(window.location.href);
    if (oldTerms) {
      oldTerms.forEach(term => {
        newUrl.searchParams.delete(term.term);
      });
    }

    newTerms.forEach(term => {
      if (term.term.length == 0 || term.priority == 0) {
        return
      }
      newUrl.searchParams.set(term.term, term.priority.toString());
    });
    const newUrlStr = newUrl.toString();
    if (window.history.replaceState) {
      const newerUrl = new URL(newUrl);
      //console.log("replace state: " + newerUrl);
      window.history.replaceState({ path: newUrlStr }, document.title, newUrlStr);
    } else {
      //console.log("push state: " + newUrl);
      window.history.pushState({}, '', newUrlStr);
    }
    debouncedOnChange(`${newUrl.pathname}${newUrl.search}`);
  }


  const handleAddItem = (newUrl: string) => {
    console.log("handleAddItem for " + newUrl);
    const action = ACTION_TYPES.ADMIN_ADD_ITEM; //admin ? ACTION_TYPES.ADMIN_ADD_ITEM : ACTION_TYPES.MAKE_SUGGESTION;
    setAddItemPending(true);

    try {
      submitAction(action, newUrl);
    } catch(error) {
      console.log(error)
      setAddItemPending(false)
    }
  }

  const handleAddUser = ({ inputField, roleField }: FormData) => {
    console.log("handleAddUser for " + inputField);
    const action = ACTION_TYPES.CREATE_USER;
    setAddUserPending(true);
    try {
      const actionData = JSON.stringify({ inputField, roleField });
      submitAction(action, actionData);
    } catch(error) {
      setAddUserPending(false)
    }
  }


  const handleOverrideCollection = (data: CollectionJson) => {
    console.log("handleOverrideCollection");
    const action = ACTION_TYPES.OVERRIDE_COLLECTION;
    submitAction(action, JSON.stringify(data));
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

    const addUserField = () => {
      return (
        <DoubleFieldForm inputFieldName="Add User" onSubmit={handleAddUser} disabled={addUserPending} />
      )
    }
    if (data.admin) {
      return (
        <>
          <div className="flex justify-between">
            {!addItemPending && addItemField()}
            {admin && addUserField()}
            {addItemPending && <Spinner/>}
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

      <SearchableItemDisplay
        loadedItems={itemsToView}
        initialTerms={initialSearchTerms}
        infoMap={infoMap}
        admin={admin}
        submitAction={submitAction}
        setLoading={setLoading}
        searchTermsUpdatedHandler={handleSearchTermsUpdated}
        background="bg-gradient-to-b from-neutral-200 to-neutral-400"
      />

      <div className={CSS_CLASSES.SECTION_BG}>
        {footer()}
      </div>
    </div>
  );
}