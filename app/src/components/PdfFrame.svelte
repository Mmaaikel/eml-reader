<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from 'svelte'
import { formatBase64Size } from '~/lib/fileSize'

import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'

// Props
let userClass: string | undefined = undefined
let style: string | undefined = undefined
let locale: Locales | undefined = undefined
let filename: string | undefined = undefined
let data64: string | undefined = undefined
export {
	userClass as class,
	style,
	locale,
	filename,
	data64,
}

const _ = i18nFactory(locale)

let scale: number | null = null
let scaleFit: boolean = true

let currPage = 1
let contentWrapper: HTMLDivElement
let pdfCanvas: HTMLCanvasElement
let textLayer: HTMLDivElement

let pdfDocument: any = null

function getInitialScale(page: any)
{
	// Get the standard scale page dimensions
	const { width, height } = page.getViewport({ scale: 1 })

	return Math.min(
		contentWrapper.offsetWidth / width,
		contentWrapper.offsetHeight / height,
	)
}

async function handlePage(page: any)
{
	if (scale === null)
	{
		scale = getInitialScale(page)
	}

	var viewport = page.getViewport({ scale: scale })

	// Prepare canvas using PDF page dimensions
	var context = pdfCanvas.getContext('2d')
	pdfCanvas.height = viewport.height
	pdfCanvas.width = viewport.width

	// Render PDF page into canvas context
	var renderContext = {
		canvasContext: context,
		viewport: viewport
	}
	var renderTask = page.render(renderContext)

	var textPromise = page.getTextContent()

	await Promise.all([
		renderTask.promise,
		textPromise,
	]).then(async ([_, textContent]) =>
		{
			// Prepare text layer
			textLayer.innerHTML = ''

			// Set --scale-factor to the PDF scale
			textLayer.style.setProperty('--scale-factor', scale!.toString())
			textLayer.style.width = `${viewport.width}px`
			textLayer.style.height = `${viewport.height}px`

			const PdfJS = await import('pdfjs-dist')
			const layer = new PdfJS.TextLayer({
				textContentSource: textContent,
				container: textLayer,
				viewport: viewport,
			})
			await layer.render()
		})
}

async function loadPdf(data: string)
{
	const PdfJS = await import('pdfjs-dist')
	const PdfJSWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
	PdfJS.GlobalWorkerOptions.workerSrc = PdfJSWorker
	await PdfJS.getDocument({ data: data }).promise.then((pdf: any) =>
		{
			pdfDocument = pdf
		})
}

let resizeHandlerTimeout: NodeJS.Timeout | null = null
let resizeHandleMutex: boolean = false

function onPdfContentResize(_: ResizeObserverEntry[], __: ResizeObserver)
{
	if (resizeHandleMutex || (scale !== null && !scaleFit))
	{
		return
	}

	if (resizeHandlerTimeout !== null)
	{
		clearTimeout(resizeHandlerTimeout)
	}

	resizeHandlerTimeout = setTimeout(() =>
		{
			if (!pdfDocument || (scale !== null && !scaleFit))
			{
				return
			}

			resizeHandleMutex = true

			// Fetch the current page
			pdfDocument.getPage(currPage).then(
				async (page: any) =>
				{
					// Reset the scale
					scale = getInitialScale(page)

					// Re-render the page
					await handlePage(page)

					resizeHandleMutex = false
				},
			)
		}, 50)
}

onMount(async () =>
	{
		if (!data64)
		{
			return
		}

		await loadPdf(atob(data64))
		new ResizeObserver(onPdfContentResize).observe(contentWrapper)
	})

onDestroy(async () =>
	{
		pdfDocument = null
	})


const MIN_SCALE = 0.25
const MAX_SCALE = 5

async function rerender()
{
	await pdfDocument?.getPage(currPage).then(handlePage)
}

async function zoomBy(factor: number)
{
	if (!pdfDocument || scale === null) return
	scaleFit = false
	scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor))
	await rerender()
}

async function zoomFit()
{
	if (!pdfDocument) return
	scaleFit = true
	const page = await pdfDocument.getPage(currPage)
	scale = getInitialScale(page)
	await handlePage(page)
}

async function loadPreviousPage()
{
	// Previous page
	currPage = Math.max(currPage - 1, 1)
	await pdfDocument?.getPage(currPage).then(handlePage)
}

async function loadNextPage()
{
	// Next page
	currPage = Math.min(currPage + 1, pdfDocument.numPages)
	await pdfDocument?.getPage(currPage).then(handlePage)
}

async function onPdfContentKeyUp(event: KeyboardEvent)
{
	if (!pdfDocument)
	{
		return
	}

	switch(event.key)
	{
		case 'ArrowUp':
		case 'ArrowLeft':
		{
			// Previous page
			event.preventDefault()
			await loadPreviousPage()
			break
		}
		case 'ArrowDown':
		case 'ArrowRight':
		{
			// Next page
			event.preventDefault()
			await loadNextPage()
			break
		}
	}
}

