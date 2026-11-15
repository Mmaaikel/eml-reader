import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useStore } from '@nanostores/react'

import { cn } from '~/lib/cn'
import { inkClass } from '~/lib/ink'
import { getAttachmentContentType, getInkKind, getPreviewKind } from '~/lib/attachments'
import { loadEmlBytes } from '~/lib/loadEml'
import emlData from '~/stores/emlData'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import { ErrorBoundary } from './ErrorBoundary'
import { PreviewError } from './RenderError'
import { DownloadViewer } from './viewers/DownloadViewer'
import { ImageViewer } from './viewers/ImageViewer'
import { PdfViewer } from './viewers/PdfViewer'
import { TextViewer } from './viewers/TextViewer'

function close() {
	openedAttachmentIndex.set(null)
}

/**
 * Attachment preview in a native modal <dialog>: the browser keeps focus inside it,
 * makes the page behind it inert, and closes it on Escape.
 */
export function AttachmentModal() {
	const email = useStore(emlData)
	const index = useStore(openedAttachmentIndex)
	const dialog = useRef<HTMLDialogElement>(null)
	const returnFocus = useRef<HTMLElement | null>(null)

	const attachment = index !== null ? (email?.attachments[index] ?? null) : null

	// Open as a modal and focus the close button; hand focus back to the stamp afterwards
	useLayoutEffect(() => {
		const element = dialog.current
		if (!attachment || !element) return

		returnFocus.current = document.activeElement as HTMLElement | null
		if (!element.open) element.showModal()
		element.querySelector<HTMLElement>('[data-autofocus]')?.focus()

		return () => {
			if (element.open) element.close()
			returnFocus.current?.focus()
			returnFocus.current = null
		}
	}, [attachment])

	// The page behind a modal dialog is inert, but it can still scroll
	useEffect(() => {
		if (!attachment) return
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
		}
	}, [attachment])

	if (!attachment) return null

	const kind = getPreviewKind(attachment)
	const props = {
		attachment,
		filename: attachment.filename ?? 'file',
		contentType: getAttachmentContentType(attachment),
		onClose: close,
	}

	async function openAttachedEmail() {
		returnFocus.current = null
		if (await loadEmlBytes(attachment!.content)) window.scrollTo({ top: 0 })
	}

	function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
		// Clicks on the dialog element itself land on the dimmed area around the panel
		if (event.target === event.currentTarget) close()
	}

	return (
		<dialog
			ref={dialog}
			aria-label={props.filename}
			onClose={close}
			onClick={onBackdropClick}
			className="fixed inset-0 m-0 size-full max-h-none max-w-none animate-fade-in flex-col items-center justify-center gap-4 overflow-y-hidden bg-transparent p-4 backdrop:bg-book-900/80 open:flex"
		>
			<div
				className={cn(
					'mx-auto w-full max-w-[calc(1000px+2rem)] animate-rise overflow-hidden rounded-[3px] border border-t-4 border-book-700 border-t-(--ink) bg-book-800 shadow-2xl',
					kind === 'pdf' && 'grow',
					kind === 'text' && 'flex max-h-full min-h-0 flex-col',
					inkClass[getInkKind(attachment)],
				)}
			>
				<ErrorBoundary
					resetKey={attachment}
					fallback={(error) => <PreviewError error={error} onClose={close} />}
				>
					{kind === 'pdf' && <PdfViewer {...props} />}
					{kind === 'image' && <ImageViewer {...props} />}
					{kind === 'text' && <TextViewer {...props} />}
					{kind === 'email' && <DownloadViewer {...props} onOpen={openAttachedEmail} />}
					{kind === 'download' && <DownloadViewer {...props} />}
				</ErrorBoundary>
			</div>
		</dialog>
	)
}
