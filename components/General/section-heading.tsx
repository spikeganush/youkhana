import React from 'react';

type SectionHeadingProps = {
  children: React.ReactNode;
};

const SectionHeading = ({ children }: SectionHeadingProps) => {
  return (
    <h2 className="text-gray-700 text-3xl font-medium capitalize my-8 text-center">
      {children}
    </h2>
  );
};

export default SectionHeading;
