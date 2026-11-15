import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

import { site } from './src/config/site.ts'

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

/** Write the page's <head>: title, description, icons and social tags. */
function siteHead(): Plugin
{
	return {
		name: 'site-head',
		transformIndexHtml(html)
		{
			const pageUrl = siteUrl ? new URL(base, siteUrl).href : ''
			const imageUrl = siteUrl ? new URL(base + 'og-image.png', siteUrl).href : ''

			const tags = [
				`<title>${site.title}</title>`,
				`<meta name="title" content="${escapeAttr(site.title)}" />`,
				`<meta name="description" content="${escapeAttr(site.description)}" />`,
				`<meta name="author" content="${escapeAttr(site.author)}" />`,
				`<meta name="theme-color" content="${site.themeColor}" />`,
				`<meta name="color-scheme" content="dark" />`,
				`<link rel="icon" href="${base}favicon.svg" type="image/svg+xml" />`,
				`<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />`,
				`<meta property="og:title" content="${escapeAttr(site.title)}" />`,
				`<meta property="og:description" content="${escapeAttr(site.description)}" />`,
				`<meta property="og:type" content="website" />`,
				`<meta name="twitter:card" content="summary_large_image" />`,
				pageUrl && `<meta property="og:url" content="${pageUrl}" />`,
				pageUrl && `<link rel="canonical" href="${pageUrl}" />`,
				imageUrl && `<meta property="og:image" content="${imageUrl}" />`,
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
	],
	experimental: assetsPrefix
		? {
			renderBuiltUrl: (filename: string) => `${assetsPrefix.replace(/\/$/, '')}/${filename}`,
		}
		: undefined,
	server: {
		port: 4321,
	},
})
