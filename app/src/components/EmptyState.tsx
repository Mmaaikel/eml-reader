import { useStore } from '@nanostores/react'

import { t } from '~/i18n'
import { openFilePicker } from '~/lib/filePicker'
import emlData from '~/stores/emlData'
import emlError from '~/stores/emlError'
import emlLoading from '~/stores/emlLoading'
import { FileDrop } from '~/components/FileDrop'
import styles from './EmptyState.module.css'

export function EmptyState()
{
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
								<small>{t({ en: 'Opened locally', fr: 'Ouvert en local' })}</small>
								<strong>{t({ en: 'No upload', fr: 'Aucun envoi' })}</strong>
								<small>{t({ en: 'This device', fr: 'Cet appareil' })}</small>
							</div>

							<h1>{t({ en: 'Read an email file', fr: 'Lire un fichier e-mail' })}</h1>
							<p className={styles.lede}>
								{t({
									en: 'Drop an .eml file anywhere on this page, or choose one from your device. It opens right here in your browser and is never uploaded.',
									fr: 'Déposez un fichier .eml n\'importe où sur cette page, ou choisissez-en un sur votre appareil. Il s\'ouvre ici, dans votre navigateur, et n\'est jamais envoyé.',
								})}
							</p>

							<div className={styles.actions}>
								<button type="button" className={styles.primary} aria-busy={loading} onClick={openFilePicker}>
									<span className="icon-[mdi--file-upload-outline]" />
									{loading
										? t({ en: 'Opening…', fr: 'Ouverture…' })
										: t({ en: 'Choose a file', fr: 'Choisir un fichier' })}
								</button>
								<span className={styles.hint}>
									{t({
										en: '.eml files are what mail programs save when you export or download a message.',
										fr: 'Les fichiers .eml sont ceux que les logiciels de messagerie créent quand vous exportez ou téléchargez un message.',
									})}
								</span>
							</div>

							{error && (
								<div className={styles.error} role="alert">
									<span className="icon-[mdi--alert-circle-outline]" />
									<div>
										<p className={styles.errorTitle}>
											{t({
												en: 'This file couldn\'t be read as an email.',
												fr: 'Ce fichier n\'a pas pu être lu comme un e-mail.',
											})}
										</p>
										<p>
											{t({
												en: 'Make sure it is an .eml file saved from a mail program, then try again.',
												fr: 'Vérifiez qu\'il s\'agit d\'un fichier .eml enregistré depuis une messagerie, puis réessayez.',
											})}
										</p>
										<p className={styles.errorDetail}>{error}</p>
									</div>
								</div>
							)}
						</div>
					</div>

					<aside className={styles.rail} aria-hidden="true">
						<p className={styles.railTitle}>{t({ en: 'Attachments', fr: 'Pièces jointes' })}</p>
						<div className={styles.strip}>
							<div className={styles.stampGhost} />
							<div className={styles.stampGhost} />
						</div>
						<p className={styles.railNote}>
							{t({
								en: 'Attachments are mounted here, with their size and type.',
								fr: 'Les pièces jointes apparaissent ici, avec leur taille et leur type.',
							})}
						</p>
					</aside>
				</section>
			)}
		</>
	)
}
