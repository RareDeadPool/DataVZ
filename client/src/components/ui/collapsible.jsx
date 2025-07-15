import React, { useState, createContext, useContext } from "react";

const CollapsibleContext = createContext();

export function Collapsible({ open, onOpenChange, children }) {
  const [isOpen, setIsOpen] = useState(open || false);

  const handleOpenChange = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ isOpen, handleOpenChange }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ asChild, children, ...props }) {
  const { handleOpenChange } = useContext(CollapsibleContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        handleOpenChange();
      },
      ...props,
    });
  }
  return (
    <button type="button" onClick={handleOpenChange} {...props}>
      {children}
    </button>
  );
}

export function CollapsibleContent({ children, className = "", ...props }) {
  const { isOpen } = useContext(CollapsibleContext);
  return isOpen ? (
    <div className={className} {...props}>
      {children}
    </div>
  ) : null;
} 