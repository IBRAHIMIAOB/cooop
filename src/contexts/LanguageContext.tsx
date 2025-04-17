import React, { createContext, Dispatch, SetStateAction } from 'react';

interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: Dispatch<SetStateAction<'en' | 'ar'>>;
}

const defaultValue: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

export default LanguageContext;
