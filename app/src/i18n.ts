import { defaultLocale, localePath, locales, type Locale } from '~/config/site'

export type { Locale }

/** The page's locale, set by the HTML entry (<html lang="…">). */
export const locale: Locale = (() =>
{
	const lang = typeof document !== 'undefined' ? document.documentElement.lang : ''
	return (locales as readonly string[]).includes(lang) ? lang as Locale : defaultLocale
})()

export type Translations = { [L in Locale]: string }

/** Pick the current locale's string: t({ en: 'Hello', fr: 'Bonjour' }) */
export function t(translations: Translations): string
{
	return translations[locale] ?? translations[defaultLocale]
}

export function localeUrl(target: Locale): string
{
	return import.meta.env.BASE_URL + localePath(target)
}
