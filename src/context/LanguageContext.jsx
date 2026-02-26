/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('id');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// convenience hook
export const useLanguage = () => useContext(LanguageContext);

export { LanguageContext, LanguageProvider };