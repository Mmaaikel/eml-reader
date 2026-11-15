import barlow400 from '@fontsource/barlow/files/barlow-latin-400-normal.woff2?url'
import barlow600 from '@fontsource/barlow/files/barlow-latin-600-normal.woff2?url'

import type { Email } from '~/lib/email'

/** Detects images, stylesheets or links that would reach the network. */
export const REMOTE_PATTERN = /(?:src|background|href)\s*=\s*["']?\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i

export function hasRemoteContent(email: Email): boolean
{
	return Boolean(email.html) && REMOTE_PATTERN.test(email.html ?? '')
}

function escapeHtml(text: string): string
{
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

/** Head for the message frame: blocks network content unless allowed, sets fonts and margins. */
function frameHead(remote: boolean): string
{
	const origin = location.origin
	const net = remote ? ' http: https:' : ''
	const csp = `default-src 'none'; style-src 'unsafe-inline'${net}; img-src data:${net}; font-src data: ${origin}${net}; media-src data:${net}`
	return `<meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank"><style>
		@font-face{font-family:Barlow;font-weight:400;font-display:swap;src:url(${new URL(barlow400, origin).href}) format('woff2')}
		@font-face{font-family:Barlow;font-weight:600;font-display:swap;src:url(${new URL(barlow600, origin).href}) format('woff2')}
		body{margin:0}
		${remote ? '' : 'img[src^="http:"],img[src^="https:"],img[src^="//"]{display:none!important}'}
	</style>`
}

/** The email's plain text, escaped and set in the reader's type. */
export function plainTextDocument(email: Email): string
{
	const style = `<style>
		body{padding:4px 0 24px;font:17px/1.6 Barlow,ui-sans-serif,system-ui,sans-serif;color:#212c29}
		pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:inherit;max-width:72ch}
	</style>`
	return `<!doctype html><html><head><meta charset="utf-8">${frameHead(false)}${style}</head><body><pre>${escapeHtml(email.text ?? '')}</pre></body></html>`
}

/** The email's HTML with network content blocked (unless allowed) and inline cid: images resolved. */
export function htmlDocument(email: Email, remote: boolean): string
{
	if (!email.html)
	{
		return plainTextDocument(email)
	}

	let html = email.html

	if (/<head[^>]*>/i.test(html))
	{
		html = html.replace(/<head([^>]*)>/i, `<head$1>${frameHead(remote)}`)
	}
	else
	{
		html = `<!doctype html><html><head><meta charset="utf-8">${frameHead(remote)}</head><body>${html}</body></html>`
	}

	const cidRegex = /\ssrc=(["'])cid:([^"']+)\1/g
	let match: RegExpExecArray | null
	while ((match = cidRegex.exec(html)))
	{
		const cid = match[2]
		const attachment = email.attachments.find(attachment => attachment.contentId === `<${cid}>` || attachment.contentId === cid)
		if (attachment)
		{
			html = html.split(match[0]).join(` src="data:${attachment.contentType || 'image/png'};base64,${attachment.data64}"`)
		}
	}

	return html
}
