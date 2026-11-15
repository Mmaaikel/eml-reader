import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { useTranslation } from 'react-i18next'

import { AttachmentModal } from '~/components/AttachmentModal'
import { EmptyState } from '~/components/EmptyState'
import { ErrorBoundary } from '~/components/ErrorBoundary'
import { Footer } from '~/components/Footer'
import { OpenFileButton } from '~/components/OpenFileButton'
import { Reader } from '~/components/reader/Reader'
import { ReaderError } from '~/components/RenderError'
import emlData from '~/stores/emlData'

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

			<div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 sm:px-8 lg:px-10">
				<header className="flex h-16 items-center justify-between gap-4 border-b border-book-700">
					<a
						href={import.meta.env.BASE_URL}
						className="flex items-center gap-2.5 font-display text-[22px] font-bold tracking-[0.01em] text-book-100 no-underline"
					>
						<span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[3px] bg-white text-lg text-ultramarine">
							<span className="icon-[mdi--email-open-outline]" />
						</span>
						EML <b className="text-carmine-bright">Reader</b>
					</a>
					<div className="flex items-center gap-3 sm:gap-5">
						<p className="hidden items-center gap-1.5 text-[15px] text-book-200 md:flex">
							<span className="icon-[mdi--shield-lock-outline] text-lg text-olive-light" />
							{t('app.promise')}
						</p>
						<OpenFileButton />
					</div>
				</header>

				<p className="flex items-center gap-1.5 border-b border-book-700 py-2.5 text-sm text-book-200 md:hidden">
					<span className="icon-[mdi--shield-lock-outline] text-base text-olive-light" />
					{t('app.promise')}
				</p>

				<main className="flex flex-1 flex-col overflow-x-clip py-8 [overflow-clip-margin:1rem] sm:py-10">
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
