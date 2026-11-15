import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useStore } from '@nanostores/react'
import barlow400 from '@fontsource/barlow/files/barlow-latin-400-normal.woff2?url'
import barlow600 from '@fontsource/barlow/files/barlow-latin-600-normal.woff2?url'

import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import i18n from '~/i18n'
import { cx } from '~/lib/cx'
import { formatSize } from '~/lib/fileSize'
import { openFilePicker } from '~/lib/filePicker'
import type { Email, EmailAddress, EmailAttachment } from '~/lib/email'
import {
	getAttachmentExtension,
	getInkKind,
	getPreviewKind,
	isAttachmentEmpty,
} from '~/lib/attachments'
import emlData from '~/stores/emlData'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import styles from './Reader.module.css'

type View = 'message' | 'headers'

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

function escapeHtml(text: string): string
{
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function formatTime(value: Date): string
{
	return value.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' })
}

function formatPostmarkDate(value: Date): string
{
	return value
		.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
		.replace(/\./g, '')
		.toUpperCase()
}

function attachmentName(t: TFunction, attachment: EmailAttachment): string
{
	return attachment.filename || t('attachment.untitled')
}

function typeLabel(t: TFunction, attachment: EmailAttachment): string
{
	const kind = getPreviewKind(attachment)
	if (kind === 'pdf') return 'PDF'
	if (kind === 'image') return t('attachment.image')
	if (kind === 'email') return t('attachment.email')
	return getAttachmentExtension(attachment) || t('attachment.file')
}

function actionLabel(t: TFunction, attachment: EmailAttachment): string
{
	if (isAttachmentEmpty(attachment)) return t('attachment.empty')
	const kind = getPreviewKind(attachment)
	if (kind === 'email') return t('actions.open')
	return kind === 'download'
		? t('actions.download')
		: t('actions.preview')
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

function plainTextDocument(data: Email): string
{
	const style = `<style>
		body{padding:4px 0 24px;font:17px/1.6 Barlow,ui-sans-serif,system-ui,sans-serif;color:#212c29}
		pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:inherit;max-width:72ch}
	</style>`
	return `<!doctype html><html><head><meta charset="utf-8">${frameBase(false)}${style}</head><body><pre>${escapeHtml(data.text ?? '')}</pre></body></html>`
}

function htmlDocument(data: Email, remote: boolean): string
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
		const attachment = data.attachments.find(attachment => attachment.contentId === `<${cid}>` || attachment.contentId === cid)
		if (attachment)
		{
			const contentType = attachment.contentType || 'image/png'
			html = html.split(match[0]).join(` src="data:${contentType};base64,${attachment.data64}"`)
		}
	}

	return html
}

/* Components */

function AddressLine({ address: { name, email } }: { address: EmailAddress })
{
	return name
		? <>{name}{' '}<span className={styles.addrEmail}>&lt;{email}&gt;</span></>
		: <span className={styles.addrEmail}>{email}</span>
}

function AddressList({ addresses }: { addresses: EmailAddress[] })
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
	const { t } = useTranslation()
	return (
		<button
			className={styles.copy}
			onClick={() => onCopy(text, id)}
			aria-label={t('actions.copyLabel', { label })}
		>
			<span className={copied === id ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'} />
		</button>
	)
}

