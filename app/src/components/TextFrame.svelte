<script lang="ts">
import { createEventDispatcher } from 'svelte'

import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'
import { formatBase64Size } from '~/lib/fileSize'
import { decodeBase64Text } from '~/lib/attachments'

// Props
let locale: Locales | undefined = undefined
let filename: string | undefined = undefined
let contentType: string | undefined = undefined
let data64: string | undefined = undefined
export {
	locale,
	filename,
	contentType,
	data64,
}

const _ = i18nFactory(locale)

$: text = (() =>
{
	try { return decodeBase64Text(data64) }
	catch { return '' }
})()

function download()
{
	if (!data64) return
	const a = document.createElement('a')
	a.href = `data:${contentType ?? 'text/plain'};base64,${data64}`
	a.download = filename ?? 'file.txt'
	a.click()
	a.remove()
}

const dispatch = createEventDispatcher()
</script>

<div class="wrapper">
	<div class="file-nav">
		<p class="file-title">{filename}</p>
		<div class="file-actions">
			<span class="size tabular">{formatBase64Size(data64)}</span>
			<button on:click|preventDefault={download}>
				<span class="icon-[mdi--download]"></span>
				<span class="sr-only">{_({ en: 'Download', fr: 'Télécharger' })}</span>
			</button>
			<button on:click|preventDefault={() => dispatch('close')} data-autofocus>
				<span class="icon-[mdi--close]"></span>
				<span class="sr-only">{_({ en: 'Close', fr: 'Fermer' })}</span>
			</button>
		</div>
	</div>

	<div class="file-content">
		<pre class="sheet">{text}</pre>
	</div>
</div>

<style lang="scss">
@reference "#tailwind.css";

.wrapper {
	@apply flex max-h-full min-h-0 w-full flex-col overflow-hidden;
}

.file-nav {
	@apply flex h-12 shrink-0 items-center justify-between gap-4 bg-book-900 pl-4 text-book-100;

	.file-title {
		@apply min-w-0 truncate text-[15px] font-semibold;
	}

	.file-actions {
		@apply flex items-center;
	}

	.size {
		@apply mr-2 hidden text-sm text-book-300 sm:inline;
	}

	button {
		@apply flex h-12 min-w-12 cursor-pointer items-center justify-center text-xl;

		&:hover {
			@apply bg-book-700;
		}
	}
}

.file-content {
	@apply min-h-0 grow overflow-auto bg-book-700 p-4 sm:p-8;
}

.sheet {
	@apply mx-auto max-w-[80ch] rounded-[3px] bg-white p-6 text-[15px] leading-relaxed text-book-800 sm:p-10;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	font-family: var(--font-sans);
	box-shadow: 0 12px 30px rgb(0 0 0 / 0.35);
}
</style>
