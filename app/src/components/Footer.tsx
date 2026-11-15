import { Trans, useTranslation } from 'react-i18next'

import { site } from '~/config/site'

const link =
	'text-book-100 underline decoration-book-500 decoration-1 transition-[text-decoration-color] duration-150 hover:decoration-book-100'
const heading =
	'mb-2 flex items-center gap-2 font-display text-[15px] font-semibold uppercase tracking-[0.1em] text-book-100'

export function Footer() {
	const { t } = useTranslation()

	return (
		<footer
			id="footer"
			className="mt-auto grid gap-8 border-t border-book-700 py-10 text-sm leading-relaxed text-book-300 sm:grid-cols-2 sm:gap-16"
		>
			<section className="max-w-[60ch] space-y-1.5">
				<h2 className={heading}>
					<span className="icon-[mdi--shield-lock-outline] text-base text-book-300" />
					{t('footer.privacyTitle')}
				</h2>
				<p>{t('footer.privacy')}</p>
				<p>{t('footer.cookies')}</p>
			</section>

			<section className="max-w-[60ch] space-y-1.5">
				<h2 className={heading}>
					<span className="icon-[mdi--code-braces] text-base text-book-300" />
					{t('footer.sourceTitle')}
				</h2>
				<p>
					<Trans
						i18nKey="footer.source"
						components={{ repo: <a className={link} href={__REPOSITORY_URL__} /> }}
					/>
					<span className="ml-1 text-book-400 tabular-nums">v. {__APP_VERSION__}</span>
				</p>
				<p>
					<Trans
						i18nKey="footer.credits"
						values={{ author: site.author, original: site.originalAuthor }}
						components={{
							author: <a className={link} href={site.authorUrl} />,
							original: <a className={link} href={site.originalUrl} />,
							react: <a className={link} href="https://react.dev/" />,
						}}
					/>
				</p>
			</section>
		</footer>
	)
}
