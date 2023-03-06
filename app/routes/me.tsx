import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { collectionsForUser, getCollection } from "~/models/collection.server";
import { Collection } from "@prisma/client";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const collectionIds = await collectionsForUser(userId); 
  const collectionP = collectionIds.map(cid => {
    return getCollection(cid);
  });
  const collections = await Promise.all(collectionP);
  return json({ collections });
}

export default function UserPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const collections:Collection[] = [];
  data.collections.forEach(x => {
    if (x != null){
        collections.push(JSON.parse(JSON.stringify(x)));
    }
  });

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          Hello
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="flex-1 p-6">
        {collections.map((collection) => (
                <li key={collection.id}>
                  <Link to={"/c/"+collection!.id}
                  >
                    {collection.id}: {collection.title}
                  </Link>
                </li>
              ))}
        </div>
      </main>
    </div>
  );
}
