import React from 'react';

export const Avatar = ({
  src,
  alt = '',
  initials = '',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  ...props
}) => {
  let sizeClass = 'w-10 h-10 text-[14px]';
  
  switch (size) {
    case 'xs':
      sizeClass = 'w-6 h-6 text-[10px]';
      break;
    case 'sm':
      sizeClass = 'w-8 h-8 text-[12px]';
      break;
    case 'md':
      sizeClass = 'w-10 h-10 text-[14px]';
      break;
    case 'lg':
      sizeClass = 'w-12 h-12 text-[16px]';
      break;
    case 'xl':
      sizeClass = 'w-16 h-16 text-[20px]';
      break;
  }

  const baseStyles = 'inline-flex items-center justify-center rounded-full bg-vc-canvas-soft-2 text-vc-body font-sans font-medium border border-vc-hairline select-none overflow-hidden';

  return (
    <div className={`${baseStyles} ${sizeClass} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="uppercase">{initials ? initials.slice(0, 2) : '?'}</span>
      )}
    </div>
  );
};

export const AvatarGroup = ({
  children,
  limit = 4,
  size = 'md',
  className = '',
  ...props
}) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, limit);
  const extraCount = avatars.length - limit;

  return (
    <div className={`flex -space-x-2.5 items-center ${className}`} {...props}>
      {visibleAvatars.map((child, idx) => {
        return React.cloneElement(child, {
          key: idx,
          size,
          className: `${child.props.className || ''} ring-2 ring-vc-canvas`
        });
      })}
      {extraCount > 0 && (
        <div 
          className={`flex items-center justify-center rounded-full bg-vc-canvas-soft text-vc-mute border border-vc-hairline font-sans font-semibold ring-2 ring-vc-canvas select-none
            ${size === 'xs' ? 'w-6 h-6 text-[9px]' : ''}
            ${size === 'sm' ? 'w-8 h-8 text-[11px]' : ''}
            ${size === 'md' ? 'w-10 h-10 text-[13px]' : ''}
            ${size === 'lg' ? 'w-12 h-12 text-[15px]' : ''}
            ${size === 'xl' ? 'w-16 h-16 text-[18px]' : ''}
          `}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
};
