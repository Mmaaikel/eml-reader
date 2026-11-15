import { downloadBase64 } from '~/lib/download'
import { ViewerNav } from './ViewerNav'
import styles from './Viewer.module.css'

export function ImageViewer({ filename, contentType, data64, onClose }: {
	filename: string
	contentType?: string
	data64?: string
	onClose: () => void
})
{
	return (
		<div className={styles.viewer}>
			<ViewerNav
				filename={filename}
				data64={data64}
				onDownload={() => downloadBase64(data64, filename, contentType)}
				onClose={onClose}
			/>
			<div className={styles.imageArea}>
				<img src={`data:${contentType};base64,${data64}`} alt={filename} />
			</div>
		</div>
	)
}
