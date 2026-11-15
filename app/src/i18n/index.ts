import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en'

export const defaultNS = 'translation'
export const resources = { en: { translation: en } } as const

void i18n
	.use(initReactI18next)
	.init({
		lng: 'en',
		fallbackLng: 'en',
		defaultNS,
		resources,
		// React already escapes rendered values
		interpolation: { escapeValue: false },
		initAsync: false,
	})

export default i18n
