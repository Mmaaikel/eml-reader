import PostalMime, { type Address } from 'postal-mime'

import { base64ByteLength } from '~/lib/fileSize'

export interface EmailAddress
{
	name: string
	email: string
}

export interface EmailAttachment
{
	filename: string | null
	/** Lowercase MIME type as sent, e.g. "application/pdf" */
	contentType: string
	/** Content-ID with angle brackets, for inline images */
	contentId: string | null
	/** Attachment bytes as base64 */
	data64: string
	/** Decoded size in bytes */
	size: number
}

export interface Email
{
	subject: string
	from: EmailAddress | null
	to: EmailAddress[]
	cc: EmailAddress[]
	date: Date | null
	html: string | null
	text: string | null
	/** Every header in document order, original casing, duplicates included */
	headers: [string, string][]
	attachments: EmailAttachment[]
}

export class InvalidEmailError extends Error
{
	constructor(message = 'Invalid EML file')
	{
		super(message)
		this.name = 'InvalidEmailError'
	}
}

function flatten(addresses: Address[] | Address | undefined): EmailAddress[]
{
	if (!addresses) return []
	const list = Array.isArray(addresses) ? addresses : [addresses]
	return list.flatMap(address => address.group
		? address.group.map(member => ({ name: member.name, email: member.address }))
		: [{ name: address.name, email: address.address ?? '' }])
		.filter(address => address.email || address.name)
}

/** Headers that mark a real message, as opposed to an arbitrary text file */
const MESSAGE_HEADERS = /^(from|to|cc|subject|date|message-id|content-type|mime-version|received|return-path)$/

/** Parse the raw bytes of an .eml file. Throws InvalidEmailError for files that aren't email. */
export async function parseEmail(raw: ArrayBuffer | Uint8Array | string): Promise<Email>
{
	const parsed = await PostalMime.parse(raw, {
		attachmentEncoding: 'base64',
		// Keep forwarded emails as attachments so they can be opened on their own
		forceRfc822Attachments: true,
	})

	if (!parsed.headers.some(header => MESSAGE_HEADERS.test(header.key)))
	{
		throw new InvalidEmailError()
	}

	const date = parsed.date ? new Date(parsed.date) : null

	return {
		subject: parsed.subject ?? '',
		from: flatten(parsed.from)[0] ?? null,
		to: flatten(parsed.to),
		cc: flatten(parsed.cc),
		date: date && !isNaN(date.getTime()) ? date : null,
		html: parsed.html || null,
		text: parsed.text || null,
		headers: parsed.headers.map(header => [header.originalKey || header.key, header.value]),
		attachments: parsed.attachments.map(attachment =>
		{
			const data64 = typeof attachment.content === 'string' ? attachment.content : ''
			return {
				filename: attachment.filename,
				contentType: attachment.mimeType,
				contentId: attachment.contentId ?? null,
				data64,
				size: base64ByteLength(data64),
			}
		}),
	}
}
