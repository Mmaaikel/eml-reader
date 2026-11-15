import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { fileURLToPath } from 'node:url'

import { locales, localePath, site, type Locale } from './src/config/site.ts'

// Deployment configuration (see Dockerfile / docker-compose.yml)
const siteUrl = process.env.SITE_URL || ''
const basePath = process.env.BASE_PATH || '/'
const assetsPrefix = process.env.ASSETS_PREFIX || ''
const repositoryUrl = process.env.GITHUB_REPOSITORY_URL || site.defaultRepositoryUrl
const version = (process.env.GITHUB_SHA || '').slice(0, 7) || process.env.VERSION_TAG || 'dev'

const base = basePath.endsWith('/') ? basePath : `${basePath}/`

function escapeAttr(value: string): string
{
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** Write each page's <head>: title, description, icons, social tags and language alternates. */
function siteHead(): Plugin
{
	return {
		name: 'site-head',
		transformIndexHtml(html)
		{
			const lang = (/<html[^>]*\slang="([^"]+)"/.exec(html)?.[1] ?? 'en') as Locale
			const description = site.description[lang] ?? site.description.en
			const absolute = (path: string) => siteUrl ? new URL(base + path, siteUrl).href : ''
			const pageUrl = absolute(localePath(lang))
			const imageUrl = absolute('og-image.png')

			const tags = [
				`<title>${site.title}</title>`,
				`<meta name="title" content="${escapeAttr(site.title)}" />`,
				`<meta name="description" content="${escapeAttr(description)}" />`,
				`<meta name="author" content="${escapeAttr(site.author)}" />`,
				`<meta name="theme-color" content="${site.themeColor}" />`,
				`<meta name="color-scheme" content="dark" />`,
				`<link rel="icon" href="${base}favicon.svg" type="image/svg+xml" />`,
				`<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />`,
				`<meta property="og:title" content="${escapeAttr(site.title)}" />`,
				`<meta property="og:description" content="${escapeAttr(description)}" />`,
				`<meta property="og:type" content="website" />`,
				`<meta property="og:locale" content="${lang === 'fr' ? 'fr_FR' : 'en_US'}" />`,
				`<meta name="twitter:card" content="summary_large_image" />`,
				pageUrl && `<meta property="og:url" content="${pageUrl}" />`,
				pageUrl && `<link rel="canonical" href="${pageUrl}" />`,
				imageUrl && `<meta property="og:image" content="${imageUrl}" />`,
				...locales.map(locale => `<link rel="alternate" hreflang="${locale}" href="${siteUrl ? absolute(localePath(locale)) : base + localePath(locale)}" />`),
			].filter(Boolean)

			return html.replace('<!--site-head-->', tags.join('\n\t\t'))
		},
	}
}

export default defineConfig({
	base,
	resolve: {
		alias: {
			'~': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	define: {
		__APP_VERSION__: JSON.stringify(version),
		__REPOSITORY_URL__: JSON.stringify(repositoryUrl),
	},
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
	plugins: [
		react(),
		tailwindcss(),
		siteHead(),
		nodePolyfills({
			// Node.js globals needed by eml-parse-js
			protocolImports: false,
			globals: {
				Buffer: true,
				global: true,
			},
		}),
	],
	build: {
		rollupOptions: {
			input: {
				en: fileURLToPath(new URL('./index.html', import.meta.url)),
				fr: fileURLToPath(new URL('./fr/index.html', import.meta.url)),
			},
		},
	},
	experimental: assetsPrefix
		? {
			renderBuiltUrl: (filename: string) => `${assetsPrefix.replace(/\/$/, '')}/${filename}`,
		}
		: undefined,
	server: {
		port: 4321,
	},
})
