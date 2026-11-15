import { downloadFile } from '~/lib/download'
import { useObjectUrl } from '~/lib/objectUrl'
import { ViewerNav, ViewerShell, type ViewerProps } from './ViewerNav'

export function ImageViewer({ attachment, filename, contentType, onClose }: ViewerProps) {
	const url = useObjectUrl(attachment.content, contentType)

	return (
		<ViewerShell>
			<ViewerNav
				filename={filename}
				size={attachment.size}
				onDownload={() => downloadFile(attachment.content, filename, contentType)}
				onClose={onClose}
			/>
			<div className="checkerboard relative flex min-h-64 grow items-center justify-center overflow-auto">
				{url && <img src={url} alt={filename} className="max-h-full max-w-full object-contain" />}
			</div>
		</ViewerShell>
	)
}
