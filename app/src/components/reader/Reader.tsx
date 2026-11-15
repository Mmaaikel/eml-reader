import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useStore } from '@nanostores/react'
import { useTranslation } from 'react-i18next'

import i18n from '~/i18n'
import type { Email, EmailAddress } from '~/lib/email'
import { bareContentId, hasRemoteContent, htmlDocument, plainTextDocument } from '~/lib/messageFrame'
import { toBlob } from '~/lib/objectUrl'
import emlData from '~/stores/emlData'
import { Button } from '../ui/Button'
import { PaperStack } from '../ui/PaperStack'
import { Postmark } from '../ui/Postmark'
import { AttachmentRail } from './AttachmentRail'
import { HeadersView } from './HeadersView'

type View = 'message' | 'headers'

// Give each loaded email its own identity so the reader resets (and replays its entrance) per email
const emailKeys = new WeakMap<object, number>()
let nextEmailKey = 1

function keyFor(email: object): number {
	let key = emailKeys.get(email)
	if (key === undefined) {
		key = nextEmailKey++
		emailKeys.set(email, key)
	}
	return key
}

export function Reader() {
	const email = useStore(emlData)
	if (!email) return null
	return <ReaderView key={keyFor(email)} email={email} />
}

function formatTime(value: Date): string {
	return value.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' })
}

function formatPostmarkDate(value: Date): string {
	return value
		.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
		.replace(/\./g, '')
		.toUpperCase()
}

function AddressLine({ address: { name, email } }: { address: EmailAddress }) {
	const emailPart = (
		<span className="inline-block max-w-full align-top wrap-break-word">{name ? <>&lt;{email}&gt;</> : email}</span>
	)
	return name ? (
		<>
			{name} {emailPart}
		</>
	) : (
		emailPart
	)
}

function AddressList({ addresses }: { addresses: EmailAddress[] }) {
	return (
		<>
			{addresses.map((address, i) => (
				<span key={i}>
					<AddressLine address={address} />
					{i < addresses.length - 1 && <span className="text-book-400">{'; '}</span>}
				</span>
			))}
		</>
	)
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-2">
			<dt className="text-book-500">{label}</dt>
			<dd className="min-w-0 wrap-break-word">{children}</dd>
		</div>
	)
}

function MessageFrame({ srcDoc, title }: { srcDoc: string; title: string }) {
	const frame = useRef<HTMLIFrameElement>(null)
	const [height, setHeight] = useState(360)

	function resize() {
		const doc = frame.current?.contentDocument
		if (!doc?.body) return
		const marginBottom = parseFloat(doc.defaultView?.getComputedStyle(doc.body).marginBottom ?? '0') || 0
		const contentBottom = Math.max(
			doc.body.getBoundingClientRect().bottom + marginBottom,
			...Array.from(doc.body.children).map((child) => child.getBoundingClientRect().bottom),
		)
		setHeight(Math.max(160, Math.ceil(contentBottom)))
	}

	function onLoad() {
		resize()
		frame.current?.contentDocument?.querySelectorAll('img').forEach((img) => {
			if (!img.complete) img.addEventListener('load', resize, { once: true })
		})
	}

	return (
		<iframe
			ref={frame}
			title={title}
			sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
			className="mt-5 block w-full border-0 bg-white"
			style={{ height }}
			srcDoc={srcDoc}
			onLoad={onLoad}
		/>
	)
}

/** Blob URLs for images the HTML references by cid:, released when the email changes. */
function useInlineImages(email: Email): Map<string, string> {
	const images = useMemo(
		() =>
			new Map(
				email.attachments
					.filter((attachment) => attachment.contentId && attachment.contentType.startsWith('image/'))
					.map((attachment) => [
						bareContentId(attachment.contentId!),
						URL.createObjectURL(toBlob(attachment.content, attachment.contentType)),
					]),
			),
		[email],
	)

	useEffect(() => () => images.forEach((url) => URL.revokeObjectURL(url)), [images])

	return images
}

const tabClass =
	'cursor-pointer px-3 py-2.5 text-[15px] font-semibold text-book-500 transition-[color,box-shadow] duration-150 hover:text-book-800 aria-selected:text-book-800 aria-selected:shadow-tab focus-visible:outline-ultramarine focus-visible:-outline-offset-2 sm:px-4'
const segmentClass =
	'cursor-pointer rounded-[3px] px-3 py-1.5 text-sm font-semibold text-book-500 transition-colors duration-150 hover:text-book-800 aria-checked:bg-white aria-checked:text-book-800 aria-checked:shadow-segment'

