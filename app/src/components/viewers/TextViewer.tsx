import { useMemo } from 'react'

import { decodeBase64Text } from '~/lib/attachments'
import { downloadBase64 } from '~/lib/download'
import { ViewerNav, ViewerShell } from './ViewerNav'

export function TextViewer({ filename, contentType, data64, onClose }: {
	filename: string
	contentType?: string
	data64?: string
	onClose: () => void
})
{
	const text = useMemo(() =>
	{
		try { return decodeBase64Text(data64) }
		catch { return '' }
	}, [data64])

	return (
		<ViewerShell>
			<ViewerNav filename={filename} data64={data64} onDownload={() => downloadBase64(data64, filename, contentType ?? 'text/plain')} onClose={onClose} />
			<div className="min-h-0 grow overflow-auto bg-book-700 p-4 sm:p-8">
				<pre className="mx-auto max-w-[80ch] whitespace-pre-wrap rounded-[3px] bg-white p-6 font-sans text-[15px] leading-relaxed wrap-anywhere text-book-800 shadow-page sm:p-10">
					{text}
				</pre>
			</div>
		</ViewerShell>
	)
}
