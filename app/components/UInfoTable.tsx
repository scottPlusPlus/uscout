import { useState } from 'react';
import { UInfo } from "@prisma/client";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CSS_CLASSES } from '~/code/front/CssClasses';
import { UInfoV2, hashOrF, imageOrF, titleOrF, updatedTime } from '~/code/datatypes/info';
dayjs.extend(relativeTime);

type Props = {
  uinfos: UInfoV2[];
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
        case 'url':
          return a.url.localeCompare(b.url);
        case 'hash':
          return hashOrF(a).localeCompare(hashOrF(b));
        case 'title':
          return titleOrF(a).localeCompare(titleOrF(b));
        default:
          return dayjs(updatedTime(b)).diff(dayjs(updatedTime(a)));
      }
    });
    return x;
  };

  const renderRows = () => {
    console.log("render rows...");
    return sortedUInfos().map((uinfo) => (
      <tr key={uinfo.url}>
        <td className="px-4 py-2">{uinfo.url}</td>
        <td className="px-4 py-2">{titleOrF(uinfo)}</td>
        <td className="px-4 py-2">{imageOrF(uinfo)}</td>
        <td className="px-4 py-2">{hashOrF(uinfo).substring(0, 8)}...</td>
        <td className="px-4 py-2">{dayjs(updatedTime(uinfo)*1000).fromNow()}</td>
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