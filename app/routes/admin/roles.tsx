import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { CollectionRoles } from "@prisma/client";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState, useRef } from "react";
import { getRolesTable } from "~/models/role.server";
import { requireUserId } from "~/session.server";
import { ACTION_TYPES, collectionAction } from "~/code/actions";
import invariant from "tiny-invariant";
import { getStringOrThrow } from "~/code/formUtils";
import { getUserId } from "~/session.server";
import { nowHHMMSS } from "~/code/agnostic/timeUtils";
interface AdminPageProps {
  rolesData: CollectionRoles[];
}

type CollectionRolesWithUserEmail = CollectionRoles & { email?: string };

const ACTIONS = {
  TYPE_FIELD: "a",
  DATA_FIELD: "aData"
};

export async function loader({ request, params }: LoaderArgs) {
  const _ = await requireUserId(request);
  const roles = await getRolesTable();
  return json({ roles });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.cid, "cid not found");
  console.log("CollectionDetailsPage action");

  console.log("Params: ", params);

  const formData = await request.formData();
  const aType = getStringOrThrow(formData, ACTIONS.TYPE_FIELD);
  const userId = await getUserId(request);
  const inputData = getStringOrThrow(formData, ACTIONS.DATA_FIELD);

  if (userId) {
    const actionResult = await collectionAction(
      userId,
      params.cid,
      aType,
      inputData
    );

    const now = nowHHMMSS();
    console.log("done with action at " + now);

    if (actionResult.redirect) {
      redirect(actionResult.redirect);
    }
    return json({
      action: aType,
      error: actionResult.err,
      data: actionResult.data,
      time: now
    });
  }
}

function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}

export default function AdminPage(props: AdminPageProps) {
  const data = useLoaderData<typeof loader>();

  const formRef = useRef<HTMLFormElement>(null); //Add a form ref.
  const submit = useSubmit();

  const rolesData: CollectionRolesWithUserEmail[] = !data
    ? []
    : !data.roles
    ? []
    : JSON.parse(JSON.stringify(data.roles));

  const [sortBy, doSetSortBy] = useState("email");
  const setSortBy = (str: string) => {
    doSetSortBy(str);
  };

  const sortedEvents = () => {
    console.log("sorting by " + sortBy);
    const roles = rolesData.sort((a, b) => {
      switch (sortBy) {
        case "role":
          return a.role.localeCompare(b.role);
        default:
          const emailA = a.email ?? "";
          const emailB = b.email ?? "";
          return emailA.localeCompare(emailB);
      }
    });
    return roles;
  };

  const renderRows = () => {
    console.log("render rows...");
    return sortedEvents().map((r) => (
      <tr key={r.email}>
        <td className="px-4 py-2">{r.email}</td>
        <td className="px-4 py-2">{r.role}</td>
        {!isEmptyObject(props) && (
          <td className="px-4 py-2">
            <button onClick={() => handleDeleteUser(r)}>
              <i className="fas fa-trash-alt"></i>
            </button>
          </td>
        )}
      </tr>
    ));
  };

  const handleDeleteUser = (collectionRole: Object) => {
    console.log("handleDeleteUser for " + collectionRole);
    const action = ACTION_TYPES.DELETE_USER;
    // setAddUserPending(true);
    try {
      const actionData = JSON.stringify(collectionRole);
      console.log("actionData: ", actionData);
      submitAction(action, actionData);
    } catch (error) {
      //   setAddUserPending(false);
    }
  };

  const submitAction = (action: string, actionData: string) => {
    console.log(`submitAction:  ${action},  ${actionData}`);
    const formData = new FormData(formRef.current || undefined);
    formData.set(ACTIONS.TYPE_FIELD, action);
    formData.set(ACTIONS.DATA_FIELD, actionData);
    // handleSearchUpdate(searchTerms, true);
    console.log("Form Data: ", formData);
    submit(formData, { method: "delete" });
  };

  return (
    <div>
      <h3 className="text-2xl font-bold">Admin</h3>
      <div className="flex flex-col">
        <h2 className="mb-4 text-2xl font-bold">Roles Table</h2>
        <table className="table-auto">
          <thead>
            <tr>
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => setSortBy("email")}
              >
                User
              </th>
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => setSortBy("role")}
              >
                Role
              </th>
              {!isEmptyObject(props) && <th className="px-4 py-2">Actions</th>}{" "}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </div>
  );
}
