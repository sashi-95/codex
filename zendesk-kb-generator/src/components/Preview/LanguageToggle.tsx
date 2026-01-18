import React from 'react';
import type { Language } from '../../types/article';
import { LANGUAGE_LABELS } from '../../types/article';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

/**
 * 言語切り替えコンポーネント
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const languages: Language[] = ['all', 'en', 'ja', 'pt'];

  return (
    <div className="language-toggle">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`language-toggle-button ${currentLanguage === lang ? 'active' : ''}`}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
};
