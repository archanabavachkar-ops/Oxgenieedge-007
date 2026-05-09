import React from 'react';

export default function PaginationInfo({ currentPage, itemsPerPage, totalItems }) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="text-sm text-[#6B7280] flex items-center gap-4">
      <span>Showing {start}-{end} of {totalItems} results</span>
      <span className="hidden sm:inline">•</span>
      <span className="hidden sm:inline">Page {currentPage} of {totalPages}</span>
    </div>
  );
}