function ReaderView({ data }: { data: Email })
{
	const { t } = useTranslation()
	const [view, setView] = useState<View>('message')
	const [showHtml, setShowHtml] = useState<boolean>(Boolean(data.html))
	const [allowRemote, setAllowRemote] = useState(false)
	const [frameHeight, setFrameHeight] = useState(360)
	const [copied, setCopied] = useState<string | null>(null)
	const [openedAt] = useState(() => new Date())
	const frame = useRef<HTMLIFrameElement>(null)
	const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const { attachments, to: recipients, cc: ccRecipients, date } = data
	const hasRemote = Boolean(data.html) && REMOTE_PATTERN.test(data.html ?? '')
	const headerEntries = data.headers
	const keyHeaders = KEY_HEADERS
		.map(name => headerEntries.find(([key]) => key.toLowerCase() === name.toLowerCase()))
		.filter((entry): entry is [string, string] => Boolean(entry))

	const srcDoc = useMemo(
		() => showHtml ? htmlDocument(data, allowRemote) : plainTextDocument(data),
		[data, showHtml, allowRemote],
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
		{ id: 'message', label: t('reader.message') },
		{ id: 'headers', label: t('reader.headers') },
	]

	return (
		<section className={styles.reader}>
			<div className={styles.stack}>
				<div className={cx(styles.sheet, styles.sheetBack)} />
				{attachments.length > 0 && <div className={cx(styles.sheet, styles.sheetBack, styles.sheetBackAlt)} />}

				<article className={cx(styles.sheet, styles.letter)}>
					<div className={styles.tabs} role="tablist" aria-label={t('reader.view')}>
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
												<dd>{value}</dd>
												<CopyButton text={value} id={key} label={key} copied={copied} onCopy={copy} />
											</div>
										))}
									</dl>
								)}

								<details className={styles.allHeaders}>
									<summary>
										<span className={cx('icon-[mdi--chevron-right]', styles.chevron)} />
										{t('reader.allHeaders')}
										<span className={cx(styles.count, 'tabular')}>{headerEntries.length}</span>
									</summary>
									<button
										className={styles.copyAll}
										onClick={() => copy(headerEntries.map(([key, value]) => `${key}: ${value}`).join('\n'), '*')}
									>
										<span className={copied === '*' ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'} />
										{copied === '*'
											? t('actions.copied')
											: t('actions.copyAllHeaders')}
									</button>
									<dl className={styles.headers}>
										{headerEntries.map(([key, value], i) => (
											<div key={`${i}:${key}`}>
												<dt>{key}</dt>
												<dd>{value}</dd>
												<CopyButton text={value} id={`${i}:${key}`} label={key} copied={copied} onCopy={copy} />
											</div>
										))}
									</dl>
								</details>
								<p className="sr-only" aria-live="polite">{copied ? t('actions.copied') : ''}</p>
							</>
						) : (
							<>
								<header className={styles.letterhead}>
									<div className={styles.postmark} aria-hidden="true">
										<small>{t('postmark.openedLocally')}</small>
										<strong>{formatPostmarkDate(openedAt)}</strong>
										<small className="tabular">{formatTime(openedAt)}</small>
									</div>

									<h1 className={styles.subject}>
										{data.subject || t('reader.noSubject')}
									</h1>

									<dl className={styles.fields}>
										{data.from && (
											<div>
												<dt>{t('reader.from')}</dt>
												<dd><AddressLine address={data.from} /></dd>
											</div>
										)}
										{recipients.length > 0 && (
											<div>
												<dt>{t('reader.to')}</dt>
												<dd><AddressList addresses={recipients} /></dd>
											</div>
										)}
										{ccRecipients.length > 0 && (
											<div>
												<dt>{t('reader.cc')}</dt>
												<dd><AddressList addresses={ccRecipients} /></dd>
											</div>
										)}
										{date && (
											<div>
												<dt>{t('reader.date')}</dt>
												<dd>
													<time dateTime={date.toISOString()}>
														{date.toLocaleDateString(i18n.language, { dateStyle: 'full' })}, {formatTime(date)}
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
													{t('reader.attachmentCount', { count: attachments.length })}
												</button>
											)}

											{data.html && data.text && (
												<div className={styles.segmented} role="radiogroup" aria-label={t('reader.showAs')}>
													<button
														id="format-html"
														role="radio"
														aria-checked={showHtml}
														tabIndex={showHtml ? 0 : -1}
														onClick={() => setShowHtml(true)}
														onKeyDown={onFormatKey}
													>
														{t('reader.formatted')}
													</button>
													<button
														id="format-text"
														role="radio"
														aria-checked={!showHtml}
														tabIndex={showHtml ? -1 : 0}
														onClick={() => setShowHtml(false)}
														onKeyDown={onFormatKey}
													>
														{t('reader.plainText')}
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
												? t('reader.remoteShown')
												: t('reader.remoteBlocked')}
										</p>
										<button onClick={() => setAllowRemote(!allowRemote)}>
											{allowRemote
												? t('reader.blockAgain')
												: t('reader.loadRemote')}
										</button>
									</div>
								)}

								{data.html || data.text ? (
									<iframe
										ref={frame}
										className={styles.bodyFrame}
										title={t('reader.body')}
										sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
										style={{ height: `${frameHeight}px` }}
										srcDoc={srcDoc}
										onLoad={onFrameLoad}
									/>
								) : (
									<p className={styles.emptyBody}>
										{t('reader.noBody')}
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
						? t('reader.enclosed', { count: attachments.length })
						: t('reader.noAttachments')}
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
										<span className={styles.stampName}>{attachmentName(t, attachment)}</span>
										<span className={cx(styles.stampValue, 'tabular')}>{formatSize(attachment.size)}</span>
										<span className={styles.stampMeta}>
											{typeLabel(t, attachment)} · {actionLabel(t, attachment)}
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
							{t('reader.warning')}
						</span>
					</p>
				)}

				<button type="button" className={styles.dropHint} onClick={openFilePicker}>
					<span className="icon-[mdi--tray-arrow-down]" />
					{t('drop.another')}
				</button>
			</aside>
		</section>
	)
}
