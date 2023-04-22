import React, { useEffect, useRef } from 'react';
import sendAnalyticEvent from '~/code/front/analyticUtils';

export default function Observer(props: { name: string }) {
  const targetRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // the intersection ratio at which the callback will be triggered
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        sendAnalyticEvent("view", props.name);
        observer.disconnect();
      }
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, []);

  return (
    <div ref={targetRef}></div>
  );
}