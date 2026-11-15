import { useMemo } from 'react'

import { decodeBase64Text } from '~/lib/attachments'
import { downloadBase64 } from '~/lib/download'
import { ViewerNav } from './ViewerNav'
import styles from './Viewer.module.css'

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
		<div className={styles.viewer}>
			<ViewerNav
				filename={filename}
				data64={data64}
				onDownload={() => downloadBase64(data64, filename, contentType ?? 'text/plain')}
				onClose={onClose}
			/>
			<div className={styles.textArea}>
				<pre className={styles.sheet}>{text}</pre>
			</div>
		</div>
	)
}
