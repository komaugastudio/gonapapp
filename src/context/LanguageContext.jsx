/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load saved language from localStorage
    return localStorage.getItem('appLanguage') || 'id';
  });

  // Update localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// convenience hook
export const useLanguage = () => useContext(LanguageContext);

export { LanguageContext, LanguageProvider };