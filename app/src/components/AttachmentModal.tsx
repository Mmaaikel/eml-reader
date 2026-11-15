import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useStore } from '@nanostores/react'

import { cn } from '~/lib/cn'
import {
	getAttachmentContentType,
	getInkKind,
	getPreviewKind,
} from '~/lib/attachments'
import { loadEmlBase64 } from '~/lib/loadEml'
import emlData from '~/stores/emlData'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import { DownloadViewer } from './viewers/DownloadViewer'
import { ImageViewer } from './viewers/ImageViewer'
import { PdfViewer } from './viewers/PdfViewer'
import { TextViewer } from './viewers/TextViewer'
import { ErrorBoundary } from './ErrorBoundary'
import { PreviewError } from './RenderError'
import { inkClass } from './reader/AttachmentRail'

function close()
{
	openedAttachmentIndex.set(null)
}

export function AttachmentModal()
{
	const data = useStore(emlData)
	const index = useStore(openedAttachmentIndex)
	const wrapper = useRef<HTMLDivElement>(null)
	const returnFocus = useRef<HTMLElement | null>(null)

	const attachment = index !== null ? data?.attachments[index] ?? null : null
	const open = attachment !== null

	// Move focus into the dialog when it opens, and back to the stamp when it closes
	useLayoutEffect(() =>
	{
		if (open)
		{
			returnFocus.current = document.activeElement as HTMLElement | null
			wrapper.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
		}
		else if (returnFocus.current)
		{
			returnFocus.current.focus()
			returnFocus.current = null
		}
	}, [open, index])

	useEffect(() =>
	{
		if (!open) return
		function onKey(event: KeyboardEvent)
		{
			if (event.key === 'Escape')
			{
				event.preventDefault()
				close()
			}
		}
		window.addEventListener('keydown', onKey)
		document.body.style.overflow = 'hidden'
		return () =>
		{
			window.removeEventListener('keydown', onKey)
			document.body.style.overflow = ''
		}
	}, [open])

	if (!attachment) return null

	const kind = getPreviewKind(attachment)
	const filename = attachment.filename ?? 'file'
	const contentType = getAttachmentContentType(attachment)
	const data64 = attachment.data64

	async function openAttachedEmail()
	{
		if (!data64) return
		returnFocus.current = null
		if (await loadEmlBase64(data64)) window.scrollTo({ top: 0 })
	}

	function onBackdrop(event: MouseEvent<HTMLDivElement>)
	{
		if (event.target === event.currentTarget) close()
	}

	const shape = kind === 'pdf' ? 'grow' : kind === 'text' ? 'flex max-h-full min-h-0 flex-col' : undefined

	return (
		<div
			ref={wrapper}
			className="fixed inset-0 z-[1000] flex animate-fade-in flex-col items-center justify-center gap-4 overflow-y-hidden bg-book-900/80 p-4"
			role="dialog"
			aria-modal="true"
			aria-label={filename}
			onClick={onBackdrop}
		>
			<div className={cn('mx-auto w-full max-w-[calc(1000px+2rem)] animate-rise overflow-hidden rounded-[3px] border border-t-4 border-book-700 border-t-(--ink) bg-book-800 shadow-2xl', shape, inkClass[getInkKind(attachment)])}>
				<ErrorBoundary resetKey={attachment} fallback={error => <PreviewError error={error} onClose={close} />}>
				{kind === 'pdf' && <PdfViewer filename={filename} data64={data64} onClose={close} />}
				{kind === 'image' && <ImageViewer filename={filename} contentType={contentType} data64={data64} onClose={close} />}
				{kind === 'text' && <TextViewer filename={filename} contentType={contentType} data64={data64} onClose={close} />}
				{(kind === 'download' || kind === 'email') && (
					<DownloadViewer
						filename={filename}
						contentType={contentType}
						data64={data64}
						openable={kind === 'email'}
						onOpen={openAttachedEmail}
						onClose={close}
					/>
				)}
				</ErrorBoundary>
			</div>
		</div>
	)
}