async function downloadPdf()
{
	if (!data64)
	{
		return
	}

	const a = document.createElement('a')
	a.href = `data:application/pdf;base64,${data64}`
	a.download = filename ?? 'document.pdf'
	a.click()
	a.remove()
}

const dispatch = createEventDispatcher()

async function closePdfFrame()
{
	dispatch('close')
}
</script>

<svelte:document
	on:keyup={onPdfContentKeyUp}
/>

<div
	class={Array.from(new Set([
		'wrapper',
		...(userClass ? userClass.split(' ') : []),
	])).join(' ')}
	style={style}
>

	<div class="pdf-nav">
		<div class="pdf-nav-section">
			<p>{filename}</p>
		</div>
		<div class="pdf-nav-section">
			<div class="pdf-nav-section">
				<p class="min-width-2 tabular">
					<span class="sr-only">Page</span>
					{currPage} / {pdfDocument?.numPages ?? '...'}
				</p>
				<div class="buttons-group">
					<button
						on:click|preventDefault={loadPreviousPage}
					>
						<span class="icon icon-[mdi--chevron-left]"></span>
						<span class="sr-only">{_({ en: 'Previous page', fr: 'Page précédente' })}</span>
					</button>
					<button
						on:click|preventDefault={loadNextPage}
					>
						<span class="sr-only">{_({ en: 'Next page', fr: 'Page suivante' })}</span>
						<span class="icon icon-[mdi--chevron-right]"></span>
					</button>
				</div>
			</div>
			<div class="pdf-nav-section">
				<p class="min-width-1">
					<span class="sr-only">Zoom</span>
					{scale ? `${Math.round(scale * 100)}%` : '...'}
				</p>
				<div class="buttons-group">
					<button on:click|preventDefault={() => zoomBy(1 / 1.25)} disabled={!pdfDocument || (scale ?? 1) <= MIN_SCALE}>
						<span class="sr-only">{_({ en: 'Zoom out', fr: 'Zoom arrière' })}</span>
						<span class="icon icon-[mdi--magnify-minus]"></span>
					</button>
					<button on:click|preventDefault={() => zoomBy(1.25)} disabled={!pdfDocument || (scale ?? 1) >= MAX_SCALE}>
						<span class="sr-only">{_({ en: 'Zoom in', fr: 'Zoom avant' })}</span>
						<span class="icon icon-[mdi--magnify-plus]"></span>
					</button>
					<button class={scaleFit ? 'active' : undefined} aria-pressed={scaleFit} on:click|preventDefault={zoomFit} disabled={!pdfDocument}>
						<span class="sr-only">{_({ en: 'Fit to screen', fr: 'Ajuster à l\'écran' })}</span>
						<span class="icon icon-[mdi--fit-to-screen]"></span>
					</button>
				</div>
			</div>
		</div>
		<div class="pdf-nav-section pdf-nav-section-end sm-small">
			<div class="pdf-nav-section">
				<p class="sm-hidden">
					<span class="icon icon-[mdi--database] align-icon-inline"></span>
					{formatBase64Size(data64)}
				</p>
				<button
					on:click|preventDefault={downloadPdf}
				>
					<span class="sr-only">{_({ en: 'Download', fr: 'Télécharger' })}</span>
					<span class="icon icon-[mdi--download]"></span>
				</button>
			</div>
			<div class="pdf-nav-section">
				<button
					on:click|preventDefault={closePdfFrame}
					data-autofocus
				>
					<span class="icon icon-[mdi--close]"></span>
					<span class="sr-only">{_({ en: 'Close', fr: 'Fermer' })}</span>
				</button>
			</div>
		</div>
	</div>

	<div
		class="pdf-content"
		bind:this={contentWrapper}
	>
		<div class="pdf-page">
			<canvas
				bind:this={pdfCanvas}
			></canvas>
			<div
				class="text-layer"
				bind:this={textLayer}
			></div>
		</div>
	</div>

	<!-- <div class="pdf-footer">
		<div class="pdf-nav-section">
		</div>
		<div class="pdf-nav-section">
		</div>
	</div> -->

</div>

<style lang="scss">
@reference "#tailwind.css";

