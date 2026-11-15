import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/lib/cn'
import { formatBase64Size } from '~/lib/fileSize'

/** Square icon button in the viewer toolbar. Pass the label for screen readers. */
export function ViewerButton({ icon, label, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
	icon: ReactNode
	label: string
})
{
	return (
		<button
			type="button"
			className={cn(
				'flex h-12 min-w-11 cursor-pointer items-center justify-center text-xl transition-colors duration-150',
				'enabled:hover:bg-book-700 enabled:active:bg-book-600 aria-pressed:bg-book-600',
				'disabled:cursor-not-allowed disabled:opacity-40 focus-visible:-outline-offset-2',
				className,
			)}
			{...props}
		>
			{icon}
			<span className="sr-only">{label}</span>
		</button>
	)
}

/** Readout between toolbar buttons (page number, zoom level). */
export function ViewerReadout({ label, children }: { label: string, children: ReactNode })
{
	return (
		<span className="min-w-12 px-1 text-center text-sm tabular-nums text-book-200">
			<span className="sr-only">{label} </span>
			{children}
		</span>
	)
}

/** Toolbar shared by every viewer: file name, optional controls, size, download, close. */
export function ViewerNav({ filename, data64, onDownload, onClose, children }: {
	filename: string
	data64?: string
	onDownload?: () => void
	onClose: () => void
	children?: ReactNode
})
{
	const { t } = useTranslation()

	return (
		<div className="flex h-12 shrink-0 items-center justify-between gap-2 bg-book-900 pl-4 text-book-100 sm:gap-4">
			<p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{filename}</p>
			{children}
			<div className="flex items-center">
				{onDownload && (
					<>
						<span className="mr-1 hidden whitespace-nowrap text-sm tabular-nums text-book-300 sm:inline">{formatBase64Size(data64)}</span>
						<ViewerButton icon={<span className="icon-[mdi--download]" />} label={t('actions.download')} onClick={onDownload} />
					</>
				)}
				<ViewerButton icon={<span className="icon-[mdi--close]" />} label={t('actions.close')} onClick={onClose} data-autofocus />
			</div>
		</div>
	)
}

/** Column layout every viewer uses: toolbar on top, content filling the rest. */
export function ViewerShell({ children }: { children: ReactNode })
{
	return <div className="flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden">{children}</div>
}
