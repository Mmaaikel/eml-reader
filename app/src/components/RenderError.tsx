import { useTranslation } from 'react-i18next'

import { openFilePicker } from '~/lib/filePicker'
import { Button } from './ui/Button'

/** Shown in place of the reader when an email can't be displayed. */
export function ReaderError({ error }: { error: Error }) {
	const { t } = useTranslation()

	return (
		<section role="alert" className="w-full">
			<div className="relative max-w-[720px] rounded-[3px] bg-white px-6 py-10 text-book-800 shadow-sheet sm:px-11 sm:py-12">
				<span className="icon-[mdi--email-alert-outline] text-5xl text-carmine" />
				<h1 className="mt-3 font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">
					{t('errors.renderTitle')}
				</h1>
				<p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-book-600">{t('errors.renderHelp')}</p>
				<Button className="mt-7" size="lg" onClick={openFilePicker}>
					<span className="icon-[mdi--file-upload-outline] text-xl" />
					{t('actions.openAnother')}
				</Button>
				<p className="mt-6 text-sm break-words text-book-500">{error.message}</p>
			</div>
		</section>
	)
}

/** Shown inside the preview window when an attachment can't be shown. */
export function PreviewError({ error, onClose }: { error: Error; onClose: () => void }) {
	const { t } = useTranslation()

	return (
		<div
			role="alert"
			className="flex min-h-72 flex-col items-center justify-center gap-2 bg-book-800 px-6 py-10 text-center text-book-100"
		>
			<span className="icon-[mdi--file-alert-outline] text-5xl text-carmine-light" />
			<p className="mt-2 font-display text-xl font-semibold">{t('errors.previewTitle')}</p>
			<p className="mt-1 text-sm break-words text-book-300">{error.message}</p>
			<Button className="mt-4" onClick={onClose} data-autofocus>
				{t('actions.close')}
			</Button>
		</div>
	)
}
