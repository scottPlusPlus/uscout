import { useState } from 'react';
import { UInfo } from "@prisma/client";

type Props = {
  uInfos: UInfo[];
};

const UInfoTable: React.FC<Props> = ({ uInfos }) => {
  const [sortKey, setSortKey] = useState<string>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedUInfos = uInfos.sort((a, b) => {
    const valueA = a[sortKey];
    const valueB = b[sortKey];
    let comparison = 0;
    if (valueA > valueB) {
      comparison = 1;
    } else if (valueA < valueB) {
      comparison = -1;
    }
    return sortDirection === 'desc' ? comparison * -1 : comparison;
  });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortClick = (key: string) => {
    if (key === sortKey) {
      toggleSortDirection();
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSortClick('url')}>URL</th>
          <th onClick={() => handleSortClick('hash')}>Hash</th>
          <th onClick={() => handleSortClick('created')}>Created</th>
          <th onClick={() => handleSortClick('updated')}>Updated</th>
        </tr>
      </thead>
      <tbody>
        {sortedUInfos.map((uInfo) => (
          <tr key={uInfo.url}>
            <td>{uInfo.url}</td>
            <td>{uInfo.hash}</td>
            <td>{uInfo.created.toString()}</td>
            <td>{uInfo.updated.toString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UInfoTable;