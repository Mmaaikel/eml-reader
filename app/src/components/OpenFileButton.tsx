import { useStore } from '@nanostores/react'

import { useTranslation } from 'react-i18next'
import { openFilePicker } from '~/lib/filePicker'
import emlData from '~/stores/emlData'
import styles from './OpenFileButton.module.css'

export function OpenFileButton()
{
	const { t } = useTranslation()
	const data = useStore(emlData)
	if (!data) return null

	return (
		<button type="button" className={styles.button} onClick={openFilePicker}>
			<span className="icon-[mdi--file-upload-outline]" />
			<span className={styles.long}>{t('actions.openAnother')}</span>
			<span className={styles.short}>{t('actions.open')}</span>
		</button>
	)
}
