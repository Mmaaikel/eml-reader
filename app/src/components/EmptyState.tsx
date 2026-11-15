import { useStore } from '@nanostores/react'
import { useTranslation } from 'react-i18next'

import { openFilePicker } from '~/lib/filePicker'
import emlData from '~/stores/emlData'
import emlError from '~/stores/emlError'
import emlLoading from '~/stores/emlLoading'
import { FileDrop } from './FileDrop'
import { AttachmentRail } from './reader/AttachmentRail'
import { Button } from './ui/Button'
import { PaperStack } from './ui/PaperStack'
import { Postmark } from './ui/Postmark'

export function EmptyState() {
	const { t } = useTranslation()
	const data = useStore(emlData)
	const error = useStore(emlError)
	const loading = useStore(emlLoading)

	return (
		<>
			<FileDrop />

			{!data && (
				<section className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
					<PaperStack className="min-h-[min(440px,60vh)] px-6 py-8 sm:px-11 sm:py-12">
						<Postmark
							top={t('postmark.openedLocally')}
							main={t('postmark.noUpload')}
							bottom={t('postmark.thisDevice')}
						/>

						<h1 className="max-w-[16ch] font-display text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl">
							{t('empty.title')}
						</h1>
						<p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-book-600">{t('empty.lede')}</p>

						<div className="mt-9 flex flex-col items-start gap-3">
							<Button size="lg" aria-busy={loading} onClick={openFilePicker}>
								<span className="icon-[mdi--file-upload-outline] text-xl" />
								{loading ? t('actions.opening') : t('actions.chooseFile')}
							</Button>
							<span className="max-w-[52ch] text-sm text-book-500">{t('empty.hint')}</span>
						</div>

						{error && (
							<div role="alert" className="mt-8 flex gap-3 rounded bg-carmine-wash p-4 text-carmine">
								<span className="mt-0.5 icon-[mdi--alert-circle-outline] shrink-0 text-xl" />
								<div>
									<p className="font-semibold">{t('errors.parseTitle')}</p>
									<p className="text-book-700">{t('errors.parseHelp')}</p>
									<p className="mt-1 text-sm text-book-500">{error}</p>
								</div>
							</div>
						)}
					</PaperStack>

					<AttachmentRail.Placeholder />
				</section>
			)}
		</>
	)
}
