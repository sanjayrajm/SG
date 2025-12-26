
import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ current, onChange }) => {
  return (
    <div className="flex bg-gray-200 p-1 rounded-lg">
      <button
        onClick={() => onChange(Language.ENGLISH)}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
          current === Language.ENGLISH ? 'bg-white shadow-sm' : 'text-gray-500'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onChange(Language.TAMIL)}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
          current === Language.TAMIL ? 'bg-white shadow-sm font-latha' : 'text-gray-500 font-latha'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
};
