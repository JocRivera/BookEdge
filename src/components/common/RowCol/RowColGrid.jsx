import React from 'react';

export const Row = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-12 gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Ejemplo de Col con breakpoints
export const Col = ({ children, span = 12, md, lg, className = '' }) => {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  };

  const mdClasses = md ? `md:${colSpanClasses[md]}` : '';
  const lgClasses = lg ? `lg:${colSpanClasses[lg]}` : '';

  return (
    <div className={`${colSpanClasses[span]} ${mdClasses} ${lgClasses} ${className}`}>
      {children}
    </div>
  );
};

// Uso:
<Col span={12} md={6} lg={4}>
  // En móvil ocupará 12 columnas
  // En tablet ocupará 6 columnas
  // En desktop ocupará 4 columnas
</Col>