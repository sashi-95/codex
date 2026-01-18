import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * PRADAスタイル アコーディオンコンポーネント
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className="prada-accordion mb-2">
      <div
        className="prada-accordion-header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span className="prada-accordion-title">{title}</span>
        <span className="prada-accordion-icon">
          {isOpen ? '−' : '+'}
        </span>
      </div>
      {isOpen && (
        <div className="prada-accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};
