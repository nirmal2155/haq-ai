import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

export type SupportedLocale = 'en' | 'hi' | 'gu';
export type TranslationDict = typeof en;

export const translations: Record<SupportedLocale, TranslationDict> = {
  en,
  hi,
  gu,
};

export function getTranslation(locale: SupportedLocale = 'en'): TranslationDict {
  return translations[locale] || translations.en;
}

export { en, hi, gu };
