import React, { useState } from 'react';

export const Accordion = ({
  children,
  variant = 'boxed', // 'boxed' | 'borderless'
  className = '',
  ...props
}) => {
  const borderStyles = variant === 'boxed' 
    ? 'border border-vc-hairline rounded-[8px] bg-vc-canvas vc-shadow-l2 overflow-hidden' 
    : 'bg-transparent';

  return (
    <div className={`divide-y divide-vc-hairline ${borderStyles} ${className}`} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { variant });
        }
        return child;
      })}
    </div>
  );
};

export const AccordionItem = ({
  title,
  children,
  variant = 'boxed',
  defaultOpen = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const buttonPadding = variant === 'boxed' ? 'py-4 px-5' : 'py-3.5 px-1';
  const contentPadding = variant === 'boxed' ? 'py-4 px-5' : 'py-3 px-1';
  const buttonHover = variant === 'boxed' ? 'hover:bg-vc-canvas-soft' : 'hover:text-vc-ink';

  return (
    <div className={`flex flex-col w-full ${className}`} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex justify-between items-center w-full ${buttonPadding} ${buttonHover} text-left font-sans font-medium text-[15px] text-vc-ink transition-colors duration-150 cursor-pointer select-none`}
      >
        <span>{title}</span>
        <svg 
          className={`h-4 w-4 text-vc-body transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`transition-all duration-200 overflow-hidden ${
          isOpen ? 'max-h-[1000px] border-t border-vc-hairline/60' : 'max-h-0'
        }`}
      >
        <div className={`${contentPadding} font-sans text-[14px] text-vc-body bg-vc-canvas-soft/20 leading-[22px]`}>
          {children}
        </div>
      </div>
    </div>
  );
};
