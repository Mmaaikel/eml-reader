import { toBlob } from '~/lib/objectUrl'

/** Save bytes as a file through the browser. */
export function downloadFile(content: Uint8Array, filename: string, contentType = 'application/octet-stream') {
	const url = URL.createObjectURL(toBlob(content, contentType))
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.append(a)
	a.click()
	a.remove()
	// Give the browser a moment to start the download before releasing the bytes
	setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
