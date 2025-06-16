
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const accordionId = `accordion-content-${title.replace(/\s+/g, '-')}`;

  return (
    <div className="border-b border-border">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full py-4 px-2 text-left font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={accordionId}
        >
          <span>{title}</span>
          {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
      </h2>
      {isOpen && (
        <div
          id={accordionId}
          className="p-4 pt-0 text-muted-foreground"
          role="region"
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
  children: React.ReactElement<AccordionItemProps> | React.ReactElement<AccordionItemProps>[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ children, className = '' }) => {
  return <div className={`border border-border rounded-md shadow-sm ${className}`}>{children}</div>;
};

export default Accordion;
