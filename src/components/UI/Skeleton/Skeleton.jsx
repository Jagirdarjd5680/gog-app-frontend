import React from 'react';

export const Skeleton = ({
  variant = 'rect', // 'rect' | 'circle' | 'text'
  className = '',
  width,
  height,
  ...props
}) => {
  let shapeClass = 'rounded-[6px]';
  
  if (variant === 'circle') {
    shapeClass = 'rounded-full';
  } else if (variant === 'text') {
    shapeClass = 'rounded-[4px] h-[1em] mb-1.5 last:mb-0';
  }

  const baseStyles = 'animate-pulse bg-vc-canvas-soft-2 border border-vc-hairline/25';
  
  const styleObj = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div
      className={`${baseStyles} ${shapeClass} ${className}`}
      style={styleObj}
      {...props}
    />
  );
};
