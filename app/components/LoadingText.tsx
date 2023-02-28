import React, { useState, useEffect } from 'react';

function LoadingText() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length === 3) {
          return '';
        }
        return prevDots + '.';
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      Loading
      {dots}
    </>
  );
}

export default LoadingText;