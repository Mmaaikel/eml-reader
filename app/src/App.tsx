import { useEffect } from 'react'

import { t, localeUrl, locale } from '~/i18n'
import { AttachmentModal } from '~/components/AttachmentModal'
import { EmptyState } from '~/components/EmptyState'
import { Footer } from '~/components/Footer'
import { LocaleSwitch } from '~/components/LocaleSwitch'
import { OpenFileButton } from '~/components/OpenFileButton'
import { Reader } from '~/components/Reader'
import styles from './App.module.css'

const promise = {
	en: 'Stays on this device. Nothing is uploaded.',
	fr: 'Reste sur cet appareil. Rien n\'est envoyé.',
}

export function App()
{
	useEffect(() =>
	{
		// Lets tests (and anything else) know the app is interactive
		document.documentElement.dataset.ready = 'true'
	}, [])

	return (
		<>
			<AttachmentModal />

			<div className={styles.page}>
				<header className={styles.topbar}>
					<a href={localeUrl(locale)} className={styles.wordmark}>
						<span className={styles.mark} aria-hidden="true">
							<span className="icon-[mdi--email-open-outline]" />
						</span>
						EML <b>Reader</b>
					</a>
					<div className={styles.topbarEnd}>
						<p className={styles.promise}>
							<span className="icon-[mdi--shield-lock-outline]" />
							{t(promise)}
						</p>
						<LocaleSwitch />
						<OpenFileButton />
					</div>
				</header>

				<p className={styles.promiseMobile}>
					<span className="icon-[mdi--shield-lock-outline]" />
					{t(promise)}
				</p>

				<main className={styles.stage}>
					<EmptyState />
					<Reader />
				</main>

				<Footer />
			</div>
		</>
	)
}
