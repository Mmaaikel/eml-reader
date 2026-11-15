import bytes from 'bytes'

/** Decoded byte length of a base64 string, ignoring whitespace and padding. */
export function base64ByteLength(data64: string | undefined | null): number
{
	if (!data64) return 0
	const clean = data64.replace(/\s/g, '')
	const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
	return Math.max(0, Math.floor(clean.length * 3 / 4) - padding)
}

/** One size format for every surface: whole numbers below 1 MB, one decimal above. */
export function formatSize(size: number): string
{
	return bytes.format(size, {
		unitSeparator: ' ',
		decimalPlaces: size >= 1024 * 1024 ? 1 : 0,
	}) ?? ''
}

export function formatBase64Size(data64: string | undefined | null): string
{
	return data64 ? formatSize(base64ByteLength(data64)) : ''
}
