import { useState } from 'react';
import { UInfo } from "@prisma/client";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CSS_CLASSES } from '~/code/CssClasses';
dayjs.extend(relativeTime);

type Props = {
  uinfos: UInfo[];
  onDelete: (arg0: string)=>void;
};

export default function UInfoTable({ uinfos, onDelete }: Props) {

  const cleanUInfos = uinfos.map((u) => {
    const copy = { ...u };
    copy.url = copy.url.replace(/^https?:\/\//i, '');
    return copy;
  })

  const [sortBy, doSetSortBy] = useState('updated');
  const setSortBy = (str: string) => {
    doSetSortBy(str);
  }

  const sortedUInfos = ()=> {
    console.log("sorting by " + sortBy);
    const x = cleanUInfos.sort((a, b) => {
      switch(sortBy){
        case 'created':
          return dayjs(b.created).diff(dayjs(a.created));
        case 'url':
          return a.url.localeCompare(b.url);
        case 'hash':
          return a.hash.localeCompare(b.hash);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return dayjs(b.updated).diff(dayjs(a.updated));
      }
    });
    return x;
  };

  const renderRows = () => {
    console.log("render rows...");
    return sortedUInfos().map((uinfo) => (
      <tr key={uinfo.url}>
        <td className="px-4 py-2">{uinfo.url}</td>
        <td className="px-4 py-2">{uinfo.title}</td>
        <td className="px-4 py-2">{uinfo.image}</td>
        <td className="px-4 py-2">{uinfo.hash.substring(0, 8)}...</td>
        <td className="px-4 py-2">{dayjs(uinfo.created).fromNow()}</td>
        <td className="px-4 py-2">{dayjs(uinfo.updated).fromNow()}</td>
        <td className="px-4 py-2"> <button
                className={CSS_CLASSES.SUBMIT_BUTTON}
                type="submit"
                onClick={()=>{onDelete(uinfo.url)}}
            >
                Delete
            </button>
            </td>
      </tr>
    ));
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4">UInfo Table</h2>
      <table className="table-auto">
        <thead>
          <tr>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('url')}
            >
              URL
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('title')}
            >
              Title
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('image')}
            >
              Image
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('hash')}
            >
              Hash
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('created')}
            >
              Created
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSortBy('updated')}
            >
              Updated
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
            >
              ...
            </th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </div>
  );
}