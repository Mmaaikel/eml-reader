import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { cn } from '~/lib/cn'
import { inkClass } from '~/lib/ink'
import type { EmailAttachment } from '~/lib/email'
import { formatSize } from '~/lib/fileSize'
import { openFilePicker } from '~/lib/filePicker'
import { getAttachmentExtension, getInkKind, getPreviewKind, isAttachmentEmpty } from '~/lib/attachments'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'

const railTitle = 'mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-book-300'
const strip =
	'flex flex-col gap-4 border-t border-glassine-edge bg-linear-to-b from-glassine to-glassine-fade px-3.5 py-4'

function typeLabel(t: TFunction, attachment: EmailAttachment): string {
	const kind = getPreviewKind(attachment)
	if (kind === 'pdf') return 'PDF'
	if (kind === 'image') return t('attachment.image')
	if (kind === 'email') return t('attachment.email')
	return getAttachmentExtension(attachment) || t('attachment.file')
}

function actionLabel(t: TFunction, attachment: EmailAttachment): string {
	if (isAttachmentEmpty(attachment)) return t('attachment.empty')
	const kind = getPreviewKind(attachment)
	if (kind === 'email') return t('actions.open')
	return kind === 'download' ? t('actions.download') : t('actions.preview')
}

function Stamp({ attachment, index }: { attachment: EmailAttachment; index: number }) {
	const { t } = useTranslation()

	return (
		<button
			data-stamp
			disabled={isAttachmentEmpty(attachment)}
			onClick={() => openedAttachmentIndex.set(index)}
			className={cn(
				'stamp-perforation group block w-full cursor-pointer text-left drop-shadow-[0_2px_3px_rgb(0_0_0/0.3)]',
				'transition-[transform,filter] duration-180 ease-out-expo hover:-translate-y-0.5 hover:-rotate-[0.6deg] hover:drop-shadow-[0_8px_12px_rgb(0_0_0/0.4)]',
				'focus-visible:outline-offset-4',
				'disabled:cursor-not-allowed disabled:opacity-70 disabled:grayscale disabled:[--ink:var(--color-book-400)] disabled:hover:translate-y-0 disabled:hover:rotate-0',
				inkClass[getInkKind(attachment)],
			)}
		>
			<span className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 bg-white px-3 pt-2.5 pb-3">
				<span className="col-span-2 mb-1.5 h-1.5 bg-(--ink)" />
				<span className="line-clamp-2 text-[15px] leading-snug font-semibold wrap-anywhere text-book-800 group-disabled:line-through group-disabled:decoration-book-400">
					{attachment.filename || t('attachment.untitled')}
				</span>
				<span className="row-span-2 self-start font-display text-[22px] leading-none font-bold whitespace-nowrap text-(--ink) tabular-nums">
					{formatSize(attachment.size)}
				</span>
				<span className="text-[13px] text-book-500">
					{typeLabel(t, attachment)} · {actionLabel(t, attachment)}
				</span>
			</span>
		</button>
	)
}

/** The glassine strip beside the letter where attachments are mounted as stamps. */
export function AttachmentRail({ attachments }: { attachments: EmailAttachment[] }) {
	const { t } = useTranslation()

	return (
		<aside id="attachments" aria-labelledby="attachments-title" className="scroll-mt-6 lg:sticky lg:top-6">
			<h2 id="attachments-title" className={railTitle}>
				{attachments.length > 0
					? t('reader.enclosed', { count: attachments.length })
					: t('reader.noAttachments')}
			</h2>

			{attachments.length > 0 && (
				<>
					<ul className={cn(strip, 'grid sm:grid-cols-2 lg:grid-cols-1')}>
						{attachments.map((attachment, index) => (
							<li
								key={index}
								className="animate-mount"
								style={{ animationDelay: `${260 + index * 70}ms` }}
							>
								<Stamp attachment={attachment} index={index} />
							</li>
						))}
					</ul>

					<p className="mt-4 flex gap-2.5 text-sm leading-relaxed text-book-200">
						<span className="mt-0.5 icon-[mdi--shield-alert-outline] shrink-0 text-lg text-carmine-light" />
						<span>{t('reader.warning')}</span>
					</p>
				</>
			)}

			<button
				type="button"
				onClick={openFilePicker}
				className="mt-6 flex w-full cursor-pointer items-center gap-2 border-[1.5px] border-dashed border-book-600 px-4 py-3.5 text-left text-sm text-book-300 transition-colors duration-150 hover:border-book-400 hover:text-book-100"
			>
				<span className="icon-[mdi--tray-arrow-down] shrink-0 text-lg" />
				{t('drop.another')}
			</button>
		</aside>
	)
}

/** The empty rail shown before any file is open. */
AttachmentRail.Placeholder = function AttachmentRailPlaceholder() {
	const { t } = useTranslation()

	return (
		<aside aria-hidden="true" className="hidden lg:block">
			<p className={railTitle}>{t('empty.railTitle')}</p>
			<div className={strip}>
				<div className="h-[92px] border-[1.5px] border-dashed border-book-600" />
				<div className="h-[92px] border-[1.5px] border-dashed border-book-600" />
			</div>
			<p className="mt-4 text-sm leading-relaxed text-book-300">{t('empty.railNote')}</p>
		</aside>
	)
}
