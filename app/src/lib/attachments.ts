import { unquoteString } from 'eml-parse-js'

import { base64ByteLength } from '~/lib/fileSize'

/** How an attachment opens in the viewer. */
export type PreviewKind = 'pdf' | 'image' | 'text' | 'email' | 'download'

/** Which engraved ink the attachment wears (one per kind, everywhere). */
export type InkKind = 'pdf' | 'image' | 'other'

const TEXT_TYPES = /^(text\/|application\/(json|xml|csv|x-yaml|yaml|javascript|x-sh|x-log)\b)/i
const TEXT_EXTENSIONS = /\.(txt|csv|tsv|log|md|json|xml|ya?ml|ics|vcf|ini|cfg|conf)$/i

export function getAttachmentFileName(attachment: any): string | null
{
	if (attachment?.contentType)
	{
		const match = /(?:N|n)ame=(?:'|")?(.+?)(?:'|")?(\s*;[\s\S]*)?$/g.exec(attachment.contentType)
		if (match && match[1])
		{
			return unquoteString(match[1])
		}
	}

	if (attachment?.name)
	{
		const match = /([^/\\]+)$/.exec(attachment.name)
		if (match && match[1])
		{
			return unquoteString(match[1])
		}
	}

	return attachment?.name ? unquoteString(attachment.name) : null
}

export function getAttachmentContentType(attachment: any): string | null
{
	if (attachment?.contentType)
	{
		const match = /^([^;]+)/.exec(attachment.contentType)
		if (match && match[1] && !match[1].includes('=?'))
		{
			return match[1].trim().toLowerCase()
		}
	}

	const name = getAttachmentFileName(attachment) ?? ''
	const extension = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase()
	const byExtension: Record<string, string> = {
		pdf: 'application/pdf',
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml',
		eml: 'message/rfc822',
		txt: 'text/plain',
	}
	return (extension && byExtension[extension]) || null
}

export function getAttachmentExtension(attachment: any): string
{
	return /\.([a-z0-9]{1,5})$/i.exec(getAttachmentFileName(attachment) ?? '')?.[1]?.toUpperCase() ?? ''
}

export function getAttachmentSize(attachment: any): number
{
	return attachment?.data64 ? base64ByteLength(attachment.data64) : (attachment?.data?.length ?? 0)
}

export function isAttachmentEmpty(attachment: any): boolean
{
	return getAttachmentSize(attachment) <= 0
}

export function getPreviewKind(attachment: any): PreviewKind
{
	const type = getAttachmentContentType(attachment) ?? ''
	const name = getAttachmentFileName(attachment) ?? ''
	if (type === 'application/pdf') return 'pdf'
	if (/^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(type)) return 'image'
	if (type === 'message/rfc822' || /\.eml$/i.test(name)) return 'email'
	if (TEXT_TYPES.test(type) || TEXT_EXTENSIONS.test(name)) return 'text'
	return 'download'
}

export function getInkKind(attachment: any): InkKind
{
	const kind = getPreviewKind(attachment)
	return kind === 'pdf' ? 'pdf' : kind === 'image' ? 'image' : 'other'
}

/** Decode base64 attachment data to text as UTF-8. */
export function decodeBase64Text(data64: string | undefined | null): string
{
	if (!data64) return ''
	const binary = atob(data64.replace(/\s/g, ''))
	const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
	return new TextDecoder('utf-8').decode(bytes)
}
