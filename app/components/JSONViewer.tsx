import React from 'react';

interface JSONViewerProps {
  data: Record<string, any>;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2); // pretty-print with 2 spaces

  return <pre>{jsonString}</pre>;
};

export default JSONViewer;