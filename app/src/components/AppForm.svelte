<script lang="ts">
import { onMount } from 'svelte'

import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'
import { loadEmlFile } from '~/lib/loadEml'
import emlData from '~/stores/emlData'
import emlError from '~/stores/emlError'

// Props
let userClass: string | undefined = undefined
let style: string | undefined = undefined
let locale: Locales | undefined = undefined
export {
	userClass as class,
	style,
	locale,
}

const _ = i18nFactory(locale)

let input: HTMLInputElement
let dragging = false
let dragDepth = 0
let loading = false

async function loadFile(file: File)
{
	loading = true
	const ok = await loadEmlFile(file)
	loading = false
	if (input) input.value = ''
	if (ok) window.scrollTo({ top: 0 })
}

function onChange(event: Event)
{
	const file = (event.target as HTMLInputElement).files?.[0]
	if (file)
	{
		loadFile(file)
	}
}

function hasFiles(event: DragEvent)
{
	return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

onMount(() =>
{
	function onDragEnter(event: DragEvent)
	{
		if (!hasFiles(event)) return
		event.preventDefault()
		dragDepth++
		dragging = true
	}

	function onDragOver(event: DragEvent)
	{
		if (!hasFiles(event)) return
		event.preventDefault()
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
	}

	function onDragLeave(event: DragEvent)
	{
		if (!hasFiles(event)) return
		dragDepth = Math.max(0, dragDepth - 1)
		if (dragDepth === 0) dragging = false
	}

	function onDrop(event: DragEvent)
	{
		if (!hasFiles(event)) return
		event.preventDefault()
		dragDepth = 0
		dragging = false
		const file = event.dataTransfer?.files?.[0]
		if (file)
		{
			loadFile(file)
		}
	}

	window.addEventListener('dragenter', onDragEnter)
	window.addEventListener('dragover', onDragOver)
	window.addEventListener('dragleave', onDragLeave)
	window.addEventListener('drop', onDrop)

	return () =>
	{
		window.removeEventListener('dragenter', onDragEnter)
		window.removeEventListener('dragover', onDragOver)
		window.removeEventListener('dragleave', onDragLeave)
		window.removeEventListener('drop', onDrop)
	}
})
</script>

<input
	bind:this={input}
	id="eml-file-input"
	type="file"
	class="sr-only"
	tabindex="-1"
	aria-hidden="true"
	accept=".eml,message/rfc822"
	on:change={onChange}
/>

{#if dragging}
	<div class="drop-overlay" aria-hidden="true">
		<div class="drop-target">
			<span class="icon-[mdi--tray-arrow-down]"></span>
			<span>
				{_({
					en: 'Drop to open this email',
					fr: 'Déposez pour ouvrir cet e-mail',
				})}
			</span>
		</div>
	</div>
{/if}

{#if !$emlData}
	<section
		class={['empty', userClass].filter(Boolean).join(' ')}
		style={style}
	>
		<div class="stack">
			<div class="sheet sheet-back"></div>
			<div class="sheet letter">
				<div class="postmark" aria-hidden="true">
					<small>
						{_({ en: 'Opened locally', fr: 'Ouvert en local' })}
					</small>
					<strong>
						{_({ en: 'No upload', fr: 'Aucun envoi' })}
					</strong>
					<small>
						{_({ en: 'This device', fr: 'Cet appareil' })}
					</small>
				</div>

				<h1>
					{_({
						en: 'Read an email file',
						fr: 'Lire un fichier e-mail',
					})}
				</h1>
				<p class="lede">
					{_({
						en: 'Drop an .eml file anywhere on this page, or choose one from your device. It opens right here in your browser and is never uploaded.',
						fr: 'Déposez un fichier .eml n\'importe où sur cette page, ou choisissez-en un sur votre appareil. Il s\'ouvre ici, dans votre navigateur, et n\'est jamais envoyé.',
					})}
				</p>

				<div class="actions">
					<button type="button" class="btn-primary" aria-busy={loading} on:click={() => input.click()}>
						<span class="icon-[mdi--file-upload-outline]"></span>
						{loading
							? _({ en: 'Opening…', fr: 'Ouverture…' })
							: _({ en: 'Choose a file', fr: 'Choisir un fichier' })}
					</button>
					<span class="hint">
						{_({
							en: '.eml files are what mail programs save when you export or download a message.',
							fr: 'Les fichiers .eml sont ceux que les logiciels de messagerie créent quand vous exportez ou téléchargez un message.',
						})}
					</span>
				</div>

				{#if $emlError}
					<div class="error" role="alert">
						<span class="icon-[mdi--alert-circle-outline]"></span>
						<div>
							<p class="error-title">
								{_({
									en: 'This file couldn\'t be read as an email.',
									fr: 'Ce fichier n\'a pas pu être lu comme un e-mail.',
								})}
							</p>
							<p>
								{_({
									en: 'Make sure it is an .eml file saved from a mail program, then try again.',
									fr: 'Vérifiez qu\'il s\'agit d\'un fichier .eml enregistré depuis une messagerie, puis réessayez.',
								})}
							</p>
							<p class="error-detail">{$emlError}</p>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<aside class="rail" aria-hidden="true">
			<p class="rail-title">
				{_({ en: 'Attachments', fr: 'Pièces jointes' })}
			</p>
			<div class="strip">
				<div class="stamp-ghost"></div>
				<div class="stamp-ghost"></div>
			</div>
			<p class="rail-note">
				{_({
					en: 'Attachments are mounted here, with their size and type.',
					fr: 'Les pièces jointes apparaissent ici, avec leur taille et leur type.',
				})}
			</p>
		</aside>
	</section>
{/if}

<style lang="scss">
@reference "#tailwind.css";

.drop-overlay {
	@apply fixed inset-0 z-[900] flex items-center justify-center p-6;
	background: color-mix(in srgb, var(--color-book-900) 82%, transparent);
	animation: fade-in 120ms ease-out;
}

.drop-target {
	@apply flex flex-col items-center gap-3 rounded-sm px-12 py-10 text-center;
	@apply font-display text-2xl font-semibold text-white;
	border: 2px dashed var(--color-ultramarine-light);

	> span:first-child {
		@apply text-5xl text-ultramarine-light;
	}
}

.empty {
	@apply grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_300px];
}

.stack {
	@apply relative isolate;
}

.sheet {
	@apply rounded-[3px] bg-white;
}

.sheet-back {
	@apply absolute inset-0 -z-10 bg-book-200;
	transform: rotate(-1.6deg) translate(-6px, 6px);
}

.letter {
	@apply relative px-6 py-8 text-book-800 sm:px-11 sm:py-12;
	box-shadow: 0 18px 40px rgb(0 0 0 / 0.35);
	min-height: min(440px, 60vh);
}

.postmark {
	@apply float-right mb-3 ml-4 flex h-[7.25rem] w-[7.25rem] flex-col items-center justify-center rounded-full text-center text-ultramarine sm:mb-4 sm:ml-6 sm:h-[132px] sm:w-[132px];
	border: 3px solid currentColor;
	transform: rotate(-8deg);

	small {
		@apply font-display text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em];
	}

	strong {
		@apply my-1 font-display text-base font-bold uppercase leading-none sm:text-xl;
	}
}

h1 {
	@apply max-w-[16ch] font-display text-4xl font-semibold leading-[1.1] text-book-800 sm:text-5xl;
	text-wrap: balance;
}

.lede {
	@apply mt-5 max-w-[56ch] text-lg leading-relaxed text-book-600;
}

.actions {
	@apply mt-9 flex flex-col items-start gap-3;
}

.btn-primary {
	@apply inline-flex cursor-pointer items-center gap-2 rounded bg-ultramarine px-5 py-3 text-lg font-semibold text-white;
	transition: background-color 150ms ease-out, transform 150ms ease-out;

	&:hover {
		background: color-mix(in srgb, var(--color-ultramarine) 85%, black);
	}

	&:active {
		transform: translateY(1px);
	}

	&[aria-busy="true"] {
		@apply cursor-progress opacity-80;
	}

	span {
		@apply text-xl;
	}
}


.hint {
	@apply max-w-[52ch] text-sm text-book-500;
}

.error {
	@apply mt-8 flex gap-3 rounded-sm bg-carmine-wash p-4 text-carmine;

	> span {
		@apply mt-0.5 shrink-0 text-xl;
	}

	p {
		@apply text-book-700;
	}

	.error-title {
		@apply font-semibold text-carmine;
	}

	.error-detail {
		@apply mt-1 text-sm text-book-500;
	}
}

.rail {
	@apply hidden lg:block;
}

.rail-title {
	@apply mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-book-300;
}

.strip {
	@apply flex flex-col gap-4 px-3.5 py-4;
	background: linear-gradient(rgb(214 226 232 / 0.12), rgb(214 226 232 / 0.07));
	border-top: 1px solid rgb(233 238 240 / 0.22);
}

.stamp-ghost {
	@apply h-[92px];
	border: 1.5px dashed var(--color-book-600);
}

.rail-note {
	@apply mt-4 text-sm leading-relaxed text-book-300;
}

@keyframes fade-in {
	from { opacity: 0; }
}
</style>
