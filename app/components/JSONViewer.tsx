import React from 'react';

interface JSONViewerProps {
  dataObj: Record<string, any>;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ dataObj }) => {
  const jsonString = JSON.stringify(dataObj, null, 2); // pretty-print with 2 spaces

  return <pre>{jsonString}</pre>;
};

export default JSONViewer;