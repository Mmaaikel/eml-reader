import bytes from 'bytes'

/** One size format for every surface: whole numbers below 1 MB, one decimal above. */
export function formatSize(size: number): string {
	return (
		bytes.format(size, {
			unitSeparator: ' ',
			decimalPlaces: size >= 1024 * 1024 ? 1 : 0,
		}) ?? ''
	)
}
