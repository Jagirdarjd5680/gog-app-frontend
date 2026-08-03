import React from 'react';

export const Table = ({
  children,
  className = '',
  stickyHeader = false,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-[8px] border border-vc-hairline vc-shadow-l2 bg-vc-canvas">
      <table className={`w-full border-collapse text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={`bg-vc-canvas-soft border-b border-vc-hairline ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableHeader = TableHead;

export const TableBody = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-vc-hairline ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({
  children,
  className = '',
  hover = true,
  ...props
}) => {
  return (
    <tr 
      className={`transition-colors duration-150 ${hover ? 'hover:bg-vc-canvas-soft-2' : ''} ${className}`} 
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({
  children,
  isHeader = false,
  className = '',
  ...props
}) => {
  if (isHeader) {
    return (
      <th 
        className={`py-3 px-4 text-left font-mono text-[12px] font-medium tracking-wider text-vc-mute uppercase border-b border-vc-hairline ${className}`} 
        {...props}
      >
        {children}
      </th>
    );
  }

  return (
    <td 
      className={`py-3.5 px-4 font-sans text-[14px] text-vc-body border-b border-vc-hairline last:border-b-0 ${className}`} 
      {...props}
    >
      {children}
    </td>
  );
};
