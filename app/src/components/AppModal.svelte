<script lang="ts">
import { tick } from 'svelte'

import type { Locales } from '~/i18n/type.d.ts'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import emlData from '~/stores/emlData'
import {
	decodeBase64Text,
	getAttachmentContentType,
	getAttachmentFileName,
	getInkKind,
	getPreviewKind,
} from '~/lib/attachments'
import { loadEmlText } from '~/lib/loadEml'
import PdfFrame from '~/components/PdfFrame.svelte'
import ImageFrame from '~/components/ImageFrame.svelte'
import TextFrame from '~/components/TextFrame.svelte'
import DownloadFrame from '~/components/DownloadFrame.svelte'

// Props
let userClass: string | undefined = undefined
let style: string | undefined = undefined
let locale: Locales | undefined = undefined
export {
	userClass as class,
	style,
	locale,
}

let wrapper: HTMLDivElement
let returnFocus: HTMLElement | null = null

$: attachment = $openedAttachmentIndex !== null ? $emlData?.attachments?.[$openedAttachmentIndex] ?? null : null
$: kind = attachment ? getPreviewKind(attachment) : null
$: ink = attachment ? getInkKind(attachment) : 'other'
$: filename = attachment ? getAttachmentFileName(attachment) ?? 'file' : 'file'
$: contentType = attachment ? getAttachmentContentType(attachment) ?? undefined : undefined

function closeModal()
{
	openedAttachmentIndex.set(null)
}

function onWrapperClick(event: MouseEvent)
{
	if (event.target === event.currentTarget)
	{
		closeModal()
	}
}

function onKeydown(event: KeyboardEvent)
{
	if ($openedAttachmentIndex !== null && event.key === 'Escape')
	{
		event.preventDefault()
		closeModal()
	}
}

async function openAttachedEmail()
{
	if (!attachment?.data64) return
	returnFocus = null
	const ok = await loadEmlText(decodeBase64Text(attachment.data64))
	if (ok) window.scrollTo({ top: 0 })
}

openedAttachmentIndex.subscribe(async index =>
{
	if (typeof document === 'undefined') return
	if (index !== null)
	{
		returnFocus = document.activeElement as HTMLElement | null
		await tick()
		wrapper?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
	}
	else if (returnFocus)
	{
		returnFocus.focus()
		returnFocus = null
	}
})
</script>

<svelte:window on:keydown={onKeydown} />

<div
	class={['modal-wrapper', userClass, attachment ? 'opened' : ''].filter(Boolean).join(' ')}
	style={style}
	bind:this={wrapper}
	role="dialog"
	aria-modal="true"
	aria-label={attachment ? filename : undefined}
	on:click={onWrapperClick}
>
	{#if attachment}
		{#if kind === 'pdf'}
			<div class={`modal modal-fullscreen ink-${ink}`}>
				<PdfFrame {locale} {filename} data64={attachment.data64} on:close={closeModal} />
			</div>
		{:else if kind === 'image'}
			<div class={`modal ink-${ink}`}>
				<ImageFrame {locale} {filename} {contentType} data64={attachment.data64} on:close={closeModal} />
			</div>
		{:else if kind === 'text'}
			<div class={`modal modal-text ink-${ink}`}>
				<TextFrame {locale} {filename} {contentType} data64={attachment.data64} on:close={closeModal} />
			</div>
		{:else}
			<div class={`modal ink-${ink}`}>
				<DownloadFrame
					{locale}
					{filename}
					{contentType}
					data64={attachment.data64}
					openable={kind === 'email'}
					on:close={closeModal}
					on:open={openAttachedEmail}
				/>
			</div>
		{/if}
	{/if}
</div>

<style lang="scss">
@reference "#tailwind.css";

:global(body):has(.modal-wrapper.opened) {
	overflow: hidden;
}

.modal-wrapper {
	@apply fixed left-0 top-0 z-[1000] flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-hidden bg-book-900/80 p-4;
	animation: fade-in 140ms ease-out;

	&:not(.opened) {
		@apply hidden;
	}
}

.modal {
	@apply mx-auto w-full max-w-[calc(1000px_+_2rem)] overflow-hidden rounded-[3px] border border-book-700 bg-book-800 shadow-2xl;
	border-top: 4px solid var(--ink);
	animation: rise 260ms cubic-bezier(0.16, 1, 0.3, 1);

	&.modal-fullscreen {
		@apply grow;
	}

	&.modal-text {
		@apply flex max-h-full min-h-0 flex-col;
	}
}

.ink-pdf { --ink: var(--color-carmine); }
.ink-image { --ink: var(--color-ultramarine); }
.ink-other { --ink: var(--color-olive); }

@keyframes fade-in {
	from { opacity: 0; }
}

@keyframes rise {
	from { transform: translateY(12px); }
}
</style>
