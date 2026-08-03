import { createI18n } from 'vue-i18n'
import fr from './locales/fr'
import en from './locales/en'

export const resolvedLocale = navigator.language.toLowerCase().startsWith('en') ? 'en' : 'fr'

export default createI18n({
  legacy: false,   // required for <script setup> / Composition API
  locale: resolvedLocale,
  fallbackLocale: 'fr',
  messages: { fr, en },
})
