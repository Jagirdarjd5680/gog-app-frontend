import React, { useState } from 'react';

export const Tooltip = ({
  content,
  children,
  placement = 'top', // 'top' | 'bottom' | 'left' | 'right'
  className = '',
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  let placementStyles = '';
  switch (placement) {
    case 'top':
      placementStyles = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      break;
    case 'bottom':
      placementStyles = 'top-full left-1/2 -translate-x-1/2 mt-2';
      break;
    case 'left':
      placementStyles = 'right-full top-1/2 -translate-y-1/2 mr-2';
      break;
    case 'right':
      placementStyles = 'left-full top-1/2 -translate-y-1/2 ml-2';
      break;
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      {...props}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 whitespace-nowrap bg-vc-primary text-vc-on-primary text-[12px] leading-tight font-medium py-1.5 px-2.5 rounded-[4px] border border-vc-hairline/15 vc-shadow-l4 transition-opacity duration-150 ${placementStyles} ${className}`}>
          {content}
        </div>
      )}
    </div>
  );
};
