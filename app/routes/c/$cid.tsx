import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { requestMany } from "~/code/RequestInfo";

import invariant from "tiny-invariant";
import { getCollection } from "~/models/collection.server";
import { getCollectionItems, Item, suggestItem } from "~/models/item.server";
import { UInfo } from "@prisma/client";
import ItemDisplay from "~/components/ItemDisplay";
import DynamicInputFields from "~/components/DynamicInputFields";
import { useEffect, useRef, useState } from "react";
import CollectionDataDisplay from "~/components/CollectionDataDisplay";
import { cleanCollectionType } from "~/code/modelUtils";
import SingleFieldForm from "~/components/SingleFieldForm";
import { getStringOrThrow } from "~/code/formUtils";
import { CSS_CLASSES } from "~/code/CssClasses";

type SearchTerm = {
  term: string,
  priority: number
}

const ACTIONS = {
  TYPE_FIELD: "a",
  MAKE_SUGGESTION: "suggestion"
}

//Remix Action
export async function action({ request, params }: ActionArgs) {
  invariant(params.cid, "cid not found");
  console.log("CollectionDetailsPage action");

  const formData = await request.formData();
  const aType = getStringOrThrow(formData, ACTIONS.TYPE_FIELD);

  if (aType == ACTIONS.MAKE_SUGGESTION) {
    try {
      const itemUrl = getStringOrThrow(formData, "itemUrl");
      await suggestItem(params.cid, itemUrl);
      return json({ suggestSuccess: true, suggestError: null },);
    } catch (err: any) {
      const errMsg = err.message ? err.message : "Error ¯\_(¬_¬)_/¯";
      return json({ suggestSuccess: false, suggestError: errMsg },);
    }

  } else {
    throw new Error("invalid actionType " + aType);
  }

  return json({});;
}

//Remix Loader Func
export async function loader({ request, params }: LoaderArgs) {
  invariant(params.cid, "cid not found");

  var collection = await getCollection(params.cid);
  if (collection == null) {
    throw new Response("Invalid Collection id", { status: 404 });
  }

  const items = await getCollectionItems(params.cid);
  const urls = items.map((i) => i.url);
  const infos = await requestMany(urls);

  return json({ collection, items, infos });
}


function remapPriorities(items: Item[], infoMap: Map<string, UInfo>, searchParams: SearchTerm[], caseSensitive:Boolean=false) {
  
  const includes = (strA:string, strB:string) => {
    return strA.toLowerCase().includes(strB.toLowerCase());
  }
  
  const prioritizedItems = items.map((item) => {
    searchParams.forEach(search => {
      if (search.term.length == 0) {
        return;
      }

      item.tags.forEach(tag => {
        if (includes(tag, search.term)) {
          item.priority += (search.priority * 2);
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
  const data = useLoaderData<typeof loader>();
  const ad = useActionData<typeof action>();
  var actionData = null;
  if (ad) {
    actionData = JSON.parse(JSON.stringify(ad));
    console.log("have actionData: " + actionData.suggestSuccess);
  }

  const loadedItems: Item[] = data.items.map(item => {
    return JSON.parse(JSON.stringify(item));
  });
  const loadedItemUrls = JSON.stringify(loadedItems.map(item => item.url).sort());
  const pendingCount = loadedItems.filter(item => item.status == "pending").length;

  // console.log(`Have ${loadedItems.length} loaded items`);
  // console.log("loadedUrls: " + loadedItemUrls);

  const infoMap = new Map<string, UInfo>();
  data.infos.forEach(info => {
    const betterInfo = JSON.parse(JSON.stringify(info));
    infoMap.set(info.url, betterInfo);
  });

  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();

  const [showPending, setShowPending] = useState<Boolean>(false);
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [sortedItems, setSortedItems] = useState<Item[]>(loadedItems);

  useEffect(() => {
    //on first load
    console.log("on first load...");
    const url = new URL(window.location.href);
    console.log("got first url");
    const initialSearchParams: SearchTerm[] = [];
    url.searchParams.forEach((value, key) => {
      initialSearchParams.push({ term: key, priority: parseFloat(value) });
    });
    if (initialSearchParams.length == 0) {
      initialSearchParams.push({ term: "", priority: 100 });
    }
    setSearchTerms(initialSearchParams);
    handleSearchUpdate(initialSearchParams, showPending);
  }, [loadedItemUrls]);

  const handleSearchUpdate = (newTerms: SearchTerm[], newShowPending: Boolean) => {
    console.log("handleSearchUpdate: " + JSON.stringify(newTerms));

    const url = new URL(window.location.href);
    url.searchParams.forEach((_, key) => {
      url.searchParams.delete(key);
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

    const validTerms = newTerms.filter(term => {
      return term.term.length > 0
    });
    const prioritizedItems = remapPriorities(shownItems, infoMap, validTerms)
    var sorted = prioritizedItems.sort((a, b) => {
      return b.priority - a.priority;
    });
    if (sorted.length > 0 && validTerms.length > 0) {
      sorted = sorted.filter(i => i.priority > 0);
    }

    setSortedItems(sorted);
    setSearchTerms(newTerms);
    setShowPending(newShowPending);
  }

  const handleTagClick = (tag: string) => {
    console.log("tag clicked " + tag);
    const newTerms = [...searchTerms];
    newTerms.push({ term: tag, priority: 100 });
    handleSearchUpdate(newTerms, showPending);
  }

  const handleAddSugestion = (suggestion: string) => {
    const formData = new FormData(formRef.current || undefined)
    formData.set(ACTIONS.TYPE_FIELD, ACTIONS.MAKE_SUGGESTION);
    formData.set("itemUrl", suggestion);
    handleSearchUpdate(searchTerms, true);
    submit(formData, { method: "post" });
  }

  const handleTogglePending = () => {
    console.log("toggle pending.  currently " + showPending);
    handleSearchUpdate(searchTerms, !showPending);
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

  return (
    <div>
      <CollectionDataDisplay collection={cleanCollectionType(data.collection)} />
      <div className={CSS_CLASSES.SECTION_BG}>
        <DynamicInputFields searchTerms={searchTerms} onChange={(x) => { handleSearchUpdate(x, showPending) }} />
      </div>
      <div className="py-4">
        {hiddenItemMsg()}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.map(item => (
            <ItemDisplay key={item.url} item={item} info={infoMap.get(item.url)!} onTagClick={handleTagClick} />
          ))}
        </div>
      </div>
      <div className={CSS_CLASSES.SECTION_BG}>
        <SingleFieldForm name={"Suggest a Url"} errors={actionData?.suggestError} onSubmit={handleAddSugestion} />
        <button
          className={CSS_CLASSES.SUBMIT_BUTTON}
          type="button"
          onClick={handleTogglePending}
        >
          {!showPending ? "Show Pending" : "Hide Pending"}
        </button>
      </div>
      <Form ref={formRef} className="invisible"></Form>
    </div>
  );
}