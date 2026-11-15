import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Email } from '~/lib/email'
import { Button } from '../ui/Button'

const KEY_HEADERS = ['From', 'To', 'Cc', 'Reply-To', 'Subject', 'Date', 'Message-ID', 'Return-Path']

function useCopy() {
	const [copied, setCopied] = useState<string | null>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current)
		},
		[],
	)

	async function copy(text: string, id: string) {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(id)
			if (timer.current) clearTimeout(timer.current)
			timer.current = setTimeout(() => setCopied(null), 1600)
		} catch {
			setCopied(null)
		}
	}

	return { copied, copy }
}

function HeaderList({
	entries,
	idPrefix,
	copied,
	onCopy,
}: {
	entries: [string, string][]
	idPrefix: string
	copied: string | null
	onCopy: (text: string, id: string) => void
}) {
	const { t } = useTranslation()

	return (
		<dl className="text-[15px] leading-relaxed">
			{entries.map(([key, value], i) => {
				const id = `${idPrefix}${i}`
				return (
					<div
						key={id}
						className="group relative grid gap-x-6 border-b border-book-100 py-2.5 pr-10 sm:grid-cols-[12rem_minmax(0,1fr)]"
					>
						<dt className="font-semibold wrap-anywhere text-book-600">{key}</dt>
						<dd className="wrap-anywhere whitespace-pre-line text-book-800">{value}</dd>
						<button
							onClick={() => onCopy(value, id)}
							aria-label={t('actions.copyLabel', { label: key })}
							className="absolute top-2 right-0 flex size-8 cursor-pointer items-center justify-center rounded text-base text-book-400 opacity-60 transition duration-150 group-hover:opacity-100 hover:bg-book-100 hover:text-book-800 focus-visible:bg-book-100 focus-visible:text-book-800 focus-visible:opacity-100"
						>
							<span className={copied === id ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'} />
						</button>
					</div>
				)
			})}
		</dl>
	)
}

export function HeadersView({ email }: { email: Email }) {
	const { t } = useTranslation()
	const { copied, copy } = useCopy()

	const keyHeaders = KEY_HEADERS.map((name) =>
		email.headers.find(([key]) => key.toLowerCase() === name.toLowerCase()),
	).filter((entry): entry is [string, string] => Boolean(entry))

	return (
		<>
			<h1 className="sr-only">{email.subject}</h1>

			{keyHeaders.length > 0 && <HeaderList entries={keyHeaders} idPrefix="key:" copied={copied} onCopy={copy} />}

			<details className="group/all mt-6">
				<summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded py-1 pr-2 font-semibold text-book-700 hover:text-book-800 [&::-webkit-details-marker]:hidden">
					<span className="icon-[mdi--chevron-right] text-lg transition-transform duration-180 ease-out-expo group-open/all:rotate-90" />
					{t('reader.allHeaders')}
					<span className="rounded-sm bg-book-100 px-1.5 text-xs text-book-600 tabular-nums">
						{email.headers.length}
					</span>
				</summary>

				<Button
					variant="outline"
					size="sm"
					className="mt-3 mb-2"
					onClick={() => copy(email.headers.map(([key, value]) => `${key}: ${value}`).join('\n'), 'all')}
				>
					<span className={copied === 'all' ? 'icon-[mdi--check]' : 'icon-[mdi--content-copy]'} />
					{copied === 'all' ? t('actions.copied') : t('actions.copyAllHeaders')}
				</Button>

				<HeaderList entries={email.headers} idPrefix="all:" copied={copied} onCopy={copy} />
			</details>

			<p className="sr-only" aria-live="polite">
				{copied ? t('actions.copied') : ''}
			</p>
		</>
	)
}
