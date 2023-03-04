import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";


import invariant from "tiny-invariant";
import { getCollection } from "~/models/collection.server";


export async function loader({ request, params }: LoaderArgs) {
  invariant(params.cid, "cid not found");

  var collection = await getCollection(params.cid);
    if (collection == null){
            throw new Response("Invalid Collection id", { status: 404 });
    }

  return json({ collection });
}

// export async function action({ request, params }: ActionArgs) {
//   const userId = await requireUserId(request);
//   invariant(params.noteId, "noteId not found");

//   await deleteNote({ userId, id: params.noteId });

//   return redirect("/notes");
// }

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.collection.title}</h3>
      <p className="py-6">{data.collection.description}</p>
      <hr className="my-4" />
    
    </div>
  );
}