import { useTranslation } from 'react-i18next'

import { getAttachmentExtension } from '~/lib/attachments'
import { downloadFile } from '~/lib/download'
import { formatSize } from '~/lib/fileSize'
import { Button } from '../ui/Button'
import { ViewerNav, ViewerShell, type ViewerProps } from './ViewerNav'

export function DownloadViewer({
	attachment,
	filename,
	contentType,
	onClose,
	onOpen,
}: ViewerProps & {
	/** Set for attached emails: opens them in the reader */
	onOpen?: () => void
}) {
	const { t } = useTranslation()
	const meta = [getAttachmentExtension(attachment), formatSize(attachment.size)].filter(Boolean).join(' · ')

	return (
		<ViewerShell>
			<ViewerNav filename={filename} onClose={onClose} />

			<div className="flex min-h-72 grow flex-col items-center justify-center gap-2 overflow-y-auto bg-book-800 px-6 py-10 text-center text-book-100">
				<span className="mb-2 icon-[mdi--file-download-outline] text-6xl text-olive-light" />
				<p className="max-w-full font-display text-2xl font-semibold wrap-anywhere">{filename}</p>
				<p className="text-sm text-book-300 tabular-nums">{meta}</p>
				<p className="mt-2 max-w-[44ch] text-[15px] text-book-200">
					{onOpen ? t('attachment.isEmail') : t('attachment.noPreview')}
				</p>
				<div className="mt-5 flex flex-wrap justify-center gap-3">
					{onOpen && (
						<Button onClick={onOpen}>
							<span className="icon-[mdi--email-open-outline]" />
							{t('attachment.openEmail')}
						</Button>
					)}
					<Button
						variant={onOpen ? 'secondary' : 'primary'}
						onClick={() => downloadFile(attachment.content, filename, contentType)}
					>
						<span className="icon-[mdi--download]" />
						{t('actions.downloadFile')}
					</Button>
				</div>
			</div>
		</ViewerShell>
	)
}
