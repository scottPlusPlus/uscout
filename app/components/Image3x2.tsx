import React from 'react';

interface ImageProps {
  src: string;
}

const Image3x2: React.FC<ImageProps> = ({ src }) => {
  const style: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    paddingBottom: '66.67%', // 3:2 aspect ratio
  };

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: 'auto',
  };

  return (
    <div style={style}>
      <img src={src} style={imgStyle} alt="" />
    </div>
  );
};

export default Image3x2;