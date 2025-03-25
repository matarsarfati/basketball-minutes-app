import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationHE from './locales/he/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      he: { translation: translationHE },
    },
    lng: 'he',
    fallbackLng: 'he',
    interpolation: { escapeValue: false },
  });

export default i18n;