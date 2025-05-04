import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../../../public/locales/en/translation.json';
import kmTranslation from '../../../public/locales/km/translation.json';
import zhTranslation from '../../../public/locales/zh/translation.json';

const resources = {
    en: { translation: enTranslation },
    km: { translation: kmTranslation },
    zh: { translation: zhTranslation },
  };

  // Check if this is the first visit
  const isFirstVisit = !localStorage.getItem('hasVisited');
  const savedLanguage = localStorage.getItem('i18nextLng');

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: isFirstVisit ? 'en' : (savedLanguage || 'en'), // Force English on first visit
      fallbackLng: 'en',
      debug: true,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });

  // Mark the user as having visited
  if (isFirstVisit) {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('i18nextLng', 'en'); // Ensure English is saved
  }

  export default i18n;
