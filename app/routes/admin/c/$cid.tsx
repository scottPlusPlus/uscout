import { UInfo } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit, useTransition, Form } from "@remix-run/react";
import { useRef } from "react";


import invariant from "tiny-invariant";
import { getStringOrThrow } from "~/code/formUtils";
import { requestMany } from "~/code/RequestInfo";
import { sanitizeUrl } from "~/code/urlUtils";
import EditableItem from "~/components/EditableItem";
import SingleFieldForm from "~/components/SingleFieldForm";
import { getCollection } from "~/models/collection.server";
import { addItem, getCollectionItems, ItemFront, updateItem } from "~/models/item.server";

const createItemAction = "createItem";
const updateItemAction = "updateItem";
const customAction = "customAction";

export async function action({ request, params }: ActionArgs) {
    invariant(params.cid, "cid not found");
    const cid = params.cid;

    console.log("running Collection action");

    const formData = await request.formData();
    console.log("form data: " + JSON.stringify(formData));

    const actionType = getStringOrThrow(formData, customAction);

    if (actionType == createItemAction) {
        const itemUrl = getStringOrThrow(formData, "itemUrl");
        await addItem(cid, itemUrl);
    } else if (actionType == updateItemAction) {
        const itemJson = getStringOrThrow(formData, "itemJson");
        const itemFront: ItemFront = JSON.parse(itemJson);
        await updateItem(cid, itemFront);
    } else {
        throw new Error("invalid actionType " + actionType);
    }

    return null;
}

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.cid, "cid not found");
    console.log("loader for CollectionDetailsPage " + params.cid);

    var collection = await getCollection(params.cid);
    if (collection == null) {
        throw new Response("Invalid Collection id", { status: 404 });
    }
    const items = await getCollectionItems(collection.id);
    const urls = items.map((i) => i.url);
    const infos = await requestMany(urls);

    return json({ collection, items, infos });
}

// export async function action({ request, params }: ActionArgs) {
//   const userId = await requireUserId(request);
//   invariant(params.noteId, "noteId not found");

//   await deleteNote({ userId, id: params.noteId });

//   return redirect("/notes");
// }

export default function CollectionDetailsPage() {

    console.log("rendering CollectionDetailsPage");
    const data = useLoaderData<typeof loader>();
    const infoMap = new Map<string, UInfo>();
    data.infos.forEach(info => {
        const betterInfo = JSON.parse(JSON.stringify(info));
        infoMap.set(info.url, betterInfo);
    });


    const formRef = useRef<HTMLFormElement>(null); //Add a form ref.

    const submit = useSubmit();

    const handleNewUrl = (url: string) => {
        console.log("new url: " + url);
        const validUrl = sanitizeUrl(url);
        if (!validUrl) {
            console.log("invalid URL!");
            return;
        }
        const formData = new FormData(formRef.current || undefined)
        formData.set(customAction, createItemAction);
        formData.set("itemUrl", url);
        submit(formData, { method: "post" });
    }

    const handleItemEdit = (item: ItemFront) => {
        console.log("handleItemEdit for " + item.url);
        const formData = new FormData(formRef.current || undefined)
        formData.set(customAction, updateItemAction);
        formData.set("itemJson", JSON.stringify(item));
        submit(formData, { method: "post" });
    }

    return (

        <div>
            <h3 className="text-2xl font-bold">{data.collection.title}</h3>
            <p className="py-6">{data.collection.description}</p>
            <hr className="my-4" />
            <h3>Add new Item</h3>
            <SingleFieldForm name="url" onSubmit={handleNewUrl} />
            <hr className="my-4" />
            <h3>Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.items.map((item) => (
                    <EditableItem key={item.url} item={item} info={infoMap.get(item.url)!} onSave={handleItemEdit} />
                ))}
            </div>
            <Form ref={formRef} className="invisible"></Form>
        </div>
    );
}