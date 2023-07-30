import { AnalyticEvent, AnalyticEventByDay } from "@prisma/client";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { deleteOldEvents, getAnalyticsDataLast7Days, getRecentEvents, getTallyEvents, tallyAnalytics } from "~/models/analyticEvent.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
    const _ = await requireUserId(request);

    const summary = await getAnalyticsDataLast7Days();

    const events = await getRecentEvents();
    await tallyAnalytics()
    await deleteOldEvents()
    const tallyData  = await getTallyEvents()
    return json({ events , summary, tallyData});
};

export default function AdminPage() {

  const data = useLoaderData<typeof loader>();
  const dirtEvents:AnalyticEvent[] = !data ? [] : !data.events ? [] : JSON.parse(JSON.stringify(data.events));
  const dirtEventsByDay:AnalyticEventByDay[] = !data ? [] : !data.tallyData ? [] : JSON.parse(JSON.stringify(data.tallyData));
  const events = dirtEvents.map((e) => {
    const copy = { ...e };
    copy.data = copy.data.replace(/^https?:\/\//i, '');
    return copy;
  });

  const [sortBy, doSetSortBy] = useState('updated');
  const setSortBy = (str: string) => {
    doSetSortBy(str);
  }

  const sortedEvents = ()=> {
    console.log("sorting by " + sortBy);
    const x = events.sort((a, b) => {
      switch(sortBy){
        case 'event':
          return a.event.localeCompare(b.event);
        case 'data':
          return a.data.localeCompare(b.data);
          case 'ip':
        default:
          return dayjs(b.ts).diff(dayjs(a.ts));
      }
    });
    return x;
  };

  const sortedEventsByDay = ()=> {
    console.log("sorting by " + sortBy);
    const x = dirtEventsByDay.sort((a, b) => {
      switch(sortBy){
        case 'event':
          return a.event.localeCompare(b.event);
        case 'data':
          return a.data.localeCompare(b.data);
        case 'count':
          return a.count - b.count;
        default:
          return dayjs(b.day).diff(dayjs(a.day));
      }
    });
    return x;
  };

  const renderRows = () => {
    console.log("render rows...");
    return sortedEvents().map((aEvent) => (
      <tr key={aEvent.id}>
        <td className="px-4 py-2">{dayjs(aEvent.ts).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td className="px-4 py-2">{aEvent.event}</td>
        <td className="px-4 py-2">{aEvent.data}</td>
        <td className="px-4 py-2">{aEvent.ip}</td>
      </tr>
    ));
  };

  const renderRowsAnalyticEventByDay = () => {
    console.log("render rows...");
    return sortedEventsByDay().map((aEvent) => (
      <tr key={aEvent.id}>
        <td className="px-4 py-2">{dayjs(aEvent.day).format('YYYY-MM-DD')}</td>
        <td className="px-4 py-2">{aEvent.event}</td>
        <td className="px-4 py-2">{aEvent.data}</td>
        <td className="px-4 py-2">{aEvent.count}</td>
      </tr>
    ));
  };

  return (
    <div>
    <h3 className="text-2xl font-bold">Admin</h3>
    <div className="flex flex-col">
       <h2 className="text-2xl font-bold mb-4">Summary</h2>
       <div>
        {data.summary.map(item => (
          <p>{item.count} . {item.event} . {item.data}</p>
            ))}
       </div>

      <h2 className="text-2xl font-bold mb-4">Analytic Table</h2>
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
              onClick={() => setSortBy('event')}
            >
              Event
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('data')}
            >
              Data
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('ip')}
            >
              IP
            </th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
      <h2 className="text-2xl font-bold mb-4">Analytic Event By Day Table</h2>
      <table className="table-auto">
        <thead>
          <tr>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('day')}
            >
              Day
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('event')}
            >
              Event
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('data')}
            >
              Data
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('count')}
            >
              Count
            </th>
          </tr>
        </thead>
        <tbody>{renderRowsAnalyticEventByDay()}</tbody>
      </table>

    </div>
    </div>
  );
  }
