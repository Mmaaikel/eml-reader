import { GITHUB_REPOSITORY_URL, GITHUB_SHA, VERSION_TAG } from 'astro:env/client'

import type { Props as BaseProps } from '~/layouts/Base.astro'

export interface Site
{
	lang?: BaseProps['lang']
	title?: BaseProps['title']
	description?: BaseProps['description']
	version?: BaseProps['version']
	author?: BaseProps['author']
	keywords?: BaseProps['keywords']
	generator?: BaseProps['generator']
	themeColor?: BaseProps['themeColor']
	viewportScale?: BaseProps['viewportScale']
	favicon?: BaseProps['favicon']
	appleTouchIcon?: BaseProps['appleTouchIcon']
	socialTitle?: BaseProps['socialTitle']
	socialDescription?: BaseProps['socialDescription']
	socialImage?: BaseProps['socialImage']
	socialUrl?: BaseProps['socialUrl']
	socialType?: BaseProps['socialType']
	socialTwitterCard?: BaseProps['socialTwitterCard']
}

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')

export const site: Site = {
	lang: 'en',
	title: 'EML Reader',
	description: {
		'en': 'Online tool to read and display the content of an EML file.',
		'fr': 'Outil en ligne pour lire et afficher le contenu d\'un fichier EML.',
	},
	version: GITHUB_SHA || VERSION_TAG || 'dev',
	author: 'Maikel',
	themeColor: '#16201e',
	viewportScale: 1,
	favicon: `${base}favicon.svg`,
	appleTouchIcon: `${base}apple-touch-icon.png`,
	socialImage: `${base}og-image.png`,
	socialType: 'website',
	socialTwitterCard: 'summary_large_image',
	socialTitle: true,
	socialDescription: true,
}

export const githubRepositoryUrl: string = (
	GITHUB_REPOSITORY_URL
	|| 'https://github.com/Mmaaikel/eml-reader'
)
