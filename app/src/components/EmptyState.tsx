import { useStore } from '@nanostores/react'

import { useTranslation } from 'react-i18next'
import { openFilePicker } from '~/lib/filePicker'
import emlData from '~/stores/emlData'
import emlError from '~/stores/emlError'
import emlLoading from '~/stores/emlLoading'
import { FileDrop } from '~/components/FileDrop'
import styles from './EmptyState.module.css'

export function EmptyState()
{
	const { t } = useTranslation()
	const data = useStore(emlData)
	const error = useStore(emlError)
	const loading = useStore(emlLoading)

	return (
		<>
			<FileDrop />

			{!data && (
				<section className={styles.empty}>
					<div className={styles.stack}>
						<div className={`${styles.sheet} ${styles.sheetBack}`} />
						<div className={`${styles.sheet} ${styles.letter}`}>
							<div className={styles.postmark} aria-hidden="true">
								<small>{t('postmark.openedLocally')}</small>
								<strong>{t('postmark.noUpload')}</strong>
								<small>{t('postmark.thisDevice')}</small>
							</div>

							<h1>{t('empty.title')}</h1>
							<p className={styles.lede}>
								{t('empty.lede')}
							</p>

							<div className={styles.actions}>
								<button type="button" className={styles.primary} aria-busy={loading} onClick={openFilePicker}>
									<span className="icon-[mdi--file-upload-outline]" />
									{loading
										? t('actions.opening')
										: t('actions.chooseFile')}
								</button>
								<span className={styles.hint}>
									{t('empty.hint')}
								</span>
							</div>

							{error && (
								<div className={styles.error} role="alert">
									<span className="icon-[mdi--alert-circle-outline]" />
									<div>
										<p className={styles.errorTitle}>
											{t('errors.parseTitle')}
										</p>
										<p>
											{t('errors.parseHelp')}
										</p>
										<p className={styles.errorDetail}>{error}</p>
									</div>
								</div>
							)}
						</div>
					</div>

					<aside className={styles.rail} aria-hidden="true">
						<p className={styles.railTitle}>{t('empty.railTitle')}</p>
						<div className={styles.strip}>
							<div className={styles.stampGhost} />
							<div className={styles.stampGhost} />
						</div>
						<p className={styles.railNote}>
							{t('empty.railNote')}
						</p>
					</aside>
				</section>
			)}
		</>
	)
}
