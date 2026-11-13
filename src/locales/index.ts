import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json';
import fa from './fa/translation.json';
import ps from './ps/translation.json';

export const languageDirections: Record<string, 'rtl' | 'ltr'> = { fa: 'rtl', ps: 'rtl', en: 'ltr' };

void i18n.use(initReactI18next).init({
  resources: { fa: { translation: fa }, ps: { translation: ps }, en: { translation: en } },
  lng: 'fa', fallbackLng: 'fa', supportedLngs: ['fa', 'ps', 'en'], interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (language) => {
  const baseLanguage = language.split('-')[0];
  document.documentElement.lang = baseLanguage;
  document.documentElement.dir = languageDirections[baseLanguage] ?? 'rtl';
});

document.documentElement.lang = 'fa';
document.documentElement.dir = 'rtl';

export default i18n;
