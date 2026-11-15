import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useStore } from '@nanostores/react'

import { cx } from '~/lib/cx'
import {
	getAttachmentContentType,
	getAttachmentFileName,
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
import styles from './AttachmentModal.module.css'

const inkClass = {
	pdf: styles.inkPdf,
	image: styles.inkImage,
	other: styles.inkOther,
}

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

	const attachment = index !== null ? data?.attachments?.[index] ?? null : null
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
	const filename = getAttachmentFileName(attachment) ?? 'file'
	const contentType = getAttachmentContentType(attachment) ?? undefined
	const data64: string | undefined = attachment.data64

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

	const shape = kind === 'pdf' ? styles.fullscreen : kind === 'text' ? styles.fit : undefined

	return (
		<div
			ref={wrapper}
			className={styles.backdrop}
			role="dialog"
			aria-modal="true"
			aria-label={filename}
			onClick={onBackdrop}
		>
			<div className={cx(styles.modal, shape, inkClass[getInkKind(attachment)])}>
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
			</div>
		</div>
	)
}
