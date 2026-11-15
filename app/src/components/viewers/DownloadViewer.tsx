import { t } from '~/i18n'
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
						? t({
							en: 'This attachment is an email itself. Open it here, or download it.',
							fr: 'Cette pièce jointe est elle-même un e-mail. Ouvrez-la ici ou téléchargez-la.',
						})
						: t({
							en: 'This file type can\'t be previewed here. Download it to open it with another app.',
							fr: 'Ce type de fichier ne peut pas être prévisualisé ici. Téléchargez-le pour l\'ouvrir avec une autre application.',
						})}
				</p>
				<div className={styles.fileButtons}>
					{openable && (
						<button className={styles.primary} onClick={onOpen}>
							<span className="icon-[mdi--email-open-outline]" />
							{t({ en: 'Open this email', fr: 'Ouvrir cet e-mail' })}
						</button>
					)}
					<button className={openable ? styles.secondary : styles.primary} onClick={download}>
						<span className="icon-[mdi--download]" />
						{t({ en: 'Download file', fr: 'Télécharger le fichier' })}
					</button>
				</div>
			</div>
		</div>
	)
}
