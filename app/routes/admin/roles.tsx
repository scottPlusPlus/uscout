import { CollectionRoles } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, json } from "@remix-run/server-runtime";
import { useState } from "react";
import { getRolesTable } from "~/models/role.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const _ = await requireUserId(request);
  const roles = await getRolesTable();
  return json({ roles });
}

interface AdminPageProps {
  rolesData: CollectionRoles[];
}

export default function AdminPage(props: AdminPageProps) {
  const data = useLoaderData<typeof loader>();
  const rolesData: CollectionRoles[] = !data
    ? []
    : !data.roles
    ? []
    : JSON.parse(JSON.stringify(data.roles));

  const [sortBy, doSetSortBy] = useState("updated");
  const setSortBy = (str: string) => {
    doSetSortBy(str);
  };

  const sortedEvents = () => {
    console.log("sorting by " + sortBy);
    const x = rolesData.sort((a, b) => {
      switch (sortBy) {
        case "userId":
          return a.userId.localeCompare(b.userId);
        default:
          return a.collectionId.localeCompare(b.collectionId);
      }
    });
    return x;
  };

  const renderRows = () => {
    console.log("render rows...");
    return sortedEvents().map((r) => (
      <tr key={r.id}>
        <td className="px-4 py-2">{r.collectionId}</td>
        <td className="px-4 py-2">{r.userId}</td>
        <td className="px-4 py-2">{r.role}</td>
        <td className="px-4 py-2">
          <button
            onClick={() => {
              handleDelete(r.id);
              console.log(r);
            }}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    ));
  };

  const handleDelete = (roleId: string) => {
    // Handle the deletion logic here.
    // For instance, you might make an API call to delete the role with the provided ID
    console.log("Deleting role with ID:", roleId);
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
                onClick={() => setSortBy("collectionId")}
              >
                Collection
              </th>
              <th
                className="cursor-pointer px-4 py-2"
                onClick={() => setSortBy("userId")}
              >
                User
              </th>
              <th className="cursor-pointer px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>{" "}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </div>
  );
}
