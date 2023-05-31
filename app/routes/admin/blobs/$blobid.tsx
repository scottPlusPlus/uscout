import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/server-runtime";
import { useRef, useState } from "react";
import invariant from "tiny-invariant";
import { ACTION_TYPES } from "~/code/actions";
import { getStringOrThrow } from "~/code/formUtils";
import { CSS_CLASSES } from "~/code/front/CssClasses";
import { nowHHMMSS } from "~/code/timeUtils";
import { userIsSuperAdmin } from "~/code/userUtils";
import { getBlob, setBlob } from "~/models/blobs.server";
import { getUserId } from "~/session.server";

const ACTIONS = {
    TYPE_FIELD: "a",
    DATA_FIELD: "aData",
}


//Remix Loader Func
export async function loader({ request, params }: LoaderArgs) {
    invariant(params.blobid, "blob-id not found");
    const admin = await userIsSuperAdmin(request);
    if (!admin) {
        redirect("/");
    }

    const blobid = params.blobid;
    var now = nowHHMMSS();

    const blob = await getBlob(params.blobid);
    return json({ blobid, blob });
}

//Remix Action
export async function action({ request, params }: ActionArgs) {
    invariant(params.blobid, "blob-id not found");
    console.log("blob action for " + params.blobid);
    const admin = await userIsSuperAdmin(request);
    if (!admin) {
        console.log("not admin...");
        return null;
    }

    const formData = await request.formData();
    const actionType = getStringOrThrow(formData, ACTIONS.TYPE_FIELD);
    if (actionType == ACTION_TYPES.CREATE_BLOB) {
        await setBlob(params.blobid, "");
    } else if (actionType == ACTION_TYPES.UPDATE_BLOB) {
        const inputData = getStringOrThrow(formData, ACTIONS.DATA_FIELD);
        await setBlob(params.blobid, inputData);
    } else {
        console.log("invalid action type: " + actionType);
    }

    const now = nowHHMMSS();
    console.log("done with set blob at " + now);

    return json({});
}


export default function BlobPage() {

    const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
    const submit = useSubmit();

    const data = useLoaderData<typeof loader>();
    const blob = data.blob;
    console.log("Render BlobPage with data: " + JSON.stringify(data));
    const origBlobState = blob?.value ? blob.value : "";

    const [blobState, setBlobState] = useState<string>(origBlobState);


    const submitAction = (action: string, actionData: string) => {
        console.log(`submitAction:  ${action},  ${actionData}`);
        const formData = new FormData(formRef.current || undefined)
        formData.set(ACTIONS.TYPE_FIELD, action);
        formData.set(ACTIONS.DATA_FIELD, actionData);
        submit(formData, { method: "post" });
    }

    const handleCreate = () => {
        submitAction(ACTION_TYPES.CREATE_BLOB, data.blobid);
    }
    const handleSave = () => {
        submitAction(ACTION_TYPES.UPDATE_BLOB, blobState);
    }

    const handleDiscard = () => {
        setBlobState(origBlobState);
    }

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBlobState(event.target.value);
    };

    const emptyBlobC = () => {
        if (blob != null) {
            return (null);
        }
        return (
            <div>
                <p>No blob with id {data.blobid}</p>
                <button
                    className={CSS_CLASSES.SUBMIT_BUTTON}
                    type="submit"
                    onClick={handleCreate}
                >
                    Create It
                </button>
            </div>
        )
    }

    const existingBlobC = () => {
        if (blob == null) {
            return (null);
        }
        return (


            <div>
                <p>Blob {data.blobid}</p>
                <textarea
                    className="w-full h-48 p-2 border rounded"
                    placeholder="Paste some text here"
                    value={blobState}
                    onChange={handleTextChange}
                />
                <div className="flex justify-between">
                    <button
                        className={CSS_CLASSES.CANCEL_BUTTON}
                        type="submit"
                        onClick={handleDiscard}
                    >
                        Cancel
                    </button>
                    <button
                        className={CSS_CLASSES.SUBMIT_BUTTON}
                        type="submit"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>

            </div>
        )
    }

    return (
        <div className="p-4">
            {emptyBlobC()}
            {existingBlobC()}
            <Form ref={formRef} className="invisible"></Form>
        </div>
    )

}