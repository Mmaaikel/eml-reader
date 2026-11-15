/** Save base64 data as a file through the browser. */
export function downloadBase64(data64: string | undefined, filename: string, contentType = 'application/octet-stream')
{
	if (!data64) return
	const a = document.createElement('a')
	a.href = `data:${contentType};base64,${data64}`
	a.download = filename
	a.click()
	a.remove()
}
