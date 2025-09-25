import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { GlobeIcon } from '../constants';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLocalization();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label="Toggle language"
    >
      <GlobeIcon className="h-5 w-5" />
      <span className="font-semibold">{language === 'en' ? 'EN' : 'TH'}</span>
    </button>
  );
};

export default LanguageSwitcher;
