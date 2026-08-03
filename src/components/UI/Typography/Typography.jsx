import React, { useState } from 'react';

export const Heading = ({
  children,
  variant = 'display-lg', // 'display-xl' | 'display-lg' | 'display-md' | 'display-sm'
  as: Component = 'h2',
  className = '',
  ...props
}) => {
  let styles = 'font-sans font-semibold text-vc-ink leading-tight';

  switch (variant) {
    case 'display-xl':
      // display-xl: 48px, weight 600, leading 48px, tracking -2.4px
      styles += ' text-[36px] sm:text-[48px] leading-[48px] tracking-[-2.4px]';
      if (Component === 'h2') Component = 'h1';
      break;
    case 'display-lg':
      // display-lg: 32px, weight 600, leading 40px, tracking -1.28px
      styles += ' text-[28px] sm:text-[32px] leading-[40px] tracking-[-1.28px]';
      break;
    case 'display-md':
      // display-md: 24px, weight 600, leading 32px, tracking -0.96px
      styles += ' text-[22px] sm:text-[24px] leading-[32px] tracking-[-0.96px]';
      break;
    case 'display-sm':
      // display-sm: 20px, weight 600, leading 28px, tracking -0.6px
      styles += ' text-[18px] sm:text-[20px] leading-[28px] tracking-[-0.6px]';
      break;
  }

  return (
    <Component className={`${styles} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export const Text = ({
  children,
  variant = 'body-md', // 'body-lg' | 'body-md' | 'body-md-strong' | 'body-sm' | 'body-sm-strong' | 'caption' | 'caption-mono'
  as: Component = 'p',
  className = '',
  ...props
}) => {
  let styles = '';

  switch (variant) {
    case 'body-lg':
      styles = 'font-sans text-[18px] leading-[28px] text-vc-body';
      break;
    case 'body-md':
      styles = 'font-sans text-[16px] leading-[24px] text-vc-body';
      break;
    case 'body-md-strong':
      styles = 'font-sans text-[16px] leading-[24px] font-medium text-vc-ink';
      break;
    case 'body-sm':
      styles = 'font-sans text-[14px] leading-[20px] tracking-[-0.28px] text-vc-body';
      break;
    case 'body-sm-strong':
      styles = 'font-sans text-[14px] leading-[20px] tracking-[-0.28px] font-medium text-vc-ink';
      break;
    case 'caption':
      styles = 'font-sans text-[12px] leading-[16px] text-vc-mute';
      break;
    case 'caption-mono':
      styles = 'font-mono text-[12px] leading-[16px] text-vc-mute uppercase tracking-wider';
      break;
    default:
      styles = 'font-sans text-[16px] leading-[24px] text-vc-body';
  }

  return (
    <Component className={`${styles} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export const CodeBlock = ({
  code,
  filename = '',
  className = '',
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full bg-[#0a0a0a] border border-vc-hairline/10 rounded-[8px] flex flex-col overflow-hidden font-mono text-[13px] text-vc-on-primary vc-shadow-l4 ${className}`} {...props}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/40">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
          {filename && <span className="text-[12px] text-white/40 ml-2">{filename}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-white/40 hover:text-white bg-transparent hover:bg-white/5 px-2 py-1 rounded-[4px] text-[11px] font-sans transition-colors duration-150 cursor-pointer select-none"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[#00dfd8] leading-[20px] font-mono text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  );
};
