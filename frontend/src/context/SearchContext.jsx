import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (ctx === null) {
    throw new Error('useSearch must be used inside a <SearchProvider>. Wrap your app with <SearchProvider> in main.jsx');
  }
  return ctx;
}