import { create } from 'zustand';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../i18n/translations';
import type { LanguageCode } from '../i18n/translations';

interface I18nState {
  language: LanguageCode;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const getSavedLanguage = (): LanguageCode => {
  try {
    const saved = localStorage.getItem('freshvision_language') as LanguageCode;
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch {}
  return 'en';
};

const initialLang = getSavedLanguage();
const initialDir = SUPPORTED_LANGUAGES.find((l) => l.code === initialLang)?.dir || 'ltr';

export const useI18nStore = create<I18nState>((set, get) => ({
  language: initialLang,
  dir: initialDir,
  setLanguage: (lang: LanguageCode) => {
    if (!TRANSLATIONS[lang]) return;
    const dir = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.dir || 'ltr';
    try {
      localStorage.setItem('freshvision_language', lang);
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
    set({ language: lang, dir });
  },
  t: (key: string, fallback?: string) => {
    const { language } = get();
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || fallback || TRANSLATIONS.en[key] || key;
  },
}));
