import { useTranslation } from 'react-i18next'

import { formatBase64Size } from '~/lib/fileSize'
import { downloadBase64 } from '~/lib/download'
import { Button } from '../ui/Button'
import { ViewerNav, ViewerShell } from './ViewerNav'

export function DownloadViewer({ filename, contentType, data64, openable, onOpen, onClose }: {
	filename: string
	contentType?: string
	data64?: string
	openable?: boolean
	onOpen?: () => void
	onClose: () => void
})
{
	const { t } = useTranslation()
	const extension = /\.([a-z0-9]{1,5})$/i.exec(filename)?.[1]?.toUpperCase() ?? ''
	const size = formatBase64Size(data64)
	const download = () => downloadBase64(data64, filename, contentType)

	return (
		<ViewerShell>
			<ViewerNav filename={filename} onClose={onClose} />

			<div className="flex min-h-72 grow flex-col items-center justify-center gap-2 overflow-y-auto bg-book-800 px-6 py-10 text-center text-book-100">
				<span className="icon-[mdi--file-download-outline] mb-2 text-6xl text-olive-light" />
				<p className="max-w-full font-display text-2xl font-semibold wrap-anywhere">{filename}</p>
				<p className="text-sm tabular-nums text-book-300">{[extension, size].filter(Boolean).join(' · ')}</p>
				<p className="mt-2 max-w-[44ch] text-[15px] text-book-200">
					{openable ? t('attachment.isEmail') : t('attachment.noPreview')}
				</p>
				<div className="mt-5 flex flex-wrap justify-center gap-3">
					{openable && (
						<Button onClick={onOpen}>
							<span className="icon-[mdi--email-open-outline]" />
							{t('attachment.openEmail')}
						</Button>
					)}
					<Button variant={openable ? 'secondary' : 'primary'} onClick={download}>
						<span className="icon-[mdi--download]" />
						{t('actions.downloadFile')}
					</Button>
				</div>
			</div>
		</ViewerShell>
	)
}
