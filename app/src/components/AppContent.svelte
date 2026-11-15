<script lang="ts">
import { formatSize } from '~/lib/fileSize'
import {
	getAttachmentFileName,
	getAttachmentExtension,
	getAttachmentSize,
	getInkKind,
	getPreviewKind,
	isAttachmentEmpty,
} from '~/lib/attachments'
import barlow400 from '@fontsource/barlow/files/barlow-latin-400-normal.woff2?url'
import barlow600 from '@fontsource/barlow/files/barlow-latin-600-normal.woff2?url'

import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import emlData from '~/stores/emlData'

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

type View = 'message' | 'headers'

let view: View = 'message'
let showHtml: boolean = true
let frame: HTMLIFrameElement
let frameHeight = 360
let openedAt = new Date()
let allowRemote = false
let copied: string | null = null
let copiedTimer: ReturnType<typeof setTimeout> | null = null

emlData.subscribe(data =>
{
	if (!data)
	{
		return
	}

	view = 'message'
	showHtml = Boolean(data.html)
	openedAt = new Date()
	allowRemote = false
})

$: attachments = ($emlData?.attachments ?? []) as any[]
$: recipients = toList($emlData?.to)
$: ccRecipients = toList($emlData?.cc)
$: date = $emlData?.date instanceof Date && !isNaN($emlData.date.getTime()) ? $emlData.date as Date : null
$: hasRemote = Boolean($emlData?.html) && REMOTE_PATTERN.test(String($emlData?.html ?? ''))
$: srcdoc = $emlData ? (showHtml ? getHtml($emlData, allowRemote) : getPlainText($emlData)) : ''
$: headerEntries = Object.entries($emlData?.headers ?? {}) as [string, any][]
$: keyHeaders = KEY_HEADERS
	.map(name => headerEntries.find(([key]) => key.toLowerCase() === name.toLowerCase()))
	.filter((entry): entry is [string, any] => Boolean(entry))

