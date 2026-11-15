import { useTranslation } from 'react-i18next'
import { openFilePicker } from '~/lib/filePicker'
import styles from './RenderError.module.css'

/** Shown in place of the reader when an email can't be displayed. */
export function ReaderError({ error }: { error: Error })
{
	const { t } = useTranslation()
	return (
		<section className={styles.panel} role="alert">
			<div className={styles.sheet}>
				<span className={`${styles.icon} icon-[mdi--email-alert-outline]`} />
				<h1>{t('errors.renderTitle')}</h1>
				<p>
					{t('errors.renderHelp')}
				</p>
				<button type="button" className={styles.button} onClick={openFilePicker}>
					<span className="icon-[mdi--file-upload-outline]" />
					{t('actions.openAnother')}
				</button>
				<p className={styles.detail}>{error.message}</p>
			</div>
		</section>
	)
}

/** Shown inside the preview window when an attachment can't be shown. */
export function PreviewError({ error, onClose }: { error: Error, onClose: () => void })
{
	const { t } = useTranslation()
	return (
		<div className={styles.preview} role="alert">
			<span className={`${styles.icon} icon-[mdi--file-alert-outline]`} />
			<p className={styles.previewTitle}>
				{t('errors.previewTitle')}
			</p>
			<p className={styles.detail}>{error.message}</p>
			<button type="button" className={styles.button} onClick={onClose} data-autofocus>
				{t('actions.close')}
			</button>
		</div>
	)
}
