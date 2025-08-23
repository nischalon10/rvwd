
import { createContext, useContext, useState, useEffect } from 'react';
import { forms as initialForms } from '../mockData';

const FormsContext = createContext();

export function FormsProvider({ children }) {
  const [forms, setForms] = useState(() => {
    const stored = localStorage.getItem('forms');
    return stored ? JSON.parse(stored) : initialForms;
  });

  useEffect(() => {
    localStorage.setItem('forms', JSON.stringify(forms));
  }, [forms]);

  return (
    <FormsContext.Provider value={{ forms, setForms }}>
      {children}
    </FormsContext.Provider>
  );
}


export function useForms() {
  return useContext(FormsContext);
}
