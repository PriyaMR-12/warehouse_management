import React, { useState, useEffect, useRef } from 'react';
import { Fade, Grow, Slide, Zoom } from '@mui/material';

const AnimatedContainer = ({ 
  children, 
  animation = 'fade', 
  direction = 'up', 
  timeout = 500, 
  delay = 0,
  style = {} 
}) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const animationProps = {
    in: mounted,
    timeout,
    style: { ...style, transitionDelay: `${delay}ms` },
    mountOnEnter: true,
    unmountOnExit: true
  };

  // Wrap children in a div to ensure proper mounting
  const wrappedChildren = (
    <div ref={containerRef} style={{ display: 'inline-block', width: '100%' }}>
      {children}
    </div>
  );

  switch (animation) {
    case 'fade':
      return <Fade {...animationProps}>{wrappedChildren}</Fade>;
    case 'grow':
      return <Grow {...animationProps}>{wrappedChildren}</Grow>;
    case 'slide':
      return <Slide direction={direction} {...animationProps}>{wrappedChildren}</Slide>;
    case 'zoom':
      return <Zoom {...animationProps}>{wrappedChildren}</Zoom>;
    default:
      return wrappedChildren;
  }
};

export default AnimatedContainer; 