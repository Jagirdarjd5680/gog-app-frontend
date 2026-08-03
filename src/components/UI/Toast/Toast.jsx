import React from 'react';

export const Toast = ({
  title,
  description,
  variant = 'info', // 'success' | 'warning' | 'error' | 'info'
  onClose,
  className = '',
  ...props
}) => {
  let borderHighlight = 'border-l-4 border-l-blue-500';
  let icon = (
    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  switch (variant) {
    case 'success':
      borderHighlight = 'border-l-4 border-l-vc-success';
      icon = (
        <svg className="h-5 w-5 text-vc-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      );
      break;
    case 'warning':
      borderHighlight = 'border-l-4 border-l-vc-warning';
      icon = (
        <svg className="h-5 w-5 text-vc-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      break;
    case 'error':
      borderHighlight = 'border-l-4 border-l-vc-error';
      icon = (
        <svg className="h-5 w-5 text-vc-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
  }

  return (
    <div
      className={`flex bg-vc-canvas text-vc-ink rounded-[8px] p-4 border border-vc-hairline vc-shadow-l4 transition-all duration-200 w-full max-w-sm ${borderHighlight} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mr-3">{icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-sans text-[14px] font-semibold text-vc-ink leading-tight mb-1">{title}</h4>}
        {description && <p className="font-sans text-[13px] text-vc-body leading-normal">{description}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 flex-shrink-0 text-vc-mute hover:text-vc-ink hover:bg-vc-canvas-soft-2 p-1 rounded-full transition-colors duration-150 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const ToastContainer = ({
  children,
  placement = 'bottom-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className = '',
  ...props
}) => {
  let placementClass = 'bottom-6 right-6';
  switch (placement) {
    case 'top-right':
      placementClass = 'top-6 right-6';
      break;
    case 'top-left':
      placementClass = 'top-6 left-6';
      break;
    case 'bottom-right':
      placementClass = 'bottom-6 right-6';
      break;
    case 'bottom-left':
      placementClass = 'bottom-6 left-6';
      break;
  }

  return (
    <div
      className={`fixed z-50 flex flex-col space-y-3 pointer-events-auto ${placementClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
