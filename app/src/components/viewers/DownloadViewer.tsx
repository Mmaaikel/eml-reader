import { useTranslation } from 'react-i18next'
import { formatBase64Size } from '~/lib/fileSize'
import { downloadBase64 } from '~/lib/download'
import { ViewerNav } from './ViewerNav'
import styles from './Viewer.module.css'

export function DownloadViewer({ filename, contentType, data64, openable, onOpen, onClose }: {
	filename: string
	contentType?: string
	data64?: string
	openable?: boolean
	onOpen?: () => void
	onClose: () => void
})
{
	const { t } = useTranslation()
	const extension = /\.([a-z0-9]{1,5})$/i.exec(filename)?.[1]?.toUpperCase() ?? ''
	const size = formatBase64Size(data64)
	const download = () => downloadBase64(data64, filename, contentType)

	return (
		<div className={styles.viewer}>
			<ViewerNav filename={filename} onClose={onClose} />

			<div className={styles.fileArea}>
				<span className={`${styles.fileIcon} icon-[mdi--file-download-outline]`} />
				<p className={styles.fileName}>{filename}</p>
				<p className={styles.fileMeta}>{[extension, size].filter(Boolean).join(' · ')}</p>
				<p className={styles.fileNote}>
					{openable
						? t('attachment.isEmail')
						: t('attachment.noPreview')}
				</p>
				<div className={styles.fileButtons}>
					{openable && (
						<button className={styles.primary} onClick={onOpen}>
							<span className="icon-[mdi--email-open-outline]" />
							{t('attachment.openEmail')}
						</button>
					)}
					<button className={openable ? styles.secondary : styles.primary} onClick={download}>
						<span className="icon-[mdi--download]" />
						{t('actions.downloadFile')}
					</button>
				</div>
			</div>
		</div>
	)
}
