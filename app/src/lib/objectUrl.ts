import { useEffect, useMemo } from 'react'

/** Wrap bytes in a Blob with the right type. */
export function toBlob(content: Uint8Array, type: string): Blob {
	return new Blob([content as BlobPart], { type: type || 'application/octet-stream' })
}

/**
 * A blob: URL for some bytes, released when the component unmounts or the bytes change.
 * Much lighter than a base64 data: URL for large files.
 */
export function useObjectUrl(content: Uint8Array | null | undefined, type: string): string | null {
	const url = useMemo(() => (content ? URL.createObjectURL(toBlob(content, type)) : null), [content, type])
	useEffect(
		() => () => {
			if (url) URL.revokeObjectURL(url)
		},
		[url],
	)
	return url
}
