import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requestMany } from "~/code/RequestInfo";

import invariant from "tiny-invariant";
import { getCollection } from "~/models/collection.server";
import { getCollectionItems, Item } from "~/models/item.server";
import { UInfo } from "@prisma/client";
import ItemDisplay from "~/components/ItemDisplay";
import { sanitizeUrl } from "~/code/urlUtils";
import DynamicInputFields from "~/components/DynamicInputFields";
import { useEffect, useState } from "react";

type SearchTerm = {
  term:string,
  priority:number
}

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.cid, "cid not found");

  var collection = await getCollection(params.cid);
    if (collection == null){
            throw new Response("Invalid Collection id", { status: 404 });
    }

  const items = await getCollectionItems(params.cid);
  const urls = items.map((i)=> i.url);
  const infos = await requestMany(urls);

  return json({ collection, items, infos });
}


function remapPriorities(items:Item[], infoMap:Map<string, UInfo>, searchParams:SearchTerm[]){
  const prioritizedItems = items.map((item) => {
    searchParams.forEach(search => {
      item.tags.forEach(tag => {
        if (tag.includes(search.term)){
          item.priority += (search.priority * 2);
        }
      });

      if (item.comment.includes(search.term)){
        item.priority += search.priority
      }
      if (item.url.includes(search.term)){
        item.priority += search.priority;
      }

      const info = infoMap.get(item.url)!;
      if (info.title.includes(search.term)){
        item.priority += search.priority;
      }
      if (info.summary.includes(search.term)){
        item.priority += search.priority;
      }
    });
    //console.log(`${item.url} priority now ${item.priority}`);
    return item;
  });
  return prioritizedItems;
}

export default function CollectionDetailsPage() {
  console.log("rendering CollectionDetailsPage");
  const data = useLoaderData<typeof loader>();
  
  const items:Item[] = data.items.map(item => {
    return JSON.parse(JSON.stringify(item));
  });

  const infoMap = new Map<string, UInfo>();
  data.infos.forEach(info => {
    const betterInfo =  JSON.parse(JSON.stringify(info));
    infoMap.set(info.url, betterInfo);
  });

  const [searchTerms, setSearchTerms ] = useState<SearchTerm[]>([]);
  const [sortedItems, setSortedItems ] = useState<Item[]>(items);

  useEffect(() => {
    //on first load
    const url = new URL(window.location.href);
    console.log("got first url");
    const initialSearchParams:SearchTerm[] = [];
    url.searchParams.forEach((value, key) => {
      initialSearchParams.push({term:key, priority:parseFloat(value)});
    });
    setSearchTerms(initialSearchParams);
    handleSearchUpdate(initialSearchParams);
  }, []);

  const handleSearchUpdate = (newTerms:SearchTerm[]) => {
    console.log("handleSearchUpdate: " + JSON.stringify(newTerms));

    const url = new URL(window.location.href);
    url.searchParams.forEach((_, key) => {
      url.searchParams.delete(key);
    });
    newTerms.forEach(term => {
      url.searchParams.set(term.term, term.priority.toString());
    });
    const newUrl = `${url.origin}${url.pathname}${url.search}`;
    if (window.history.replaceState){
      window.history.replaceState({ path: newUrl }, document.title, newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }

    const prioritizedItems = remapPriorities(items, infoMap, newTerms,)
    const sorted = prioritizedItems.sort((a, b)=> {
      return b.priority - a.priority;
    });
    const sortedBla = sorted.map(item=> item.url);
    //console.log("sorted: " + JSON.stringify(sortedBla));
    setSortedItems(sorted);
    setSearchTerms(newTerms);
  }

  const handleTagClick = (tag:string) => {
    console.log("tag clicked " + tag);
    const newTerms = [...searchTerms];
    newTerms.push({term:tag, priority:100});
    handleSearchUpdate(newTerms);
  }
  
  return (
    <div>
      <h3 className="text-2xl font-bold">{data.collection.title}</h3>
      <p className="py-6">{data.collection.description}</p>
      <DynamicInputFields searchTerms={searchTerms} onChange={handleSearchUpdate}/>
      <hr className="my-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sortedItems.map(item => (
       <ItemDisplay item={item} info={infoMap.get(item.url)!} onTagClick={handleTagClick}/>
      ))}
    </div>
    </div>
  );
}