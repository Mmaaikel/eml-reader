import { useStore } from '@nanostores/react'
import { useTranslation } from 'react-i18next'

import { openFilePicker } from '~/lib/filePicker'
import emlData from '~/stores/emlData'
import { Button } from './ui/Button'

export function OpenFileButton() {
	const { t } = useTranslation()
	const data = useStore(emlData)
	if (!data) return null

	return (
		<Button variant="paper" className="px-3.5 py-2 text-[15px]" onClick={openFilePicker}>
			<span className="icon-[mdi--file-upload-outline] text-lg" />
			<span className="hidden sm:inline">{t('actions.openAnother')}</span>
			<span className="sm:hidden">{t('actions.open')}</span>
		</Button>
	)
}
