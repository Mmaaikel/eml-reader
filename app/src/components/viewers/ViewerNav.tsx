import type { ReactNode } from 'react'

import { t } from '~/i18n'
import { formatBase64Size } from '~/lib/fileSize'
import styles from './Viewer.module.css'

/** Toolbar shared by every viewer: file name, optional controls, size, download, close. */
export function ViewerNav({ filename, data64, onDownload, onClose, children }: {
	filename: string
	data64?: string
	onDownload?: () => void
	onClose: () => void
	children?: ReactNode
})
{
	return (
		<div className={styles.nav}>
			<p className={styles.title}>{filename}</p>
			{children}
			<div className={styles.group}>
				{onDownload && (
					<>
						<span className={styles.size}>{formatBase64Size(data64)}</span>
						<button className={styles.button} onClick={onDownload}>
							<span className="icon-[mdi--download]" />
							<span className="sr-only">{t({ en: 'Download', fr: 'Télécharger' })}</span>
						</button>
					</>
				)}
				<button className={styles.button} onClick={onClose} data-autofocus>
					<span className="icon-[mdi--close]" />
					<span className="sr-only">{t({ en: 'Close', fr: 'Fermer' })}</span>
				</button>
			</div>
		</div>
	)
}
