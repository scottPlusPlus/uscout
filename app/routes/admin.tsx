import { useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import UInfoModel from "~/models/uinfo.server";
import { nowHHMMSS } from "~/code/timeUtils";
import UInfoTable from "~/components/UInfoTable";

export async function loader({ request, params }: LoaderArgs) {
    console.log(`${nowHHMMSS()}: admin Loader`);
    const infos = await UInfoModel.getRecent();
    console.log(`have ${infos.length} infos`);
    return json({ infos });
};

export default function AdminPage() {

  const data = useLoaderData<typeof loader>();
  const uInfos = !data ? [] : !data.infos ? [] : JSON.parse(JSON.stringify(data.infos));

    return (
      <div>
        <h3 className="text-2xl font-bold">Admin</h3>
        <UInfoTable uinfos={uInfos}/>
      </div>
    );
  }