const REMOTE_PATTERN = /(?:src|background|href)\s*=\s*["']?\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i
const KEY_HEADERS = ['From', 'To', 'Cc', 'Reply-To', 'Subject', 'Date', 'Message-ID', 'Return-Path']

function toList(value: any): any[]
{
	if (!value) return []
	return Array.isArray(value) ? value : [value]
}

function addressParts(address: any): { name: string, email: string }
{
	if (!address) return { name: '', email: '' }
	if (typeof address === 'string') return { name: '', email: address }
	return { name: address.name ?? '', email: address.email ?? '' }
}

function escapeHtml(text: string): string
{
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function getAttachmentName(attachment: any): string
{
	return getAttachmentFileName(attachment) || _({ en: 'Untitled file', fr: 'Fichier sans nom' })
}

function getTypeLabel(attachment: any): string
{
	const kind = getPreviewKind(attachment)
	if (kind === 'pdf') return 'PDF'
	if (kind === 'image') return _({ en: 'Image', fr: 'Image' })
	if (kind === 'email') return _({ en: 'Email', fr: 'E-mail' })
	return getAttachmentExtension(attachment) || _({ en: 'File', fr: 'Fichier' })
}

function getActionLabel(attachment: any): string
{
	if (isAttachmentEmpty(attachment)) return _({ en: 'Empty file', fr: 'Fichier vide' })
	const kind = getPreviewKind(attachment)
	if (kind === 'email') return _({ en: 'Open', fr: 'Ouvrir' })
	return kind === 'download'
		? _({ en: 'Download', fr: 'Télécharger' })
		: _({ en: 'Preview', fr: 'Aperçu' })
}

function headerText(value: any): string
{
	return Array.isArray(value) ? value.join('\n') : String(value ?? '')
}

async function copy(text: string, id: string)
{
	try
	{
		await navigator.clipboard.writeText(text)
		copied = id
		if (copiedTimer) clearTimeout(copiedTimer)
		copiedTimer = setTimeout(() => copied = null, 1600)
	}
	catch
	{
		copied = null
	}
}

function frameBase(remote: boolean = false): string
{
	const origin = typeof location !== 'undefined' ? location.origin : ''
	const net = remote ? ' http: https:' : ''
	// Block anything that would reach the network unless the reader allows it
	const csp = `default-src 'none'; style-src 'unsafe-inline'${net}; img-src data:${net}; font-src data: ${origin}${net}; media-src data:${net}`
	return `<meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank"><style>
		@font-face{font-family:Barlow;font-weight:400;font-display:swap;src:url(${origin}${barlow400}) format('woff2')}
		@font-face{font-family:Barlow;font-weight:600;font-display:swap;src:url(${origin}${barlow600}) format('woff2')}
		body{margin:0}
		${remote ? '' : 'img[src^="http:"],img[src^="https:"],img[src^="//"]{display:none!important}'}
	</style>`
}

function frameDocument(body: string, head: string = ''): string
{
	return `<!doctype html><html><head><meta charset="utf-8">${frameBase()}${head}</head><body>${body}</body></html>`
}

function getPlainText(data: Record<string, any>): string
{
	const style = `<style>
		body{margin:0;padding:4px 0 24px;font:17px/1.6 Barlow,ui-sans-serif,system-ui,sans-serif;color:#212c29}
		pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:inherit;max-width:72ch}
	</style>`
	return frameDocument(`<pre>${escapeHtml(String(data.text ?? ''))}</pre>`, style)
}

function getHtml(data: Record<string, any>, remote: boolean): string
{
	if (!data.html)
	{
		return getPlainText(data)
	}

	let html: string = data.html

	// Open links outside the reader
	if (/<head[^>]*>/i.test(html))
	{
		html = html.replace(/<head([^>]*)>/i, `<head$1>${frameBase(remote)}`)
	}
	else
	{
		html = `<!doctype html><html><head><meta charset="utf-8">${frameBase(remote)}</head><body>${html}</body></html>`
	}

	// Inline cid: images from the attachments
	const cidRegex = /\ssrc=(["'])cid:([^"']+)\1/g
	let match: RegExpExecArray | null
	while ((match = cidRegex.exec(html)))
	{
		const cid = match[2]
		const attachment = attachments.find((attachment: any) => attachment.id === `<${cid}>`)
		if (attachment)
		{
			const contentType = String(attachment.contentType ?? 'image/png').split(';')[0]
			html = html.split(match[0]).join(` src="data:${contentType};base64,${attachment.data64}"`)
		}
	}

	return html
}

function resizeFrame()
{
	const doc = frame?.contentDocument
	if (!doc?.body) return
	const marginBottom = parseFloat(doc.defaultView?.getComputedStyle(doc.body).marginBottom ?? '0') || 0
	const contentBottom = Math.max(
		doc.body.getBoundingClientRect().bottom + marginBottom,
		...Array.from(doc.body.children).map(child => child.getBoundingClientRect().bottom),
	)
	frameHeight = Math.max(160, Math.ceil(contentBottom))
}

function onFrameLoad()
{
	resizeFrame()
	const doc = frame?.contentDocument
	if (!doc) return
	doc.querySelectorAll('img').forEach(img =>
	{
		if (!img.complete) img.addEventListener('load', resizeFrame, { once: true })
	})
}

function openAttachment(index: number)
{
	return () => openedAttachmentIndex.set(index)
}

function scrollToAttachments()
{
	document.getElementById('attachments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onTabKey(event: KeyboardEvent)
{
	if (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
	{
		event.preventDefault()
		view = view === 'message' ? 'headers' : 'message'
		document.getElementById(`tab-${view}`)?.focus()
	}
}

function formatTime(value: Date): string
{
	return value.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

function formatPostmarkDate(value: Date): string
{
	return value
		.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
		.replace(/\./g, '')
		.toUpperCase()
}
</script>

{#if $emlData}
	{#key $emlData}
		<section
			class={['reader', userClass].filter(Boolean).join(' ')}
			style={style}
		>
			<div class="stack">
				<div class="sheet sheet-back"></div>
				{#if attachments.length > 0}
					<div class="sheet sheet-back sheet-back-alt"></div>
				{/if}

				<article class="sheet letter">
					<div class="tabs" role="tablist" aria-label={_({ en: 'View', fr: 'Affichage' })}>
						<button
							id="tab-message"
							role="tab"
							aria-selected={view === 'message'}
							aria-controls="panel"
							tabindex={view === 'message' ? 0 : -1}
							on:click={() => view = 'message'}
							on:keydown={onTabKey}
						>
							{_({ en: 'Message', fr: 'Message' })}
						</button>
						<button
							id="tab-headers"
							role="tab"
							aria-selected={view === 'headers'}
							aria-controls="panel"
							tabindex={view === 'headers' ? 0 : -1}
							on:click={() => view = 'headers'}
							on:keydown={onTabKey}
						>
							{_({ en: 'Headers', fr: 'En-têtes' })}
						</button>
					</div>

					<div id="panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
						{#if view === 'headers'}
							<h1 class="sr-only">{$emlData.subject ?? ''}</h1>

							{#if keyHeaders.length > 0}
								<dl class="headers">
									{#each keyHeaders as [key, value]}
										<div>
											<dt>{key}</dt>
											<dd>{headerText(value)}</dd>
											<button
												class="copy"
												on:click={() => copy(headerText(value), key)}
												aria-label={`${_({ en: 'Copy', fr: 'Copier' })} ${key}`}
											>
												<span class={copied === key ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'}></span>
											</button>
										</div>
									{/each}
								</dl>
							{/if}

							<details class="all-headers">
								<summary>
									<span class="icon-[mdi--chevron-right] chevron"></span>
									{_({ en: 'All headers', fr: 'Tous les en-têtes' })}
									<span class="count tabular">{headerEntries.length}</span>
								</summary>
								<button
									class="copy-all"
									on:click={() => copy(headerEntries.map(([key, value]) => `${key}: ${headerText(value)}`).join('\n'), '*')}
								>
									<span class={copied === '*' ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'}></span>
									{copied === '*'
										? _({ en: 'Copied', fr: 'Copié' })
										: _({ en: 'Copy all headers', fr: 'Copier tous les en-têtes' })}
								</button>
								<dl class="headers">
									{#each headerEntries as [key, value], i}
										<div>
											<dt>{key}</dt>
											<dd>{headerText(value)}</dd>
											<button
												class="copy"
												on:click={() => copy(headerText(value), `${i}:${key}`)}
												aria-label={`${_({ en: 'Copy', fr: 'Copier' })} ${key}`}
											>
												<span class={copied === `${i}:${key}` ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'}></span>
											</button>
										</div>
									{/each}
								</dl>
							</details>
							<p class="sr-only" aria-live="polite">{copied ? _({ en: 'Copied', fr: 'Copié' }) : ''}</p>
						{:else}
							<header class="letterhead">
								<div class="postmark" aria-hidden="true">
									<small>{_({ en: 'Opened locally', fr: 'Ouvert en local' })}</small>
									<strong>{formatPostmarkDate(openedAt)}</strong>
									<small class="tabular">{formatTime(openedAt)}</small>
								</div>

								<h1 class="subject">
									{$emlData.subject || _({ en: '(No subject)', fr: '(Sans objet)' })}
								</h1>

								<dl class="fields">
									{#if $emlData.from}
										<div>
											<dt>{_({ en: 'From', fr: 'De' })}</dt>
											<dd>{#if addressParts($emlData.from).name}{addressParts($emlData.from).name}{' '}<span class="addr-email">&lt;{addressParts($emlData.from).email}&gt;</span>{:else}<span class="addr-email">{addressParts($emlData.from).email}</span>{/if}</dd>
										</div>
									{/if}
									{#if recipients.length > 0}
										<div>
											<dt>{_({ en: 'To', fr: 'À' })}</dt>
											<dd>
												{#each recipients as recipient, i}
													<span class="addr">{#if addressParts(recipient).name}{addressParts(recipient).name}{' '}<span class="addr-email">&lt;{addressParts(recipient).email}&gt;</span>{:else}<span class="addr-email">{addressParts(recipient).email}</span>{/if}</span>{#if i < recipients.length - 1}<span class="sep">{'; '}</span>{/if}
												{/each}
											</dd>
										</div>
									{/if}
									{#if ccRecipients.length > 0}
										<div>
											<dt>Cc</dt>
											<dd>
												{#each ccRecipients as recipient, i}
													<span class="addr">{#if addressParts(recipient).name}{addressParts(recipient).name}{' '}<span class="addr-email">&lt;{addressParts(recipient).email}&gt;</span>{:else}<span class="addr-email">{addressParts(recipient).email}</span>{/if}</span>{#if i < ccRecipients.length - 1}<span class="sep">{'; '}</span>{/if}
												{/each}
											</dd>
										</div>
									{/if}
									{#if date}
										<div>
											<dt>{_({ en: 'Date', fr: 'Date' })}</dt>
											<dd>
												<time datetime={date.toISOString()}>
													{date.toLocaleDateString(locale, { dateStyle: 'full' })}, {formatTime(date)}
												</time>
											</dd>
										</div>
									{/if}
								</dl>

								<div class="toolbar">
									{#if attachments.length > 0}
										<button class="attach-link" on:click={scrollToAttachments}>
											<span class="icon-[mdi--paperclip]"></span>
											{attachments.length}
											{attachments.length > 1
												? _({ en: 'attachments', fr: 'pièces jointes' })
												: _({ en: 'attachment', fr: 'pièce jointe' })}
										</button>
									{/if}

									{#if $emlData.html && $emlData.text}
										<div class="segmented" role="radiogroup" aria-label={_({ en: 'Show message as', fr: 'Afficher le message en' })}>
											<button role="radio" aria-checked={showHtml} on:click={() => showHtml = true}>
												{_({ en: 'Formatted', fr: 'Mis en forme' })}
											</button>
											<button role="radio" aria-checked={!showHtml} on:click={() => showHtml = false}>
												{_({ en: 'Plain text', fr: 'Texte brut' })}
											</button>
										</div>
									{/if}
								</div>
							</header>

							{#if showHtml && hasRemote}
								<div class="remote-notice" role="status">
									<span class="icon-[mdi--image-off-outline]"></span>
									<p>
										{allowRemote
											? _({ en: 'Remote images are shown. The sender\'s server can see that this email was opened.', fr: 'Les images distantes sont affichées. Le serveur de l\'expéditeur peut voir que cet e-mail a été ouvert.' })
											: _({ en: 'Remote images are blocked, so the sender can\'t tell you opened this email.', fr: 'Les images distantes sont bloquées : l\'expéditeur ne peut pas savoir que vous avez ouvert cet e-mail.' })}
									</p>
									<button on:click={() => allowRemote = !allowRemote}>
										{allowRemote
											? _({ en: 'Block again', fr: 'Bloquer à nouveau' })
											: _({ en: 'Load remote images', fr: 'Charger les images distantes' })}
									</button>
								</div>
							{/if}

							{#if $emlData.html || $emlData.text}
								<iframe
									bind:this={frame}
									class="body-frame"
									title={_({ en: 'Message body', fr: 'Corps du message' })}
									sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
									style={`height: ${frameHeight}px`}
									{srcdoc}
									on:load={onFrameLoad}
								></iframe>
							{:else}
								<p class="empty-body">
									{_({ en: 'This email has no message text.', fr: 'Cet e-mail ne contient pas de texte.' })}
								</p>
							{/if}
						{/if}
					</div>
				</article>
			</div>

			<aside class="rail" id="attachments" aria-labelledby="attachments-title">
				<h2 id="attachments-title" class="rail-title">
					{#if attachments.length > 0}
						{_({ en: 'Enclosed', fr: 'Joint' })} · {attachments.length}
						{attachments.length > 1
							? _({ en: 'attachments', fr: 'pièces jointes' })
							: _({ en: 'attachment', fr: 'pièce jointe' })}
					{:else}
						{_({ en: 'No attachments', fr: 'Aucune pièce jointe' })}
					{/if}
				</h2>

				{#if attachments.length > 0}
				<ul class="strip">
					{#each attachments as attachment, index}
						<li style={`--i: ${index}`}>
							<button
								class={`stamp stamp-${getInkKind(attachment)}`}
								disabled={isAttachmentEmpty(attachment)}
								on:click={openAttachment(index)}
							>
								<span class="stamp-face">
									<span class="stamp-ink"></span>
									<span class="stamp-name">{getAttachmentName(attachment)}</span>
									<span class="stamp-value tabular">{formatSize(getAttachmentSize(attachment))}</span>
									<span class="stamp-meta">
										{getTypeLabel(attachment)} · {getActionLabel(attachment)}
									</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
				{/if}

				{#if attachments.length > 0}
					<p class="warning">
						<span class="icon-[mdi--shield-alert-outline]"></span>
						<span>
							{_({
								en: 'Only open attachments from people you trust. They open on this device, but files can still be harmful.',
								fr: 'N\'ouvrez que les pièces jointes de personnes de confiance. Elles s\'ouvrent sur cet appareil, mais un fichier peut rester dangereux.',
							})}
						</span>
					</p>
				{/if}

				<button type="button" class="drop-hint" on:click={() => document.getElementById('eml-file-input')?.click()}>
					<span class="icon-[mdi--tray-arrow-down]"></span>
					{_({
						en: 'Drop another .eml file anywhere, or choose one',
						fr: 'Déposez un autre fichier .eml n\'importe où, ou choisissez-en un',
					})}
				</button>
			</aside>
		</section>
	{/key}
{/if}

<style lang="scss">
@reference "#tailwind.css";

.reader {
	@apply grid w-full items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px];
}

/* Paper stack */
.stack {
	@apply relative isolate;
}

.sheet {
	@apply rounded-[3px] bg-white;
}

.sheet-back {
	@apply absolute inset-0 -z-10 bg-book-200;
	transform: rotate(-1.4deg) translate(-6px, 6px);

	&.sheet-back-alt {
		@apply bg-book-300;
		transform: rotate(1.2deg) translate(8px, 4px);
		z-index: -20;
	}
}

.letter {
	@apply relative px-5 pb-6 pt-2 text-book-800 sm:px-11 sm:pb-10;
	box-shadow: 0 18px 40px rgb(0 0 0 / 0.35);
	animation: lay-down 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes lay-down {
	from { transform: translateY(18px) rotate(0.8deg); }
}

/* Tabs */
.tabs {
	@apply -mx-1 mb-6 flex gap-1 border-b border-book-200 pt-2 sm:pt-4;

	button {
		@apply cursor-pointer px-3 py-2.5 text-[15px] font-semibold text-book-500 sm:px-4;
		transition: color 150ms ease-out, box-shadow 150ms ease-out;

		&:hover {
			@apply text-book-800;
		}

		&[aria-selected="true"] {
			@apply text-book-800;
			box-shadow: inset 0 -3px 0 var(--color-ultramarine);
		}

		&:focus-visible {
			outline-color: var(--color-ultramarine);
			outline-offset: -2px;
		}
	}
}

/* Letterhead */
.letterhead {
	@apply border-b border-book-200 pb-5;
}

.postmark {
	@apply relative float-right mb-3 ml-4 flex h-24 w-24 flex-col items-center justify-center rounded-full text-center text-ultramarine sm:ml-8 sm:h-[132px] sm:w-[132px];
	min-width: 7.25rem;
	min-height: 7.25rem;
	border: 3px solid currentColor;
	transform: rotate(-8deg);
	animation: cancel 420ms 180ms cubic-bezier(0.16, 1, 0.3, 1) backwards;

	&::after {
		content: "";
		@apply hidden sm:block;
		@apply pointer-events-none absolute -left-16 right-[-12px] top-1/2 h-9 -translate-y-1/2;
		border-top: 3px solid currentColor;
		border-bottom: 3px solid currentColor;
		opacity: 0.18;
		z-index: -1;
	}

	small {
		@apply font-display text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em];
	}

	strong {
		@apply my-0.5 max-w-[90%] font-display text-base font-bold uppercase leading-[1.05] sm:text-[22px];
	}
}

@keyframes cancel {
	from { transform: rotate(-14deg) scale(1.25); opacity: 0; }
}

.subject {
	@apply mb-4 font-display text-[26px] font-semibold leading-[1.15] text-book-800 sm:text-[34px];
	text-wrap: balance;
	overflow-wrap: anywhere;
}

.fields {
	@apply text-[15px] leading-[1.65] sm:text-base;

	@media (max-width: 639.98px) {
		clear: both;
	}

	> div {
		@apply grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-2;
	}

	dt {
		@apply text-book-500;
	}

	dd {
		overflow-wrap: break-word;
		min-width: 0;
	}

	.addr-email {
		@apply inline-block max-w-full align-top;
		overflow-wrap: break-word;
	}

	.sep {
		@apply text-book-400;
	}
}

.toolbar {
	@apply clear-both mt-4 flex flex-wrap items-center justify-between gap-3;

	&:empty {
		@apply hidden;
	}
}

.attach-link {
	@apply inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-[15px] font-semibold text-ultramarine underline decoration-1 underline-offset-[0.2em];

	&:hover {
		@apply decoration-2;
	}
}

.segmented {
	@apply ml-auto inline-flex rounded bg-book-100 p-0.5;

	button {
		@apply cursor-pointer rounded-[3px] px-3 py-1.5 text-sm font-semibold text-book-500;
		transition: background-color 150ms ease-out, color 150ms ease-out;

		&:hover {
			@apply text-book-800;
		}

		&[aria-checked="true"] {
			@apply bg-white text-book-800;
			box-shadow: 0 1px 2px rgb(15 23 21 / 0.18);
		}
	}
}

.body-frame {
	@apply mt-5 block w-full border-0 bg-white;
}

.empty-body {
	@apply mt-6 text-book-500;
}

/* Headers */
.headers {
	@apply text-[15px] leading-relaxed;

	> div {
		@apply relative grid gap-x-6 border-b border-book-100 py-2.5 pr-10 sm:grid-cols-[12rem_minmax(0,1fr)];
	}

	.copy {
		@apply absolute right-0 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded text-base text-book-400 opacity-60;
		transition: opacity 150ms ease-out, color 150ms ease-out, background-color 150ms ease-out;

		&:hover, &:focus-visible {
			@apply bg-book-100 text-book-800 opacity-100;
		}
	}

	> div:hover .copy {
		@apply opacity-100;
	}

	dt {
		@apply font-semibold text-book-600;
		overflow-wrap: anywhere;
	}

	dd {
		@apply whitespace-pre-line text-book-800;
		overflow-wrap: anywhere;
	}
}

.all-headers {
	@apply mt-6;

	summary {
		@apply inline-flex cursor-pointer list-none items-center gap-1.5 rounded py-1 pr-2 font-semibold text-book-700;

		&::-webkit-details-marker {
			display: none;
		}

		&:hover {
			@apply text-book-800;
		}
	}

	.chevron {
		@apply text-lg;
		transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	&[open] .chevron {
		transform: rotate(90deg);
	}

	.count {
		@apply rounded-full bg-book-100 px-2 text-xs text-book-600;
	}

	.copy-all {
		@apply mb-2 mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded border border-book-200 px-3 py-1.5 text-sm font-semibold text-book-700;

		&:hover {
			@apply bg-book-100;
		}
	}
}

.remote-notice {
	@apply mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm bg-book-100 px-4 py-3 text-sm text-book-700;

	> span {
		@apply shrink-0 text-lg text-book-500;
	}

	p {
		@apply min-w-0 flex-1 basis-60;
	}

	button {
		@apply cursor-pointer rounded bg-white px-3 py-1.5 font-semibold text-ultramarine;
		box-shadow: 0 1px 2px rgb(15 23 21 / 0.18);

		&:hover {
			@apply bg-book-200;
		}
	}
}

/* Attachment rail */
.rail {
	@apply scroll-mt-6 lg:sticky lg:top-6;
}

.rail-title {
	@apply mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-book-300;
}

.strip {
	@apply grid gap-4 px-3.5 py-4 sm:grid-cols-2 lg:grid-cols-1;
	background: linear-gradient(rgb(214 226 232 / 0.12), rgb(214 226 232 / 0.07));
	border-top: 1px solid rgb(233 238 240 / 0.3);

	> li {
		animation: mount 420ms calc(260ms + var(--i, 0) * 70ms) cubic-bezier(0.16, 1, 0.3, 1) backwards;
	}
}

@keyframes mount {
	from { transform: translateY(10px); opacity: 0; }
}

/* Stamp: perforated edge from a dot grid, covered inside by the face */
.stamp {
	--perf: 6px;
	@apply block w-full cursor-pointer text-left;
	padding: var(--perf);
	background: radial-gradient(circle at var(--perf) var(--perf), transparent 3px, #fff 3.5px) calc(var(--perf) * -1) calc(var(--perf) * -1) / calc(var(--perf) * 2) calc(var(--perf) * 2) round;
	filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.3));
	transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), filter 180ms ease-out;

	&:hover {
		transform: translateY(-2px) rotate(-0.6deg);
		filter: drop-shadow(0 8px 12px rgb(0 0 0 / 0.4));
	}

	&:focus-visible {
		outline-offset: 4px;
	}

	&:disabled {
		@apply cursor-not-allowed;
		--ink: var(--color-book-400);
		filter: grayscale(1) drop-shadow(0 1px 2px rgb(0 0 0 / 0.25));
		opacity: 0.7;
		transform: none;

		.stamp-name {
			@apply line-through decoration-book-400;
		}
	}
}

.stamp-face {
	@apply grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 bg-white px-3 pb-3 pt-2.5;
}

.stamp-ink {
	@apply col-span-2 mb-1.5 h-1.5;
	background: var(--ink);
}

.stamp-name {
	@apply line-clamp-2 text-[15px] font-semibold leading-snug text-book-800;
	overflow-wrap: anywhere;
}

.stamp-value {
	@apply row-span-2 self-start whitespace-nowrap font-display text-[22px] font-bold leading-none;
	color: var(--ink);
}

.stamp-meta {
	@apply text-[13px] text-book-500;
}

.stamp-pdf { --ink: var(--color-carmine); }
.stamp-image { --ink: var(--color-ultramarine); }
.stamp-other { --ink: var(--color-olive); }

.warning {
	@apply mt-4 flex gap-2.5 text-sm leading-relaxed text-book-200;

	> span:first-child {
		@apply mt-0.5 shrink-0 text-lg text-carmine-light;
	}
}

.drop-hint {
	@apply mt-6 flex w-full cursor-pointer items-center gap-2 px-4 py-3.5 text-left text-sm text-book-300;
	border: 1.5px dashed var(--color-book-600);
	transition: color 150ms ease-out, border-color 150ms ease-out;

	&:hover {
		@apply text-book-100;
		border-color: var(--color-book-400);
	}

	> span {
		@apply shrink-0 text-lg;
	}
}
</style>
