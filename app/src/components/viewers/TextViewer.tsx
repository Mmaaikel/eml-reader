import { useMemo } from 'react'

import { decodeText } from '~/lib/attachments'
import { downloadFile } from '~/lib/download'
import { ViewerNav, ViewerShell, type ViewerProps } from './ViewerNav'

export function TextViewer({ attachment, filename, contentType, onClose }: ViewerProps) {
	const text = useMemo(() => decodeText(attachment.content), [attachment.content])

	return (
		<ViewerShell>
			<ViewerNav
				filename={filename}
				size={attachment.size}
				onDownload={() => downloadFile(attachment.content, filename, contentType || 'text/plain')}
				onClose={onClose}
			/>
			<div className="min-h-0 grow overflow-auto bg-book-700 p-4 sm:p-8">
				<pre className="mx-auto max-w-[80ch] rounded-[3px] bg-white p-6 font-sans text-[15px] leading-relaxed wrap-anywhere whitespace-pre-wrap text-book-800 shadow-page sm:p-10">
					{text}
				</pre>
			</div>
		</ViewerShell>
	)
}
