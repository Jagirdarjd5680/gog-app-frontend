import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

export const Tabs = ({
  children,
  defaultValue,
  value,
  onChange,
  className = '',
  ...props
}) => {
  const [localVal, setLocalVal] = useState(defaultValue);
  const currentVal = value !== undefined ? value : localVal;
  const setVal = onChange !== undefined ? onChange : setLocalVal;

  return (
    <TabsContext.Provider value={{ currentVal, setVal }}>
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabList = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex border-b border-vc-hairline space-x-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Tab = ({
  value,
  children,
  className = '',
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  const { currentVal, setVal } = context;
  const isActive = currentVal === value;

  return (
    <button
      type="button"
      onClick={() => setVal(value)}
      className={`pb-3 font-sans text-[14px] font-medium leading-[20px] transition-all duration-150 border-b-2 select-none cursor-pointer -mb-[2px] ${
        isActive 
          ? 'border-vc-primary text-vc-ink' 
          : 'border-transparent text-vc-body hover:text-vc-ink'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabPanel = ({
  value,
  children,
  className = '',
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  const { currentVal } = context;
  if (currentVal !== value) return null;

  return (
    <div className={`py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
