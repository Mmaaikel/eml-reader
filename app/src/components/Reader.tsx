import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useStore } from '@nanostores/react'
import barlow400 from '@fontsource/barlow/files/barlow-latin-400-normal.woff2?url'
import barlow600 from '@fontsource/barlow/files/barlow-latin-600-normal.woff2?url'

import { locale, t } from '~/i18n'
import { cx } from '~/lib/cx'
import { formatSize } from '~/lib/fileSize'
import { openFilePicker } from '~/lib/filePicker'
import {
	getAttachmentExtension,
	getAttachmentFileName,
	getAttachmentSize,
	getInkKind,
	getPreviewKind,
	isAttachmentEmpty,
} from '~/lib/attachments'
import emlData from '~/stores/emlData'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import styles from './Reader.module.css'

type View = 'message' | 'headers'
type Address = { name: string, email: string }

const REMOTE_PATTERN = /(?:src|background|href)\s*=\s*["']?\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i
const KEY_HEADERS = ['From', 'To', 'Cc', 'Reply-To', 'Subject', 'Date', 'Message-ID', 'Return-Path']

// Give each loaded email its own identity so the reader resets (and replays its entrance) per email
const emailKeys = new WeakMap<object, number>()
let nextEmailKey = 1

function keyFor(data: object): number
{
	let key = emailKeys.get(data)
	if (key === undefined)
	{
		key = nextEmailKey++
		emailKeys.set(data, key)
	}
	return key
}

export function Reader()
{
	const data = useStore(emlData)
	if (!data) return null
	return <ReaderView key={keyFor(data)} data={data} />
}

const inkClass = {
	pdf: styles.stampPdf,
	image: styles.stampImage,
	other: styles.stampOther,
}

/* Helpers */

function toList(value: any): any[]
{
	if (!value) return []
	return Array.isArray(value) ? value : [value]
}

function addressParts(address: any): Address
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

function headerText(value: any): string
{
	return Array.isArray(value) ? value.join('\n') : String(value ?? '')
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

function attachmentName(attachment: any): string
{
	return getAttachmentFileName(attachment) || t({ en: 'Untitled file', fr: 'Fichier sans nom' })
}

function typeLabel(attachment: any): string
{
	const kind = getPreviewKind(attachment)
	if (kind === 'pdf') return 'PDF'
	if (kind === 'image') return t({ en: 'Image', fr: 'Image' })
	if (kind === 'email') return t({ en: 'Email', fr: 'E-mail' })
	return getAttachmentExtension(attachment) || t({ en: 'File', fr: 'Fichier' })
}

function actionLabel(attachment: any): string
{
	if (isAttachmentEmpty(attachment)) return t({ en: 'Empty file', fr: 'Fichier vide' })
	const kind = getPreviewKind(attachment)
	if (kind === 'email') return t({ en: 'Open', fr: 'Ouvrir' })
	return kind === 'download'
		? t({ en: 'Download', fr: 'Télécharger' })
		: t({ en: 'Preview', fr: 'Aperçu' })
}

function attachmentCount(count: number): string
{
	return count > 1
		? t({ en: 'attachments', fr: 'pièces jointes' })
		: t({ en: 'attachment', fr: 'pièce jointe' })
}

/** Head for the message frame: blocks network content unless allowed, sets fonts and margins. */
function frameBase(remote: boolean): string
{
	const origin = location.origin
	const net = remote ? ' http: https:' : ''
	const csp = `default-src 'none'; style-src 'unsafe-inline'${net}; img-src data:${net}; font-src data: ${origin}${net}; media-src data:${net}`
	return `<meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank"><style>
		@font-face{font-family:Barlow;font-weight:400;font-display:swap;src:url(${new URL(barlow400, origin).href}) format('woff2')}
		@font-face{font-family:Barlow;font-weight:600;font-display:swap;src:url(${new URL(barlow600, origin).href}) format('woff2')}
		body{margin:0}
		${remote ? '' : 'img[src^="http:"],img[src^="https:"],img[src^="//"]{display:none!important}'}
	</style>`
}

function plainTextDocument(data: Record<string, any>): string
{
	const style = `<style>
		body{padding:4px 0 24px;font:17px/1.6 Barlow,ui-sans-serif,system-ui,sans-serif;color:#212c29}
		pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:inherit;max-width:72ch}
	</style>`
	return `<!doctype html><html><head><meta charset="utf-8">${frameBase(false)}${style}</head><body><pre>${escapeHtml(String(data.text ?? ''))}</pre></body></html>`
}

function htmlDocument(data: Record<string, any>, attachments: any[], remote: boolean): string
{
	if (!data.html)
	{
		return plainTextDocument(data)
	}

	let html: string = data.html

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
		const attachment = attachments.find(attachment => attachment.id === `<${cid}>`)
		if (attachment)
		{
			const contentType = String(attachment.contentType ?? 'image/png').split(';')[0]
			html = html.split(match[0]).join(` src="data:${contentType};base64,${attachment.data64}"`)
		}
	}

	return html
}

/* Components */

function AddressLine({ address }: { address: any })
{
	const { name, email } = addressParts(address)
	return name
		? <>{name}{' '}<span className={styles.addrEmail}>&lt;{email}&gt;</span></>
		: <span className={styles.addrEmail}>{email}</span>
}

function AddressList({ addresses }: { addresses: any[] })
{
	return (
		<>
			{addresses.map((address, i) => (
				<span key={i}>
					<span className={styles.addr}><AddressLine address={address} /></span>
					{i < addresses.length - 1 && <span className={styles.sep}>{'; '}</span>}
				</span>
			))}
		</>
	)
}

function CopyButton({ text, id, label, copied, onCopy }: {
	text: string
	id: string
	label: string
	copied: string | null
	onCopy: (text: string, id: string) => void
})
{
	return (
		<button
			className={styles.copy}
			onClick={() => onCopy(text, id)}
			aria-label={`${t({ en: 'Copy', fr: 'Copier' })} ${label}`}
		>
			<span className={copied === id ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'} />
		</button>
	)
}

function ReaderView({ data }: { data: Record<string, any> })
{
	const [view, setView] = useState<View>('message')
	const [showHtml, setShowHtml] = useState<boolean>(Boolean(data.html))
	const [allowRemote, setAllowRemote] = useState(false)
	const [frameHeight, setFrameHeight] = useState(360)
	const [copied, setCopied] = useState<string | null>(null)
	const [openedAt] = useState(() => new Date())
	const frame = useRef<HTMLIFrameElement>(null)
	const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const attachments = (data.attachments ?? []) as any[]
	const recipients = toList(data.to)
	const ccRecipients = toList(data.cc)
	const date = data.date instanceof Date && !isNaN(data.date.getTime()) ? data.date as Date : null
	const hasRemote = Boolean(data.html) && REMOTE_PATTERN.test(String(data.html ?? ''))
	const headerEntries = Object.entries(data.headers ?? {}) as [string, any][]
	const keyHeaders = KEY_HEADERS
		.map(name => headerEntries.find(([key]) => key.toLowerCase() === name.toLowerCase()))
		.filter((entry): entry is [string, any] => Boolean(entry))

	const srcDoc = useMemo(
		() => showHtml ? htmlDocument(data, attachments, allowRemote) : plainTextDocument(data),
		[data, showHtml, allowRemote], // eslint-disable-line react-hooks/exhaustive-deps
	)

	useEffect(() => () =>
	{
		if (copiedTimer.current) clearTimeout(copiedTimer.current)
	}, [])

	function resizeFrame()
	{
		const doc = frame.current?.contentDocument
		if (!doc?.body) return
		const marginBottom = parseFloat(doc.defaultView?.getComputedStyle(doc.body).marginBottom ?? '0') || 0
		const contentBottom = Math.max(
			doc.body.getBoundingClientRect().bottom + marginBottom,
			...Array.from(doc.body.children).map(child => child.getBoundingClientRect().bottom),
		)
		setFrameHeight(Math.max(160, Math.ceil(contentBottom)))
	}

	function onFrameLoad()
	{
		resizeFrame()
		frame.current?.contentDocument?.querySelectorAll('img').forEach(img =>
		{
			if (!img.complete) img.addEventListener('load', resizeFrame, { once: true })
		})
	}

	async function copy(text: string, id: string)
	{
		try
		{
			await navigator.clipboard.writeText(text)
			setCopied(id)
			if (copiedTimer.current) clearTimeout(copiedTimer.current)
			copiedTimer.current = setTimeout(() => setCopied(null), 1600)
		}
		catch
		{
			setCopied(null)
		}
	}

	function onTabKey(event: KeyboardEvent<HTMLButtonElement>)
	{
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
		{
			event.preventDefault()
			const next: View = view === 'message' ? 'headers' : 'message'
			setView(next)
			document.getElementById(`tab-${next}`)?.focus()
		}
	}

	function onFormatKey(event: KeyboardEvent<HTMLButtonElement>)
	{
		if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key))
		{
			event.preventDefault()
			const next = !showHtml
			setShowHtml(next)
			document.getElementById(next ? 'format-html' : 'format-text')?.focus()
		}
	}

	function scrollToAttachments()
	{
		document.getElementById('attachments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	const tabs: { id: View, label: string }[] = [
		{ id: 'message', label: t({ en: 'Message', fr: 'Message' }) },
		{ id: 'headers', label: t({ en: 'Headers', fr: 'En-têtes' }) },
	]

	return (
		<section className={styles.reader}>
			<div className={styles.stack}>
				<div className={cx(styles.sheet, styles.sheetBack)} />
				{attachments.length > 0 && <div className={cx(styles.sheet, styles.sheetBack, styles.sheetBackAlt)} />}

				<article className={cx(styles.sheet, styles.letter)}>
					<div className={styles.tabs} role="tablist" aria-label={t({ en: 'View', fr: 'Affichage' })}>
						{tabs.map(tab => (
							<button
								key={tab.id}
								id={`tab-${tab.id}`}
								role="tab"
								aria-selected={view === tab.id}
								aria-controls="panel"
								tabIndex={view === tab.id ? 0 : -1}
								onClick={() => setView(tab.id)}
								onKeyDown={onTabKey}
							>
								{tab.label}
							</button>
						))}
					</div>

					<div id="panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
						{view === 'headers' ? (
							<>
								<h1 className="sr-only">{data.subject ?? ''}</h1>

								{keyHeaders.length > 0 && (
									<dl className={styles.headers}>
										{keyHeaders.map(([key, value]) => (
											<div key={key}>
												<dt>{key}</dt>
												<dd>{headerText(value)}</dd>
												<CopyButton text={headerText(value)} id={key} label={key} copied={copied} onCopy={copy} />
											</div>
										))}
									</dl>
								)}

								<details className={styles.allHeaders}>
									<summary>
										<span className={cx('icon-[mdi--chevron-right]', styles.chevron)} />
										{t({ en: 'All headers', fr: 'Tous les en-têtes' })}
										<span className={cx(styles.count, 'tabular')}>{headerEntries.length}</span>
									</summary>
									<button
										className={styles.copyAll}
										onClick={() => copy(headerEntries.map(([key, value]) => `${key}: ${headerText(value)}`).join('\n'), '*')}
									>
										<span className={copied === '*' ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'} />
										{copied === '*'
											? t({ en: 'Copied', fr: 'Copié' })
											: t({ en: 'Copy all headers', fr: 'Copier tous les en-têtes' })}
									</button>
									<dl className={styles.headers}>
										{headerEntries.map(([key, value], i) => (
											<div key={`${i}:${key}`}>
												<dt>{key}</dt>
												<dd>{headerText(value)}</dd>
												<CopyButton text={headerText(value)} id={`${i}:${key}`} label={key} copied={copied} onCopy={copy} />
											</div>
										))}
									</dl>
								</details>
								<p className="sr-only" aria-live="polite">{copied ? t({ en: 'Copied', fr: 'Copié' }) : ''}</p>
							</>
						) : (
							<>
								<header className={styles.letterhead}>
									<div className={styles.postmark} aria-hidden="true">
										<small>{t({ en: 'Opened locally', fr: 'Ouvert en local' })}</small>
										<strong>{formatPostmarkDate(openedAt)}</strong>
										<small className="tabular">{formatTime(openedAt)}</small>
									</div>

									<h1 className={styles.subject}>
										{data.subject || t({ en: '(No subject)', fr: '(Sans objet)' })}
									</h1>

									<dl className={styles.fields}>
										{data.from && (
											<div>
												<dt>{t({ en: 'From', fr: 'De' })}</dt>
												<dd><AddressLine address={data.from} /></dd>
											</div>
										)}
										{recipients.length > 0 && (
											<div>
												<dt>{t({ en: 'To', fr: 'À' })}</dt>
												<dd><AddressList addresses={recipients} /></dd>
											</div>
										)}
										{ccRecipients.length > 0 && (
											<div>
												<dt>Cc</dt>
												<dd><AddressList addresses={ccRecipients} /></dd>
											</div>
										)}
										{date && (
											<div>
												<dt>{t({ en: 'Date', fr: 'Date' })}</dt>
												<dd>
													<time dateTime={date.toISOString()}>
														{date.toLocaleDateString(locale, { dateStyle: 'full' })}, {formatTime(date)}
													</time>
												</dd>
											</div>
										)}
									</dl>

									{(attachments.length > 0 || (data.html && data.text)) && (
										<div className={styles.toolbar}>
											{attachments.length > 0 && (
												<button className={styles.attachLink} onClick={scrollToAttachments}>
													<span className="icon-[mdi--paperclip]" />
													{attachments.length} {attachmentCount(attachments.length)}
												</button>
											)}

											{data.html && data.text && (
												<div className={styles.segmented} role="radiogroup" aria-label={t({ en: 'Show message as', fr: 'Afficher le message en' })}>
													<button
														id="format-html"
														role="radio"
														aria-checked={showHtml}
														tabIndex={showHtml ? 0 : -1}
														onClick={() => setShowHtml(true)}
														onKeyDown={onFormatKey}
													>
														{t({ en: 'Formatted', fr: 'Mis en forme' })}
													</button>
													<button
														id="format-text"
														role="radio"
														aria-checked={!showHtml}
														tabIndex={showHtml ? -1 : 0}
														onClick={() => setShowHtml(false)}
														onKeyDown={onFormatKey}
													>
														{t({ en: 'Plain text', fr: 'Texte brut' })}
													</button>
												</div>
											)}
										</div>
									)}
								</header>

								{showHtml && hasRemote && (
									<div className={styles.remoteNotice} role="status">
										<span className="icon-[mdi--image-off-outline]" />
										<p>
											{allowRemote
												? t({ en: 'Remote images are shown. The sender\'s server can see that this email was opened.', fr: 'Les images distantes sont affichées. Le serveur de l\'expéditeur peut voir que cet e-mail a été ouvert.' })
												: t({ en: 'Remote images are blocked, so the sender can\'t tell you opened this email.', fr: 'Les images distantes sont bloquées : l\'expéditeur ne peut pas savoir que vous avez ouvert cet e-mail.' })}
										</p>
										<button onClick={() => setAllowRemote(!allowRemote)}>
											{allowRemote
												? t({ en: 'Block again', fr: 'Bloquer à nouveau' })
												: t({ en: 'Load remote images', fr: 'Charger les images distantes' })}
										</button>
									</div>
								)}

								{data.html || data.text ? (
									<iframe
										ref={frame}
										className={styles.bodyFrame}
										title={t({ en: 'Message body', fr: 'Corps du message' })}
										sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
										style={{ height: `${frameHeight}px` }}
										srcDoc={srcDoc}
										onLoad={onFrameLoad}
									/>
								) : (
									<p className={styles.emptyBody}>
										{t({ en: 'This email has no message text.', fr: 'Cet e-mail ne contient pas de texte.' })}
									</p>
								)}
							</>
						)}
					</div>
				</article>
			</div>

			<aside className={styles.rail} id="attachments" aria-labelledby="attachments-title">
				<h2 id="attachments-title" className={styles.railTitle}>
					{attachments.length > 0
						? `${t({ en: 'Enclosed', fr: 'Joint' })} · ${attachments.length} ${attachmentCount(attachments.length)}`
						: t({ en: 'No attachments', fr: 'Aucune pièce jointe' })}
				</h2>

				{attachments.length > 0 && (
					<ul className={styles.strip}>
						{attachments.map((attachment, index) => (
							<li key={index} style={{ '--i': index } as CSSProperties}>
								<button
									className={cx(styles.stamp, inkClass[getInkKind(attachment)])}
									data-stamp
									disabled={isAttachmentEmpty(attachment)}
									onClick={() => openedAttachmentIndex.set(index)}
								>
									<span className={styles.stampFace}>
										<span className={styles.stampInk} />
										<span className={styles.stampName}>{attachmentName(attachment)}</span>
										<span className={cx(styles.stampValue, 'tabular')}>{formatSize(getAttachmentSize(attachment))}</span>
										<span className={styles.stampMeta}>
											{typeLabel(attachment)} · {actionLabel(attachment)}
										</span>
									</span>
								</button>
							</li>
						))}
					</ul>
				)}

				{attachments.length > 0 && (
					<p className={styles.warning}>
						<span className="icon-[mdi--shield-alert-outline]" />
						<span>
							{t({
								en: 'Only open attachments from people you trust. They open on this device, but files can still be harmful.',
								fr: 'N\'ouvrez que les pièces jointes de personnes de confiance. Elles s\'ouvrent sur cet appareil, mais un fichier peut rester dangereux.',
							})}
						</span>
					</p>
				)}

				<button type="button" className={styles.dropHint} onClick={openFilePicker}>
					<span className="icon-[mdi--tray-arrow-down]" />
					{t({
						en: 'Drop another .eml file anywhere, or choose one',
						fr: 'Déposez un autre fichier .eml n\'importe où, ou choisissez-en un',
					})}
				</button>
			</aside>
		</section>
	)
}
