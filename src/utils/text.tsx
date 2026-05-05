import React from 'react';

const regexCache = new Map<string, RegExp>();


export const highlightText = (text: string, term: string, highlightClass: string): React.ReactNode => {
  if (!term.trim()) return text;
  
  const lowerTerm = term.toLowerCase();
  let regex = regexCache.get(lowerTerm);
  if (!regex) {
    regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
    regexCache.set(lowerTerm, regex);
  }
  
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === lowerTerm ? <mark key={i} className={highlightClass}>{part}</mark> : part
  );
};
