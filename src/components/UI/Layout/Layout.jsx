import React from 'react';

// Centered layout container wrapping a max-width of 1400px (standard Vercel page width)
export const Container = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full max-w-[1400px] mx-auto px-6 md:px-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Premium, drifting mesh gradient background
export const MeshGradient = ({
  className = '',
  animate = true,
  opacity = 'opacity-20 dark:opacity-25'
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${opacity} ${className}`}>
      {/* Cyan Blob */}
      <div 
        className={`absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-vc-cyan blur-[120px] ${
          animate ? 'animate-blob-1' : ''
        }`}
      />
      {/* Blue Blob */}
      <div 
        className={`absolute top-[-20%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-500/80 blur-[130px] ${
          animate ? 'animate-blob-2' : ''
        }`}
      />
      {/* Pink/Magenta Blob */}
      <div 
        className={`absolute bottom-[-10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-vc-highlight-pink blur-[120px] ${
          animate ? 'animate-blob-3' : ''
        }`}
      />
      {/* Amber/Yellow Blob */}
      <div 
        className={`absolute top-[20%] left-[25%] w-[35vw] h-[35vw] rounded-full bg-amber-400/60 blur-[100px] ${
          animate ? 'animate-blob-1' : ''
        }`}
        style={{ animationDelay: '-5s', animationDuration: '24s' }}
      />
    </div>
  );
};

// Vercel navigation bar (64px height sticky top header)
export const NavBar = ({
  logo,
  links = [], // Array of { label, onClick, active }
  actions,
  className = '',
  ...props
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full h-[64px] border-b border-vc-hairline bg-vc-canvas/80 backdrop-blur-[12px] flex items-center ${className}`} {...props}>
      <Container className="flex items-center justify-between">
        {/* Logo left */}
        <div className="flex items-center space-x-2">
          {logo}
        </div>

        {/* Links center */}
        {links.length > 0 && (
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link, idx) => (
              <button
                key={idx}
                type="button"
                onClick={link.onClick}
                className={`font-sans text-[14px] leading-[20px] font-medium px-3 py-1.5 rounded-full transition-colors duration-150 cursor-pointer ${
                  link.active
                    ? 'text-vc-ink bg-vc-canvas-soft-2'
                    : 'text-vc-body hover:text-vc-ink hover:bg-vc-canvas-soft-2'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* Actions right */}
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      </Container>
    </header>
  );
};

// 4-column structured developer footer
export const Footer = ({
  columns = [], // Array of { title, links: [{ label, onClick }] }
  bottomContent,
  className = '',
  ...props
}) => {
  return (
    <footer className={`bg-vc-canvas border-t border-vc-hairline py-16 md:py-24 text-vc-body ${className}`} {...props}>
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col space-y-4">
              <span className="font-mono text-[12px] font-medium tracking-wider text-vc-mute uppercase">
                {col.title}
              </span>
              <ul className="flex flex-col space-y-2.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button
                      type="button"
                      onClick={link.onClick}
                      className="font-sans text-[14px] text-vc-body hover:text-vc-ink transition-colors duration-150 cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {bottomContent && (
          <div className="border-t border-vc-hairline pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {bottomContent}
          </div>
        )}
      </Container>
    </footer>
  );
};

// White hero section with mesh gradient backdrop
export const HeroBand = ({
  eyebrow,
  title,
  description,
  ctas,
  className = '',
  ...props
}) => {
  return (
    <section className={`relative overflow-hidden bg-vc-canvas py-24 md:py-32 border-b border-vc-hairline flex items-center justify-center text-center ${className}`} {...props}>
      {/* Background Mesh Gradient */}
      <MeshGradient />

      {/* Hero Content */}
      <Container className="relative z-10 flex flex-col items-center max-w-[800px]">
        {eyebrow && (
          <div className="mb-4">
            {eyebrow}
          </div>
        )}
        {title && (
          <h1 className="font-sans text-[36px] sm:text-[48px] font-semibold tracking-[-2.4px] text-vc-ink leading-none mb-6">
            {title}
          </h1>
        )}
        {description && (
          <p className="font-sans text-[18px] text-vc-body leading-[28px] max-w-[640px] mb-8">
            {description}
          </p>
        )}
        {ctas && (
          <div className="flex flex-wrap justify-center gap-4">
            {ctas}
          </div>
        )}
      </Container>
    </section>
  );
};

// Secondary section with ambient mesh highlights
export const FeatureMeshBand = ({
  title,
  description,
  children,
  className = '',
  ...props
}) => {
  return (
    <section className={`relative overflow-hidden bg-vc-canvas border-b border-vc-hairline py-20 md:py-28 ${className}`} {...props}>
      {/* Background Mesh Gradient - slightly dimmer for contrast */}
      <MeshGradient opacity="opacity-15 dark:opacity-20" />

      <Container className="relative z-10">
        <div className="max-w-[700px] mb-12">
          {title && (
            <h2 className="font-sans text-[28px] sm:text-[32px] font-semibold tracking-[-1.28px] text-vc-ink leading-tight mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="font-sans text-[16px] text-vc-body leading-[24px]">
              {description}
            </p>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
};

// Section band container with theme polarity controls
export const ShowcaseBand = ({
  children,
  themeMode = 'light', // 'light' (canvas-soft) | 'dark' (polarity-flipped primary)
  className = '',
  ...props
}) => {
  let bgClass = 'bg-vc-canvas-soft text-vc-ink';
  
  if (themeMode === 'dark') {
    // Polarity-flipped dark band
    bgClass = 'bg-[#171717] text-white border-[#171717] dark:bg-black dark:border-black';
  }

  return (
    <section className={`py-20 md:py-28 border-b border-vc-hairline ${bgClass} ${className}`} {...props}>
      <Container>
        {children}
      </Container>
    </section>
  );
};

// Monochrome customer logo row
export const LogoStrip = ({
  logos = [], // Array of { name, svgSrc or element }
  className = '',
  ...props
}) => {
  return (
    <section className={`bg-vc-canvas border-b border-vc-hairline py-8 ${className}`} {...props}>
      <Container className="flex flex-wrap items-center justify-around gap-6 opacity-40 hover:opacity-75 transition-opacity duration-200">
        {logos.map((logo, idx) => (
          <div key={idx} className="h-6 flex items-center grayscale">
            {logo}
          </div>
        ))}
      </Container>
    </section>
  );
};
