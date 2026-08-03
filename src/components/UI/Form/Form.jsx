import React from 'react';

export const FormGroup = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col space-y-5 w-full ${className}`} {...props}>
      {children}
    </div>
  );
};

export const FormRow = ({ 
  children, 
  columns = 2, // 1 | 2 | 3 | 4
  className = '', 
  ...props 
}) => {
  let gridCols = 'grid-cols-1 md:grid-cols-2';
  
  if (columns === 1) {
    gridCols = 'grid-cols-1';
  } else if (columns === 3) {
    gridCols = 'grid-cols-1 md:grid-cols-3';
  } else if (columns === 4) {
    gridCols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
  }

  return (
    <div className={`grid gap-6 w-full ${gridCols} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const FormSection = ({
  title,
  description,
  footer,
  children,
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`border border-vc-hairline rounded-[8px] bg-vc-canvas vc-shadow-l2 overflow-hidden flex flex-col w-full ${className}`}
      {...props}
    >
      <div className="p-6 flex flex-col space-y-4">
        {(title || description) && (
          <div className="flex flex-col space-y-1">
            {title && (
              <h3 className="font-sans text-[18px] font-semibold tracking-[-0.6px] text-vc-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="font-sans text-[14px] text-vc-body leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col space-y-4 pt-1">
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-6 py-3.5 bg-vc-canvas-soft border-t border-vc-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {footer}
        </div>
      )}
    </div>
  );
};
