import { Feedback } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, json } from "@remix-run/server-runtime";
import dayjs from "dayjs";
import { useState } from "react";
import { getRecentFeedback } from "~/models/feedback.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
    const _ = await requireUserId(request);
    const feedback = await getRecentFeedback(null, null);
    return json({ feedback });
};

export default function AdminPage() {

    const data = useLoaderData<typeof loader>();
    const feedbackData: Feedback[] = !data ? [] : !data.feedback ? [] : JSON.parse(JSON.stringify(data.feedback));

    const [sortBy, doSetSortBy] = useState('time');
    const setSortBy = (str: string) => {
        doSetSortBy(str);
    }

    const sortedEvents = () => {
        console.log("sorting by " + sortBy);
        const x = feedbackData.sort((a, b) => {
            switch (sortBy) {
                case 'context':
                    return a.context.localeCompare(b.context);
                case 'ip':
                    return a.ip.localeCompare(b.ip);
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return dayjs(b.ts).diff(dayjs(a.ts));
            }
        });
        return x;
    };

    const renderRows = () => {
        console.log("render rows...");
        return sortedEvents().map((x) => (
            <tr key={x.id}>
                <td className="px-4 py-2">{dayjs(x.ts).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td className="px-4 py-2">{x.context}</td>
                <td className="px-4 py-2">{x.ip}</td>
                <td className="px-4 py-2">{x.email}</td>
                <td className="px-4 py-2">{x.feedback}</td>
            </tr>
        ));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold">Admin</h3>
            <div className="flex flex-col">

                <h2 className="text-2xl font-bold mb-4">Feedback Table</h2>
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => setSortBy('time')}
                            >
                                Time
                            </th>
                            <th
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => setSortBy('context')}
                            >
                                Context
                            </th>
                            <th
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => setSortBy('ip')}
                            >
                                IP
                            </th>
                            <th
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => setSortBy('email')}
                            >
                                Email
                            </th>
                            <th
                                className="px-4 py-2"
                            >
                                Feedback
                            </th>
                        </tr>
                    </thead>
                    <tbody>{renderRows()}</tbody>
                </table>
            </div>
        </div>
    );
}
