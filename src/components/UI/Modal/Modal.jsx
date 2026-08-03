import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'max-w-md', // max-w-sm, max-w-md, max-w-lg, max-w-xl, max-w-2xl
  ...props
}) => {
  // Support Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity duration-200" 
        onClick={onClose}
      />

      {/* Modal Dialog Surface */}
      <div 
        className={`relative w-full ${maxWidth} bg-vc-canvas text-vc-ink rounded-[12px] p-6 border border-vc-hairline vc-shadow-l5 z-10 transform transition-all duration-200 scale-100 flex flex-col ${className}`}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h3 className="font-sans text-[20px] font-semibold leading-[28px] tracking-[-0.6px]">
              {title}
            </h3>
          )}
          <button 
            type="button"
            className="text-vc-mute hover:text-vc-ink hover:bg-vc-canvas-soft-2 p-1.5 rounded-full transition-colors duration-150 cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" stroke={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 text-vc-body font-sans text-[14px] leading-[20px]">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
