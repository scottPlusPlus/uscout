import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import UInfoModel from "~/models/uinfo.server";
import { nowHHMMSS } from "~/code/agnostic/timeUtils";
import UInfoTable from "~/components/UInfoTable";
import { requireUserId } from "~/session.server";
import { getStringOrThrow } from "~/code/formUtils";
import { useRef } from "react";

const actionType = "actionType";
const actionDeleteUrl = "delete";


export async function action({ request, params }: ActionArgs) {
  console.log("running scout admin action");

  //if no userId, throws a redirect to login page
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const aType = getStringOrThrow(formData, actionType);

  if (aType == actionDeleteUrl) {
      const itemUrl = getStringOrThrow(formData, "itemUrl");
      await UInfoModel.removeUinfo(userId, itemUrl);
  } else {
      throw new Error("invalid actionType " + actionType);
  }

  return null;
}


export async function loader({ request, params }: LoaderArgs) {
    console.log(`${nowHHMMSS()}: admin Loader`);
    const infos = await UInfoModel.getRecent();
    console.log(`have ${infos.length} infos`);
    return json({ infos });
};

export default function AdminPage() {

  const data = useLoaderData<typeof loader>();
  const uInfos = !data ? [] : !data.infos ? [] : JSON.parse(JSON.stringify(data.infos));
  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();
  
  const handleDeleteInfo = (url:string) => {
    const formData = new FormData(formRef.current || undefined)
    formData.set(actionType, actionDeleteUrl);
    formData.set("itemUrl", url);
    submit(formData, { method: "post" });
  }

    return (
      <div>
        <h3 className="text-2xl font-bold">Admin</h3>
        <UInfoTable uinfos={uInfos} onDelete={handleDeleteInfo}/>
        <Form ref={formRef} className="invisible"></Form>
      </div>
    );
  }
