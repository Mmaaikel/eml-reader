/** Site identity and per-locale copy. Pure data: used by the app and by the build. */

export const locales = ['en', 'fr'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

export const site = {
	title: 'EML Reader',
	author: 'Maikel',
	authorUrl: 'https://github.com/Mmaaikel',
	originalAuthor: 'Matiboux',
	originalUrl: 'https://github.com/matiboux/eml-reader',
	defaultRepositoryUrl: 'https://github.com/Mmaaikel/eml-reader',
	themeColor: '#16201e',
	description: {
		en: 'Online tool to read and display the content of an EML file.',
		fr: 'Outil en ligne pour lire et afficher le contenu d\'un fichier EML.',
	} satisfies Record<Locale, string>,
}

/** Path of a locale's page, relative to the site base ("" or "fr/"). */
export function localePath(locale: Locale): string
{
	return locale === defaultLocale ? '' : `${locale}/`
}
