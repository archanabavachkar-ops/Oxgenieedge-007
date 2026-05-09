import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items }) {
  const location = useLocation();
  
  // Auto-generate items from path if not provided
  const breadcrumbItems = items || (() => {
    const paths = location.pathname.split('/').filter(p => p);
    return [
      { label: 'Home', path: '/' },
      ...paths.map((path, index) => ({
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        path: '/' + paths.slice(0, index + 1).join('/')
      }))
    ];
  })();

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm">
      <ol className="flex items-center space-x-2 bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-800 shadow-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.path || index} className="flex items-center">
              {index === 0 ? (
                <Home className="w-4 h-4 mr-2 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />
              )}
              
              {isLast ? (
                <span className="text-white font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-gray-400 hover:text-[#F97316] transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}