import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { createCollection, getCollection } from "~/models/collection.server";
import { requireUserId } from "~/session.server";

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

export default function NewCollectionPage() {
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
