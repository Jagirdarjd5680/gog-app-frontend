import React from 'react';

export const Card = ({
  children,
  variant = 'marketing', // 'marketing' | 'marketing-large' | 'soft' | 'template' | 'pricing' | 'pricing-featured'
  className = '',
  ...props
}) => {
  let baseStyles = 'border transition-all duration-150 flex flex-col overflow-hidden';
  let variantStyles = '';

  switch (variant) {
    case 'marketing':
      // card-marketing: canvas background, rounded.md (8px), padding (24px), Level 3 shadow
      variantStyles = 'bg-vc-canvas text-vc-ink rounded-[8px] border-vc-hairline p-6 vc-shadow-l3';
      break;
    case 'marketing-large':
      // card-marketing-large: canvas background, rounded.lg (12px), padding (32px), Level 4 shadow
      variantStyles = 'bg-vc-canvas text-vc-ink rounded-[12px] border-vc-hairline p-8 vc-shadow-l4';
      break;
    case 'soft':
      // card-soft: canvas-soft background, rounded.md (8px), padding (24px), no shadow
      variantStyles = 'bg-vc-canvas-soft text-vc-ink rounded-[8px] border-vc-hairline p-6';
      break;
    case 'template':
      // template-card: canvas background, rounded.md (8px), padding (16px), Level 2 shadow
      variantStyles = 'bg-vc-canvas text-vc-ink rounded-[8px] border-vc-hairline p-4 vc-shadow-l2';
      break;
    case 'pricing':
      // pricing-card: default pricing card, canvas background, rounded.lg (12px), padding (32px), Level 3 shadow
      variantStyles = 'bg-vc-canvas text-vc-ink rounded-[12px] border-vc-hairline p-8 vc-shadow-l3';
      break;
    case 'pricing-featured':
      // pricing-card-featured: polarity-flipped, primary background, rounded.lg (12px), padding (32px), Level 4 shadow
      variantStyles = 'bg-vc-primary text-vc-on-primary rounded-[12px] border-vc-primary p-8 vc-shadow-l4';
      break;
    default:
      variantStyles = 'bg-vc-canvas text-vc-ink rounded-[8px] border-vc-hairline p-6 vc-shadow-l2';
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex-1 text-vc-body text-[14px] leading-[20px] ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center pt-4 mt-auto border-t border-vc-hairline ${className}`} {...props}>
      {children}
    </div>
  );
};
