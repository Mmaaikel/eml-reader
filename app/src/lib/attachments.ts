import type { EmailAttachment } from '~/lib/email'

/** How an attachment opens in the viewer. */
export type PreviewKind = 'pdf' | 'image' | 'text' | 'email' | 'download'

/** Which engraved ink the attachment wears (one per kind, everywhere). */
export type InkKind = 'pdf' | 'image' | 'other'

const TEXT_TYPES = /^(text\/|application\/(json|xml|csv|x-yaml|yaml|javascript|x-sh|x-log)\b)/i
const TEXT_EXTENSIONS = /\.(txt|csv|tsv|log|md|json|xml|ya?ml|ics|vcf|ini|cfg|conf)$/i

const TYPES_BY_EXTENSION: Record<string, string> = {
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

export function getAttachmentExtension(attachment: EmailAttachment): string {
	return /\.([a-z0-9]{1,5})$/i.exec(attachment.filename ?? '')?.[1]?.toUpperCase() ?? ''
}

/** The declared type, or one guessed from the extension when the sender used a generic type. */
export function getAttachmentContentType(attachment: EmailAttachment): string {
	const declared = attachment.contentType.toLowerCase()
	if (declared && declared !== 'application/octet-stream') return declared
	return (
		TYPES_BY_EXTENSION[getAttachmentExtension(attachment).toLowerCase()] ?? (declared || 'application/octet-stream')
	)
}

export function isAttachmentEmpty(attachment: EmailAttachment): boolean {
	return attachment.size <= 0
}

export function getPreviewKind(attachment: EmailAttachment): PreviewKind {
	const type = getAttachmentContentType(attachment)
	const name = attachment.filename ?? ''
	if (type === 'application/pdf') return 'pdf'
	if (/^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(type)) return 'image'
	if (type === 'message/rfc822' || /\.eml$/i.test(name)) return 'email'
	if (TEXT_TYPES.test(type) || TEXT_EXTENSIONS.test(name)) return 'text'
	return 'download'
}

export function getInkKind(attachment: EmailAttachment): InkKind {
	const kind = getPreviewKind(attachment)
	return kind === 'pdf' ? 'pdf' : kind === 'image' ? 'image' : 'other'
}

/** Decode attachment bytes to text as UTF-8. */
export function decodeText(content: Uint8Array): string {
	return new TextDecoder('utf-8').decode(content)
}
