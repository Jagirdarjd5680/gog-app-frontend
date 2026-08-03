import React from 'react';

export const Input = React.forwardRef(({
  type = 'text',
  size = 'md', // 'sm' | 'md' | 'lg'
  placeholder = '',
  disabled = false,
  error = false,
  className = '',
  ...props
}, ref) => {
  let baseStyles = 'w-full bg-vc-canvas text-vc-ink border border-vc-hairline rounded-[6px] transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-vc-ink placeholder:text-vc-mute';
  let sizeStyles = '';

  switch (size) {
    case 'sm':
      // form-input-sm (32px tall, body-sm)
      sizeStyles = 'h-[32px] px-3 text-[14px] leading-[20px]';
      break;
    case 'md':
      // form-input (40px tall, body-sm)
      sizeStyles = 'h-[40px] px-4 text-[14px] leading-[20px]';
      break;
    case 'lg':
      // form-input-lg (48px tall, body-md)
      sizeStyles = 'h-[48px] px-4 text-[16px] leading-[24px]';
      break;
    default:
      sizeStyles = 'h-[40px] px-4 text-[14px]';
  }

  if (error) {
    baseStyles += ' border-vc-error focus:ring-vc-error';
  }

  if (disabled) {
    baseStyles += ' opacity-50 cursor-not-allowed bg-vc-canvas-soft-2';
  }

  return (
    <input
      type={type}
      ref={ref}
      disabled={disabled}
      placeholder={placeholder}
      className={`${baseStyles} ${sizeStyles} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export const Select = React.forwardRef(({
  children,
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  error = false,
  className = '',
  ...props
}, ref) => {
  let baseStyles = 'w-full bg-vc-canvas text-vc-ink border border-vc-hairline rounded-[6px] transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-vc-ink appearance-none cursor-pointer';
  let sizeStyles = '';

  switch (size) {
    case 'sm':
      sizeStyles = 'h-[32px] pl-3 pr-8 text-[14px] leading-[20px]';
      break;
    case 'md':
      sizeStyles = 'h-[40px] pl-4 pr-10 text-[14px] leading-[20px]';
      break;
    case 'lg':
      sizeStyles = 'h-[48px] pl-4 pr-10 text-[16px] leading-[24px]';
      break;
    default:
      sizeStyles = 'h-[40px] pl-4 pr-10 text-[14px]';
  }

  if (error) {
    baseStyles += ' border-vc-error focus:ring-vc-error';
  }

  if (disabled) {
    baseStyles += ' opacity-50 cursor-not-allowed bg-vc-canvas-soft-2';
  }

  return (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-vc-body">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = 'Select';

export const Checkbox = React.forwardRef(({
  label,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`inline-flex items-center space-x-2 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <input
        type="checkbox"
        ref={ref}
        disabled={disabled}
        className="w-4 h-4 rounded-[4px] border-vc-hairline text-vc-primary bg-vc-canvas focus:ring-vc-ink focus:ring-offset-vc-canvas transition-all duration-150 accent-vc-primary"
        {...props}
      />
      {label && <span className="font-sans text-[14px] text-vc-body hover:text-vc-ink transition-colors duration-150">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export const Radio = React.forwardRef(({
  label,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`inline-flex items-center space-x-2 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <input
        type="radio"
        ref={ref}
        disabled={disabled}
        className="w-4 h-4 rounded-full border-vc-hairline text-vc-primary bg-vc-canvas focus:ring-vc-ink focus:ring-offset-vc-canvas transition-all duration-150 accent-vc-primary"
        {...props}
      />
      {label && <span className="font-sans text-[14px] text-vc-body hover:text-vc-ink transition-colors duration-150">{label}</span>}
    </label>
  );
});

Radio.displayName = 'Radio';

export const FormField = ({
  label,
  description,
  error,
  required = false,
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="font-sans text-[14px] font-medium text-vc-ink inline-flex items-center">
          {label}
          {required && <span className="text-vc-error ml-1">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <span className="font-sans text-[12px] text-vc-mute leading-normal">{description}</span>
      )}
      {error && (
        <span className="font-sans text-[12px] text-vc-error leading-normal font-medium">{error}</span>
      )}
    </div>
  );
};

export const Switch = React.forwardRef(({
  label,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`inline-flex items-center space-x-3 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          ref={ref}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className="w-9 h-5 bg-vc-canvas-soft-2 border border-vc-hairline rounded-full peer peer-focus:ring-1 peer-focus:ring-vc-ink peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-vc-ink after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vc-primary peer-checked:after:bg-vc-on-primary"></div>
      </div>
      {label && <span className="font-sans text-[14px] text-vc-body hover:text-vc-ink transition-colors duration-150">{label}</span>}
    </label>
  );
});

Switch.displayName = 'Switch';

export const TextArea = React.forwardRef(({
  rows = 4,
  disabled = false,
  error = false,
  className = '',
  placeholder = '',
  ...props
}, ref) => {
  let baseStyles = 'w-full bg-vc-canvas text-vc-ink border border-vc-hairline rounded-[6px] p-3 text-[14px] leading-[20px] transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-vc-ink placeholder:text-vc-mute resize-y';
  
  if (error) {
    baseStyles += ' border-vc-error focus:ring-vc-error';
  }

  if (disabled) {
    baseStyles += ' opacity-50 cursor-not-allowed bg-vc-canvas-soft-2';
  }

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';

