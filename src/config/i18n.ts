import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from '../../assets/i18n/pt.json';
import en from '../../assets/i18n/en.json';
import de from '../../assets/i18n/de.json';
import fr from '../../assets/i18n/fr.json';

const LANGUAGE_KEY = 'mobile-lang';

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
  },
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Restore saved language
AsyncStorage.getItem(LANGUAGE_KEY).then(lang => {
  if (lang) i18n.changeLanguage(lang);
});

export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;
