import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'primary-sm' | 'secondary-sm' | 'signup' | 'login' | 'ask-ai'
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  leftIcon,
  rightIcon,
  loading = false,
  ...props
}) => {
  // Base styling adhering to the Geist geometric sans font specification (weight 500, sentence-case)
  let baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-150 focus:outline-none select-none cursor-pointer';
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      // The canonical 100-px-radius black pill (marketing scale)
      variantStyles = 'bg-vc-primary text-vc-on-primary hover:opacity-90 active:scale-98 text-[16px] leading-[24px] rounded-[100px] h-[48px] px-6';
      break;
    case 'secondary':
      // The white pill paired with primary inside marketing bands
      variantStyles = 'bg-vc-canvas text-vc-ink border border-vc-hairline hover:bg-vc-canvas-soft active:scale-98 text-[16px] leading-[24px] rounded-[100px] h-[48px] px-6 vc-shadow-l2';
      break;
    case 'primary-sm':
      // Small scale primary pill used inside nav and pricing card CTAs
      variantStyles = 'bg-vc-primary text-vc-on-primary hover:opacity-90 active:scale-98 text-[14px] leading-[20px] rounded-[100px] h-[36px] px-4';
      break;
    case 'secondary-sm':
      // Small scale secondary pill
      variantStyles = 'bg-vc-canvas text-vc-ink border border-vc-hairline hover:bg-vc-canvas-soft active:scale-98 text-[14px] leading-[20px] rounded-[100px] h-[36px] px-4 vc-shadow-l2';
      break;
    case 'signup':
      // Small black sign up nav button
      variantStyles = 'bg-vc-primary text-vc-on-primary hover:opacity-90 active:scale-98 text-[14px] font-medium rounded-[6px] h-[28px] px-3';
      break;
    case 'login':
      // Small white log in nav button
      variantStyles = 'bg-vc-canvas text-vc-ink hover:bg-vc-canvas-soft active:scale-98 text-[14px] font-medium rounded-[6px] h-[28px] px-3';
      break;
    case 'ask-ai':
      // Small Ask AI button with faint border
      variantStyles = 'bg-vc-canvas text-vc-ink border border-vc-hairline hover:bg-vc-canvas-soft active:scale-98 text-[14px] font-medium rounded-[6px] h-[28px] px-3 vc-shadow-l1';
      break;
    default:
      variantStyles = 'bg-vc-primary text-vc-on-primary hover:opacity-90 text-[14px] rounded-[6px] h-[40px] px-4';
  }

  if (disabled || loading) {
    variantStyles += ' opacity-50 cursor-not-allowed pointer-events-none';
  }

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};

export const TabGhost = ({
  children,
  active = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center font-sans text-[14px] leading-[20px] font-medium transition-all duration-150 select-none cursor-pointer rounded-[64px] h-[36px] px-4 border ${
        active 
          ? 'bg-vc-canvas text-vc-ink border-vc-hairline vc-shadow-l2' 
          : 'bg-transparent text-vc-body border-transparent hover:text-vc-ink hover:bg-vc-canvas-soft-2'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const IconButtonCircular = ({
  children,
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full w-[40px] h-[40px] bg-vc-canvas text-vc-ink border border-vc-hairline hover:bg-vc-canvas-soft transition-all duration-150 vc-shadow-l2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