.wrapper
{
	@apply
		flex
		flex-col
		items-center
		w-full
		h-full
		overflow-hidden
		;

	> * {
		@apply
			w-full
			shrink-0
			;
	}

	> .pdf-nav,
	> .pdf-footer {
		@apply
			bg-book-900
			grid
			grid-flow-col
			auto-cols-fr
			gap-4
			h-12
			px-4
			text-book-100
			;

		.pdf-nav-section {
			@apply
				col-span-3
				flex
				items-center
				justify-center
				gap-2
				;

			&.sm-small {
				@apply
					col-span-2
					;
			}

			&:has(.pdf-nav-section) {
				@apply
					gap-4
					;
			}

			&.pdf-nav-section-start {
				@apply
					justify-start
					;
			}

			&.pdf-nav-section-end {
				@apply
					justify-end
					;
			}

			> p {
				@apply
					truncate
					;

				&.min-width-1 {
					@apply
						min-w-10
						;
				}

				&.min-width-2 {
					@apply
						min-w-20
						;
				}
			}
		}

		.buttons-group {
			@apply
				flex
				items-center
				justify-center
				;
		}

		button {
			@apply
				flex
				items-center
				justify-center
				min-w-10
				h-10
				;

			&:disabled {
				@apply
					cursor-not-allowed
					opacity-50
					;
			}

			&:not(:disabled):hover {
				@apply
					bg-book-700
					;
			}

			&:not(:disabled):active, &.active {
				@apply
					bg-book-600
					;

				&:disabled {
					@apply
						bg-book-700
						;
				}
			}
		}
	}

	@media (max-width: 899.98px)
	{
		> .pdf-nav {
			@apply
				h-16
				;

			> .pdf-nav-section {
				&:has(.pdf-nav-section) {
					@apply
						flex-col
						gap-0
						;

					&.pdf-nav-section-start {
						@apply
							items-start
							justify-center
							;
					}

					&.pdf-nav-section-end {
						@apply
							items-end
							justify-center
							;
					}
				}

				> p {
					&.min-width-1 {
						@apply
							min-w-8
							;
					}

					&.min-width-2 {
						@apply
							min-w-16
							;
					}
				}
			}

			button {
				@apply
					min-h-8
					h-8
					;
			}
		}
	}

	@media (max-width: 599.98px)
	{
		> .pdf-nav {
			.pdf-nav-section.sm-small {
				@apply
					col-span-1
					;
			}

			.sm-hidden {
				@apply
					hidden
					;
			}
		}
	}

	> .pdf-content {
		@apply relative flex grow overflow-auto bg-book-700 p-4;
		min-height: 0;

		> .pdf-page {
			@apply relative m-auto shrink-0 bg-white;
			box-shadow: 0 12px 30px rgb(0 0 0 / 0.35);

			> canvas {
				@apply block;
			}
		}

		.text-layer {
			position: absolute;
			inset: 0;
			overflow: clip;
			line-height: 1;
			text-align: initial;
			text-size-adjust: none;
			forced-color-adjust: none;
			transform-origin: 0 0;
			caret-color: CanvasText;

			:global(span),
			:global(br) {
				color: transparent;
				position: absolute;
				white-space: pre;
				cursor: text;
				transform-origin: 0% 0%;
			}

			:global(::selection) {
				background: rgb(35 64 142 / 0.35);
			}
		}
	}

	> .pdf-footer {
		@apply
			bg-book-900
			grid
			grid-flow-col
			auto-cols-fr
			gap-4
			h-12
			px-4
			text-book-100
			;

		.pdf-nav-section {
			@apply
				col-span-3
				flex
				items-center
				justify-center
				gap-2
				;

			&.sm-small {
				@apply
					col-span-2
					;
			}

			&:has(.pdf-nav-section) {
				@apply
					gap-4
					;
			}

			&.pdf-nav-section-start {
				@apply
					justify-start
					;
			}

			&.pdf-nav-section-end {
				@apply
					justify-end
					;
			}

			> p {
				@apply
					truncate
					;

				&.min-width-1 {
					@apply
						min-w-10
						;
				}

				&.min-width-2 {
					@apply
						min-w-20
						;
				}
			}
		}

		.buttons-group {
			@apply
				flex
				items-center
				justify-center
				;
		}

		button {
			@apply
				flex
				items-center
				justify-center
				min-w-10
				h-10
				;

			&:disabled {
				@apply
					cursor-not-allowed
					opacity-50
					;
			}

			&:not(:disabled):hover {
				@apply
					bg-book-700
					;
			}

			&:not(:disabled):active, &.active {
				@apply
					bg-book-600
					;

				&:disabled {
					@apply
						bg-book-700
						;
				}
			}
		}
	}

	@media (max-width: 899.98px)
	{
		> .pdf-nav {
			@apply
				h-16
				;

			> .pdf-nav-section {
				&:has(.pdf-nav-section) {
					@apply
						flex-col
						gap-0
						;

					&.pdf-nav-section-start {
						@apply
							items-start
							justify-center
							;
					}

					&.pdf-nav-section-end {
						@apply
							items-end
							justify-center
							;
					}
				}

				> p {
					&.min-width-1 {
						@apply
							min-w-8
							;
					}

					&.min-width-2 {
						@apply
							min-w-16
							;
					}
				}
			}

			button {
				@apply
					min-h-8
					h-8
					;
			}
		}
	}

	@media (max-width: 599.98px)
	{
		> .pdf-nav {
			.pdf-nav-section.sm-small {
				@apply
					col-span-1
					;
			}

			.sm-hidden {
				@apply
					hidden
					;
			}
		}
	}

	> .pdf-content {
		@apply
			relative
			bg-book-700
			grow
			flex
			items-center
			justify-center
			mx-auto
			overflow-y-auto
			;

		> .text-layer {
			@apply
				text-transparent
				;
				// invisible

			&, > :global(*) {
				@apply
					absolute
					;
			}

			> :global(br) {
				@apply
					hidden
					;
			}
		}
	}

	> .pdf-footer {
		@apply
			flex
			items-center
			justify-around
			items-stretch
			;
	}
}
</style>
