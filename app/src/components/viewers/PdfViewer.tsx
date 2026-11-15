import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { downloadBase64 } from '~/lib/download'
import { ViewerButton, ViewerNav, ViewerReadout, ViewerShell } from './ViewerNav'

const MIN_SCALE = 0.25
const MAX_SCALE = 5
const ZOOM_STEP = 1.25

export function PdfViewer({ filename, data64, onClose }: {
	filename: string
	data64?: string
	onClose: () => void
})
{
	const { t } = useTranslation()
	const contentRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const textLayerRef = useRef<HTMLDivElement>(null)

	// Rendering state lives in refs so async renders always see the latest values
	const pdfRef = useRef<any>(null)
	const pageRef = useRef(1)
	const scaleRef = useRef<number | null>(null)
	const fitRef = useRef(true)
	const renderTaskRef = useRef<any>(null)

	const [page, setPage] = useState(1)
	const [numPages, setNumPages] = useState<number | null>(null)
	const [scale, setScale] = useState<number | null>(null)
	const [fit, setFit] = useState(true)

	const render = useCallback(async () =>
	{
		const pdf = pdfRef.current
		const content = contentRef.current
		const canvas = canvasRef.current
		const textLayer = textLayerRef.current
		if (!pdf || !content || !canvas || !textLayer) return

		const pdfPage = await pdf.getPage(pageRef.current)

		if (scaleRef.current === null || fitRef.current)
		{
			// Fit the whole page inside the content area (minus its padding)
			const { width, height } = pdfPage.getViewport({ scale: 1 })
			const style = getComputedStyle(content)
			const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
			const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
			scaleRef.current = Math.max(MIN_SCALE, Math.min(
				(content.clientWidth - padX) / width,
				(content.clientHeight - padY) / height,
			))
		}

		const viewport = pdfPage.getViewport({ scale: scaleRef.current })
		const ratio = window.devicePixelRatio || 1

		// Draw at device resolution so text stays sharp on high-DPI screens
		canvas.width = Math.floor(viewport.width * ratio)
		canvas.height = Math.floor(viewport.height * ratio)
		canvas.style.width = `${Math.floor(viewport.width)}px`
		canvas.style.height = `${Math.floor(viewport.height)}px`

		renderTaskRef.current?.cancel()
		const task = pdfPage.render({
			canvasContext: canvas.getContext('2d'),
			viewport,
			transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
		})
		renderTaskRef.current = task

		try
		{
			await task.promise
		}
		catch
		{
			return // superseded by a newer render
		}

		// Selectable text layer over the canvas
		const PdfJS = await import('pdfjs-dist')
		textLayer.innerHTML = ''
		textLayer.style.setProperty('--scale-factor', String(scaleRef.current))
		textLayer.style.width = `${viewport.width}px`
		textLayer.style.height = `${viewport.height}px`
		await new PdfJS.TextLayer({
			textContentSource: await pdfPage.getTextContent(),
			container: textLayer,
			viewport,
		}).render()

		setScale(scaleRef.current)
	}, [])

	// Load the document once
	useEffect(() =>
	{
		if (!data64) return
		let cancelled = false
		let loaded: any = null

		;(async () =>
		{
			const PdfJS = await import('pdfjs-dist')
			const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
			PdfJS.GlobalWorkerOptions.workerSrc = worker
			loaded = await PdfJS.getDocument({ data: atob(data64) }).promise
			if (cancelled)
			{
				loaded.destroy()
				return
			}
			pdfRef.current = loaded
			setNumPages(loaded.numPages)
			await render()
		})()

		return () =>
		{
			cancelled = true
			renderTaskRef.current?.cancel()
			pdfRef.current = null
			loaded?.destroy()
		}
	}, [data64, render])

	// Refit when the window resizes, while in fit mode
	useEffect(() =>
	{
		const content = contentRef.current
		if (!content) return
		let timer: ReturnType<typeof setTimeout> | null = null
		const observer = new ResizeObserver(() =>
		{
			if (!fitRef.current || !pdfRef.current) return
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => void render(), 60)
		})
		observer.observe(content)
		return () =>
		{
			observer.disconnect()
			if (timer) clearTimeout(timer)
		}
	}, [render])

	const goTo = useCallback(async (target: number) =>
	{
		const pdf = pdfRef.current
		if (!pdf) return
		const next = Math.min(Math.max(1, target), pdf.numPages)
		if (next === pageRef.current) return
		pageRef.current = next
		setPage(next)
		await render()
	}, [render])

	// Arrow keys flip pages
	useEffect(() =>
	{
		function onKey(event: KeyboardEvent)
		{
			if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
			{
				event.preventDefault()
				void goTo(pageRef.current - 1)
			}
			else if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
			{
				event.preventDefault()
				void goTo(pageRef.current + 1)
			}
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [goTo])

	async function zoomBy(factor: number)
	{
		if (!pdfRef.current || scaleRef.current === null) return
		fitRef.current = false
		setFit(false)
		scaleRef.current = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scaleRef.current * factor))
		await render()
	}

	async function zoomFit()
	{
		if (!pdfRef.current) return
		fitRef.current = true
		setFit(true)
		await render()
	}

	const ready = numPages !== null

	return (
		<ViewerShell>
			<ViewerNav
				filename={filename}
				data64={data64}
				onDownload={() => downloadBase64(data64, filename, 'application/pdf')}
				onClose={onClose}
			>
				<div className="flex items-center">
					<ViewerButton icon={<span className="icon-[mdi--chevron-left]" />} label={t('viewer.previousPage')} onClick={() => goTo(page - 1)} disabled={!ready || page <= 1} />
					<ViewerReadout label={t('viewer.page')}>{page} / {numPages ?? '…'}</ViewerReadout>
					<ViewerButton icon={<span className="icon-[mdi--chevron-right]" />} label={t('viewer.nextPage')} onClick={() => goTo(page + 1)} disabled={!ready || page >= (numPages ?? 1)} />
				</div>

				<div className="hidden items-center md:flex">
					<ViewerButton icon={<span className="icon-[mdi--magnify-minus]" />} label={t('viewer.zoomOut')} onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!ready || (scale ?? 1) <= MIN_SCALE} />
					<ViewerReadout label={t('viewer.zoom')}>{scale ? `${Math.round(scale * 100)}%` : '…'}</ViewerReadout>
					<ViewerButton icon={<span className="icon-[mdi--magnify-plus]" />} label={t('viewer.zoomIn')} onClick={() => zoomBy(ZOOM_STEP)} disabled={!ready || (scale ?? 1) >= MAX_SCALE} />
					<ViewerButton icon={<span className="icon-[mdi--fit-to-screen]" />} label={t('viewer.fit')} onClick={zoomFit} aria-pressed={fit} disabled={!ready} />
				</div>
			</ViewerNav>

			<div ref={contentRef} className="relative flex min-h-0 grow overflow-auto bg-book-700 p-4">
				<div className="relative m-auto shrink-0 bg-white shadow-page">
					<canvas ref={canvasRef} className="block" />
					<div ref={textLayerRef} className="pdf-text-layer" />
				</div>
			</div>
		</ViewerShell>
	)
}
