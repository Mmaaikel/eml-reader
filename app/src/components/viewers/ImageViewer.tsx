import { downloadBase64 } from '~/lib/download'
import { ViewerNav, ViewerShell } from './ViewerNav'

export function ImageViewer({ filename, contentType, data64, onClose }: {
	filename: string
	contentType?: string
	data64?: string
	onClose: () => void
})
{
	return (
		<ViewerShell>
			<ViewerNav filename={filename} data64={data64} onDownload={() => downloadBase64(data64, filename, contentType)} onClose={onClose} />
			<div className="checkerboard relative flex min-h-64 grow items-center justify-center overflow-auto">
				<img src={`data:${contentType};base64,${data64}`} alt={filename} className="max-h-full max-w-full object-contain" />
			</div>
		</ViewerShell>
	)
}
