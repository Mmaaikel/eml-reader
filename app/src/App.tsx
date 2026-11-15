import { useEffect } from 'react'
import { useStore } from '@nanostores/react'

import { useTranslation } from 'react-i18next'
import { AttachmentModal } from '~/components/AttachmentModal'
import { ErrorBoundary } from '~/components/ErrorBoundary'
import { ReaderError } from '~/components/RenderError'
import { EmptyState } from '~/components/EmptyState'
import { Footer } from '~/components/Footer'
import { OpenFileButton } from '~/components/OpenFileButton'
import { Reader } from '~/components/Reader'
import emlData from '~/stores/emlData'
import styles from './App.module.css'

export function App()
{
	const { t } = useTranslation()
	const data = useStore(emlData)

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
					<a href={import.meta.env.BASE_URL} className={styles.wordmark}>
						<span className={styles.mark} aria-hidden="true">
							<span className="icon-[mdi--email-open-outline]" />
						</span>
						EML <b>Reader</b>
					</a>
					<div className={styles.topbarEnd}>
						<p className={styles.promise}>
							<span className="icon-[mdi--shield-lock-outline]" />
							{t('app.promise')}
						</p>
						<OpenFileButton />
					</div>
				</header>

				<p className={styles.promiseMobile}>
					<span className="icon-[mdi--shield-lock-outline]" />
					{t('app.promise')}
				</p>

				<main className={styles.stage}>
					<EmptyState />
					<ErrorBoundary resetKey={data} fallback={error => <ReaderError error={error} />}>
						<Reader />
					</ErrorBoundary>
				</main>

				<Footer />
			</div>
		</>
	)
}
