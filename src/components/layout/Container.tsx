import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'none';
  padding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  none: 'max-w-none',
};

/**
 * Container — centered layout wrapper with max-width.
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = '2xl',
  padding = true,
}) => {
  return (
    <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]} ${padding ? 'px-6 sm:px-8' : ''} ${className}`}>
      {children}
    </div>
  );
};
