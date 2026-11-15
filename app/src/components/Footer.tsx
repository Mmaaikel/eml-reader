import { Trans, useTranslation } from 'react-i18next'

import { site } from '~/config/site'
import styles from './Footer.module.css'

export function Footer()
{
	const { t } = useTranslation()

	return (
		<footer id="footer" className={styles.footer}>
			<section>
				<h2>
					<span className="icon-[mdi--shield-lock-outline]" />
					{t('footer.privacyTitle')}
				</h2>
				<p>{t('footer.privacy')}</p>
				<p>{t('footer.cookies')}</p>
			</section>

			<section>
				<h2>
					<span className="icon-[mdi--code-braces]" />
					{t('footer.sourceTitle')}
				</h2>
				<p>
					<Trans i18nKey="footer.source" components={{ repo: <a href={__REPOSITORY_URL__} /> }} />
					<span className={`${styles.version} tabular`}>v. {__APP_VERSION__}</span>
				</p>
				<p>
					<Trans
						i18nKey="footer.credits"
						values={{ author: site.author, original: site.originalAuthor }}
						components={{
							author: <a href={site.authorUrl} />,
							original: <a href={site.originalUrl} />,
							react: <a href="https://react.dev/" />,
						}}
					/>
				</p>
			</section>
		</footer>
	)
}
