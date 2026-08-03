import React from 'react';

export const Badge = ({
  children,
  variant = 'secondary', // 'secondary' | 'success' | 'warning' | 'error' | 'violet' | 'cyan'
  className = '',
  ...props
}) => {
  let baseStyles = 'inline-flex items-center font-sans text-[12px] font-medium leading-[16px] rounded-full px-2.5 h-[20px] select-none';
  let variantStyles = '';

  switch (variant) {
    case 'secondary':
      // badge-secondary: bg-vc-canvas-soft, text-vc-body
      variantStyles = 'bg-vc-canvas-soft-2 text-vc-body border border-vc-hairline';
      break;
    case 'success':
      variantStyles = 'bg-[#d3e5ff] text-vc-link border border-[#a3c9ff] dark:bg-[#002554] dark:text-[#3291ff] dark:border-[#003c80]';
      break;
    case 'warning':
      variantStyles = 'bg-vc-warning-soft text-vc-warning-deep border border-[#ffe09e] dark:bg-[#3a2200] dark:text-[#ffb84d] dark:border-[#6b3e00]';
      break;
    case 'error':
      variantStyles = 'bg-vc-error-soft text-vc-error-deep border border-[#f9b2b5] dark:bg-[#3f0e11] dark:text-[#ff0000] dark:border-[#7d1c22]';
      break;
    case 'violet':
      variantStyles = 'bg-vc-violet-soft text-vc-violet-deep border border-[#be9df2] dark:bg-[#25103f] dark:text-[#c084fc] dark:border-[#4c2889]';
      break;
    case 'cyan':
      variantStyles = 'bg-vc-cyan-soft text-vc-cyan-deep border border-[#61ffd6] dark:bg-[#08332b] dark:text-[#29bc9b] dark:border-[#135c4b]';
      break;
    default:
      variantStyles = 'bg-vc-canvas-soft-2 text-vc-body';
  }

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  );
};

export const Banner = ({
  children,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center font-sans text-[14px] leading-[20px] text-vc-body hover:text-vc-ink hover:border-vc-hairline-strong transition-all duration-150 rounded-full px-4 py-1.5 border border-vc-hairline bg-vc-canvas-soft cursor-pointer select-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
