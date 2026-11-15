<script lang="ts">
import { createEventDispatcher } from 'svelte'
import { formatBase64Size } from '~/lib/fileSize'

import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'

// Props
let userClass: string | undefined = undefined
let style: string | undefined = undefined
let locale: Locales | undefined = undefined
let filename: string | undefined = undefined
let contentType: string | undefined = undefined
let data64: string | undefined = undefined
let openable: boolean = false
export {
	userClass as class,
	style,
	locale,
	filename,
	contentType,
	data64,
	openable,
}

const _ = i18nFactory(locale)

$: extension = /\.([a-z0-9]{1,5})$/i.exec(filename ?? '')?.[1]?.toUpperCase() ?? ''
$: size = formatBase64Size(data64)

function downloadFile()
{
	if (!data64)
	{
		return
	}

	const a = document.createElement('a')
	a.href = `data:${contentType};base64,${data64}`
	a.download = filename ?? 'file'
	a.click()
	a.remove()
}

const dispatch = createEventDispatcher()

function close()
{
	dispatch('close')
}
</script>

<div
	class={['wrapper', userClass].filter(Boolean).join(' ')}
	style={style}
>
	<div class="file-nav">
		<p class="file-title">{filename}</p>
		<button on:click|preventDefault={close} data-autofocus>
			<span class="icon-[mdi--close]"></span>
			<span class="sr-only">
				{_({
					en: 'Close',
					fr: 'Fermer',
				})}
			</span>
		</button>
	</div>

	<div class="file-content">
		<span class="file-icon icon-[mdi--file-download-outline]"></span>
		<p class="file-name">{filename}</p>
		<p class="file-meta tabular">
			{extension}{extension && size ? ' · ' : ''}{size}
		</p>
		<p class="file-note">
			{openable
				? _({
					en: 'This attachment is an email itself. Open it here, or download it.',
					fr: 'Cette pièce jointe est elle-même un e-mail. Ouvrez-la ici ou téléchargez-la.',
				})
				: _({
					en: 'This file type can\'t be previewed here. Download it to open it with another app.',
					fr: 'Ce type de fichier ne peut pas être prévisualisé ici. Téléchargez-le pour l\'ouvrir avec une autre application.',
				})}
		</p>
		<div class="file-buttons">
		{#if openable}
			<button class="file-download" on:click|preventDefault={() => dispatch('open')}>
				<span class="icon-[mdi--email-open-outline]"></span>
				{_({ en: 'Open this email', fr: 'Ouvrir cet e-mail' })}
			</button>
		{/if}
		<button class={openable ? 'file-secondary' : 'file-download'} on:click|preventDefault={downloadFile}>
			<span class="icon-[mdi--download]"></span>
			{_({
				en: 'Download file',
				fr: 'Télécharger le fichier',
			})}
		</button>
		</div>
	</div>
</div>

<style lang="scss">
@reference "#tailwind.css";

.wrapper {
	@apply flex h-full w-full flex-col overflow-hidden;
}

.file-nav {
	@apply flex h-12 shrink-0 items-center justify-between gap-4 bg-book-900 pl-4 text-book-100;

	.file-title {
		@apply min-w-0 truncate text-[15px] font-semibold;
	}

	button {
		@apply flex h-12 min-w-12 cursor-pointer items-center justify-center text-xl;

		&:hover {
			@apply bg-book-700;
		}
	}
}

.file-content {
	@apply flex min-h-72 grow flex-col items-center justify-center gap-2 overflow-y-auto bg-book-800 px-6 py-10 text-center text-book-100;

	.file-icon {
		@apply mb-2 text-6xl text-olive-light;
	}

	.file-name {
		@apply max-w-full font-display text-2xl font-semibold;
		overflow-wrap: anywhere;
	}

	.file-meta {
		@apply text-sm text-book-300;
	}

	.file-note {
		@apply mt-2 max-w-[44ch] text-[15px] text-book-200;
	}

	.file-buttons {
		@apply mt-5 flex flex-wrap justify-center gap-3;
	}

	.file-secondary {
		@apply inline-flex cursor-pointer items-center gap-2 rounded border border-book-500 px-5 py-2.5 font-semibold text-book-100;

		&:hover {
			@apply bg-book-700;
		}
	}

	.file-download {
		@apply inline-flex cursor-pointer items-center gap-2 rounded bg-ultramarine px-5 py-2.5 font-semibold text-white;

		&:hover {
			background: color-mix(in srgb, var(--color-ultramarine) 85%, black);
		}
	}
}
</style>