function ReaderView({ email }: { email: Email }) {
	const { t } = useTranslation()
	const [view, setView] = useState<View>('message')
	const [showHtml, setShowHtml] = useState(Boolean(email.html))
	const [allowRemote, setAllowRemote] = useState(false)
	const [openedAt] = useState(() => new Date())

	const { attachments, date } = email
	const remote = hasRemoteContent(email)
	const inlineImages = useInlineImages(email)
	const srcDoc = useMemo(
		() => (showHtml ? htmlDocument(email, allowRemote, inlineImages) : plainTextDocument(email)),
		[email, showHtml, allowRemote, inlineImages],
	)

	function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault()
			const next: View = view === 'message' ? 'headers' : 'message'
			setView(next)
			document.getElementById(`tab-${next}`)?.focus()
		}
	}

	function onFormatKey(event: KeyboardEvent<HTMLButtonElement>) {
		if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
			event.preventDefault()
			const next = !showHtml
			setShowHtml(next)
			document.getElementById(next ? 'format-html' : 'format-text')?.focus()
		}
	}

	const tabs: { id: View; label: string }[] = [
		{ id: 'message', label: t('reader.message') },
		{ id: 'headers', label: t('reader.headers') },
	]

	return (
		<section className="grid w-full items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
			<PaperStack
				extraSheet={attachments.length > 0}
				className="animate-lay-down px-5 pt-2 pb-6 sm:px-11 sm:pb-10"
			>
				<div
					role="tablist"
					aria-label={t('reader.view')}
					className="-mx-1 mb-6 flex gap-1 border-b border-book-200 pt-2 sm:pt-4"
				>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							id={`tab-${tab.id}`}
							role="tab"
							aria-selected={view === tab.id}
							aria-controls="panel"
							tabIndex={view === tab.id ? 0 : -1}
							onClick={() => setView(tab.id)}
							onKeyDown={onTabKey}
							className={tabClass}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div id="panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
					{view === 'headers' ? (
						<HeadersView email={email} />
					) : (
						<>
							<header className="border-b border-book-200 pb-5">
								<Postmark
									cancelled
									top={t('postmark.openedLocally')}
									main={formatPostmarkDate(openedAt)}
									bottom={formatTime(openedAt)}
								/>

								<h1 className="mb-4 font-display text-[26px] leading-[1.15] font-semibold text-balance wrap-anywhere sm:text-[34px]">
									{email.subject || t('reader.noSubject')}
								</h1>

								<dl className="text-[15px] leading-[1.65] max-sm:clear-both sm:text-base">
									{email.from && (
										<Field label={t('reader.from')}>
											<AddressLine address={email.from} />
										</Field>
									)}
									{email.to.length > 0 && (
										<Field label={t('reader.to')}>
											<AddressList addresses={email.to} />
										</Field>
									)}
									{email.cc.length > 0 && (
										<Field label={t('reader.cc')}>
											<AddressList addresses={email.cc} />
										</Field>
									)}
									{date && (
										<Field label={t('reader.date')}>
											<time dateTime={date.toISOString()}>
												{date.toLocaleDateString(i18n.language, { dateStyle: 'full' })},{' '}
												{formatTime(date)}
											</time>
										</Field>
									)}
								</dl>

								{(attachments.length > 0 || (email.html && email.text)) && (
									<div className="clear-both mt-4 flex flex-wrap items-center justify-between gap-3">
										{attachments.length > 0 && (
											<button
												onClick={() =>
													document
														.getElementById('attachments')
														?.scrollIntoView({ behavior: 'smooth', block: 'start' })
												}
												className="inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-[15px] font-semibold text-ultramarine underline decoration-1 underline-offset-[0.2em] hover:decoration-2"
											>
												<span className="icon-[mdi--paperclip]" />
												{t('reader.attachmentCount', { count: attachments.length })}
											</button>
										)}

										{email.html && email.text && (
											<div
												role="radiogroup"
												aria-label={t('reader.showAs')}
												className="ml-auto inline-flex rounded bg-book-100 p-0.5"
											>
												<button
													id="format-html"
													role="radio"
													aria-checked={showHtml}
													tabIndex={showHtml ? 0 : -1}
													onClick={() => setShowHtml(true)}
													onKeyDown={onFormatKey}
													className={segmentClass}
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
													className={segmentClass}
												>
													{t('reader.plainText')}
												</button>
											</div>
										)}
									</div>
								)}
							</header>

							{showHtml && remote && (
								<div
									role="status"
									className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded bg-book-100 px-4 py-3 text-sm text-book-700"
								>
									<span className="icon-[mdi--image-off-outline] shrink-0 text-lg text-book-500" />
									<p className="min-w-0 flex-1 basis-60">
										{allowRemote ? t('reader.remoteShown') : t('reader.remoteBlocked')}
									</p>
									<Button variant="raised" size="sm" onClick={() => setAllowRemote(!allowRemote)}>
										{allowRemote ? t('reader.blockAgain') : t('reader.loadRemote')}
									</Button>
								</div>
							)}

							{email.html || email.text ? (
								<MessageFrame srcDoc={srcDoc} title={t('reader.body')} />
							) : (
								<p className="mt-6 text-book-500">{t('reader.noBody')}</p>
							)}
						</>
					)}
				</div>
			</PaperStack>

			<AttachmentRail attachments={attachments} />
		</section>
	)
}
