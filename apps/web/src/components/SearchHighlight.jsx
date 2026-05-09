import React from 'react';

export default function SearchHighlight({ text, searchTerm }) {
  if (!searchTerm || !text) return <>{text}</>;

  const stringText = String(text);
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = stringText.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}