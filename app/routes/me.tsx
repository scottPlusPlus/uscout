import type { ActionArgs } from "@remix-run/node";
import * as React from "react";
import Modal from 'react-modal';
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData, useActionData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { collectionsForUser, getCollection, createCollection } from "~/models/collection.server";
import { Collection } from "@prisma/client";


export async function action({ request }: ActionArgs) {
  console.log("running New Collection action");
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const formId = formData.get("id");

  if (typeof formId !== "string" || formId.length === 0) {
      return json(
          { errors: { id: null, title: null, description: "id is required" } },
          { status: 400 }
      );
  }
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if  (!slugRegex.test(formId)){
      return json(
          { errors: { id: "id must be a valid url slug", title: null, description: null } },
          { status: 400 }
      );
  }

  const existingCollection = await getCollection(formId);
  if (existingCollection != null){
      return json(
          { errors: { id: "that slug is already taken", title: null, description: null } },
          { status: 400 }
      );
  }

  if (typeof title !== "string" || title.length === 0) {
      return json(
          { errors: {  id: null, title: "Title is required", description: null } },
          { status: 400 }
      );
  }

  if (typeof description !== "string" || description.length === 0) {
      return json(
          { errors: { id: null,  title: null, description: "description is required" } },
          { status: 400 }
      );
  }

  const collection = await createCollection({ id:formId, title, description }, userId);

  return redirect(`/c/${collection.id}`);
}

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
        <NewCollectionModal/>
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

const NewCollectionModal = () => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  return (<div>
  <button className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
  onClick={openModal}>New Collection</button>
  <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="New Collection Form"
  >
      <NewCollectionPage />
      <button
      className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
      onClick={closeModal}>Close</button>

  </Modal>
</div>)

}

export function NewCollectionPage() {
  const actionData = useActionData<typeof action>();
  const idRef = React.useRef<HTMLInputElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
      if (actionData?.errors?.title) {
          titleRef.current?.focus();
      } else if (actionData?.errors?.description) {
          bodyRef.current?.focus();
      }
  }, [actionData]);

  return (
      <Form
          method="post"
          style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
          }}
      >
          <div>
              <label className="flex w-full flex-col gap-1">
                  <span>Id: </span>
                  <input
                      ref={idRef}
                      name="id"
                      className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                      aria-invalid={actionData?.errors?.id ? true : undefined}
                      aria-errormessage={
                          actionData?.errors?.id ? "id-error" : undefined
                      }
                  />
              </label>
              {actionData?.errors?.id && (
                  <div className="pt-1 text-red-700" id="id-error">
                      {actionData.errors.id}
                  </div>
              )}

              <label className="flex w-full flex-col gap-1">
                  <span>Title: </span>
                  <input
                      ref={titleRef}
                      name="title"
                      className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                      aria-invalid={actionData?.errors?.title ? true : undefined}
                      aria-errormessage={
                          actionData?.errors?.title ? "title-error" : undefined
                      }
                  />
              </label>
              {actionData?.errors?.title && (
                  <div className="pt-1 text-red-700" id="title-error">
                      {actionData.errors.title}
                  </div>
              )}
          </div>

          <div>
              <label className="flex w-full flex-col gap-1">
                  <span>Description: </span>
                  <textarea
                      ref={bodyRef}
                      name="description"
                      rows={8}
                      className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
                      aria-invalid={actionData?.errors?.description ? true : undefined}
                      aria-errormessage={
                          actionData?.errors?.description ? "body-error" : undefined
                      }
                  />
              </label>
              {actionData?.errors?.description && (
                  <div className="pt-1 text-red-700" id="body-error">
                      {actionData.errors.description}
                  </div>
              )}
          </div>

          <div className="text-right">
              <button
                  type="submit"
                  className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                  Save
              </button>
          </div>
      </Form>
  );
}