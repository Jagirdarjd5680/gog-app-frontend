import React from 'react';

export const Spinner = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}) => {
  let sizeClass = 'w-6 h-6 border-2';
  
  switch (size) {
    case 'sm':
      sizeClass = 'w-4 h-4 border-2';
      break;
    case 'md':
      sizeClass = 'w-6 h-6 border-2';
      break;
    case 'lg':
      sizeClass = 'w-8 h-8 border-[3px]';
      break;
  }

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-vc-primary ${sizeClass} ${className}`}
      {...props}
    />
  );
};

export const Preloader = ({
  text = 'Loading...',
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 p-8 ${className}`} {...props}>
      <Spinner size="lg" />
      {text && (
        <span className="font-sans text-[14px] text-vc-mute font-medium animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};
