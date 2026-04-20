import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем твои файлы с переводами
import ru from './ru.js';
import en from './en.js';
import ky from './ky.js';

const savedLanguage = localStorage.getItem('app-language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      ky: { translation: ky }
    },
    lng: savedLanguage, // Язык берется из сохраненного
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;