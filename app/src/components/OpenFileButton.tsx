import { useStore } from '@nanostores/react'

import { t } from '~/i18n'
import { openFilePicker } from '~/lib/filePicker'
import emlData from '~/stores/emlData'
import styles from './OpenFileButton.module.css'

export function OpenFileButton()
{
	const data = useStore(emlData)
	if (!data) return null

	return (
		<button type="button" className={styles.button} onClick={openFilePicker}>
			<span className="icon-[mdi--file-upload-outline]" />
			<span className={styles.long}>{t({ en: 'Open another file', fr: 'Ouvrir un autre fichier' })}</span>
			<span className={styles.short}>{t({ en: 'Open', fr: 'Ouvrir' })}</span>
		</button>
	)
}
