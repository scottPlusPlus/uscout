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
};

export default function AdminPage() {

    const data = useLoaderData<typeof loader>();
    const rolesData: CollectionRoles[] = !data ? [] : !data.roles ? [] : JSON.parse(JSON.stringify(data.roles));

    const [sortBy, doSetSortBy] = useState('updated');
    const setSortBy = (str: string) => {
        doSetSortBy(str);
    }

    const sortedEvents = () => {
        console.log("sorting by " + sortBy);
        const x = rolesData.sort((a, b) => {
            switch (sortBy) {
                case 'userId':
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
            </tr>
        ));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold">Admin</h3>
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Roles Table</h2>
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => setSortBy('collectionId')}
                            >
                                Collection
                            </th>
                            <th
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => setSortBy('userId')}
                            >
                                User
                            </th>
                            <th
                                className="px-4 py-2 cursor-pointer"
                            >
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody>{renderRows()}</tbody>
                </table>
            </div>
        </div>
    );
}
