/**
 * Turn the raw bytes of an .eml file into text the parser can read.
 *
 * Most files are plain UTF-8 or 7-bit ASCII and pass straight through.
 * Older mail often sends parts as raw 8-bit bytes in a legacy charset
 * (ISO-8859-1, Windows-1252, ...). Decoding the whole file as UTF-8
 * mangles those bytes, and the parser drops such parts entirely.
 * So for those files, each 8-bit part is decoded with its own declared
 * charset, and its header is relabelled as UTF-8 to match.
 */

const UTF8 = /^(utf-?8|us-ascii|ascii)$/i

function bytesOf(binary: string): Uint8Array
{
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i++)
	{
		bytes[i] = binary.charCodeAt(i) & 0xff
	}
	return bytes
}

function binaryOf(bytes: Uint8Array): string
{
	let binary = ''
	for (let i = 0; i < bytes.length; i += 0x8000)
	{
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
	}
	return binary
}

function tryDecode(bytes: Uint8Array, label: string, fatal = true): string | null
{
	try
	{
		return new TextDecoder(label, { fatal }).decode(bytes)
	}
	catch
	{
		return null
	}
}

/** Decode bytes with the declared charset, falling back to UTF-8, then Windows-1252. */
function decodeWithCharset(bytes: Uint8Array, charset: string | null): string
{
	if (charset && !UTF8.test(charset))
	{
		const decoded = tryDecode(bytes, charset, false)
		if (decoded !== null) return decoded
	}
	return tryDecode(bytes, 'utf-8') ?? tryDecode(bytes, 'windows-1252', false) ?? binaryOf(bytes)
}

function escapeRegExp(text: string): string
{
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Decode one MIME segment: a header block, a blank line, then a body. */
function decodeSegment(segment: string): string
{
	const split = /\r?\n\r?\n/.exec(segment)
	const rawHeaders = split ? segment.slice(0, split.index) : segment
	const separator = split ? split[0] : ''
	const rawBody = split ? segment.slice(split.index + separator.length) : ''

	// Header bytes are normally ASCII; raw 8-bit names or subjects are usually UTF-8, else Windows-1252
	let headers = decodeWithCharset(bytesOf(rawHeaders), null)

	if (!/^content-type\s*:/im.test(headers) && !/^[\w-]+\s*:/m.test(headers))
	{
		// Not a header block (preamble or epilogue)
		return decodeWithCharset(bytesOf(segment), null)
	}

	const unfolded = headers.replace(/\r?\n[ \t]+/g, ' ')
	const contentType = /^content-type\s*:\s*([^\r\n]*)/im.exec(unfolded)?.[1] ?? ''
	const charset = /charset\s*=\s*"?([^";\s]+)"?/i.exec(contentType)?.[1] ?? null
	const encoding = (/^content-transfer-encoding\s*:\s*([^\s;]+)/im.exec(unfolded)?.[1] ?? '7bit').toLowerCase()
	const isRawText = ['7bit', '8bit', 'binary'].includes(encoding) && !/^\s*multipart\//i.test(contentType)

	if (!isRawText)
	{
		// base64 / quoted-printable bodies are ASCII, and multipart bodies are split separately
		return headers + separator + rawBody
	}

	const body = decodeWithCharset(bytesOf(rawBody), charset)
	if (charset && !UTF8.test(charset))
	{
		headers = headers.replace(/(charset\s*=\s*"?)([^";\s]+)/i, '$1utf-8')
	}
	return headers + separator + body
}

export function decodeEmlBytes(input: ArrayBuffer | Uint8Array): string
{
	const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)

	// Fast path: valid UTF-8 (which includes plain ASCII) needs no help
	const utf8 = tryDecode(bytes, 'utf-8')
	if (utf8 !== null)
	{
		return utf8
	}

	// Work on a byte-preserving string so ASCII structure can be found
	const binary = binaryOf(bytes)
	const boundaries = Array.from(binary.matchAll(/boundary\s*=\s*"?([^";\r\n]+)"?/gi), m => (m[1] ?? '').trim())
		.filter((value, index, all) => value && all.indexOf(value) === index)

	if (boundaries.length === 0)
	{
		return decodeSegment(binary)
	}

	const delimiter = new RegExp(
		`(\\r?\\n--(?:${boundaries.map(escapeRegExp).join('|')})(?:--)?[ \\t]*(?=\\r?\\n|$))`,
	)

	return binary
		.split(delimiter)
		.map((piece, index) => index % 2 === 1 ? piece : decodeSegment(piece))
		.join('')
}
