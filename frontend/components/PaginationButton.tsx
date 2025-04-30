import React from 'react';
import Link from 'next/link';

interface PaginationButtonProps {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({ 
  href, 
  isActive = false,
  children 
}) => {
  return (
    <Link
      href={href}
      className={`mx-1 px-4 py-2 rounded-md ${
        isActive 
          ? 'bg-accent text-textLight font-bold' 
          : 'bg-gray-200 text-[#0D253F] hover:bg-accent hover:text-primary transition-colors duration-200 ease-in-out'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

export default PaginationButton;
