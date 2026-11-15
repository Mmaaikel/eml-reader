import { site } from '~/config/site'
import { t } from '~/i18n'
import styles from './Footer.module.css'

export function Footer()
{
	return (
		<footer id="footer" className={styles.footer}>
			<section>
				<h2>
					<span className="icon-[mdi--shield-lock-outline]" />
					{t({ en: 'Data privacy', fr: 'Confidentialité des données' })}
				</h2>
				<p>
					{t({
						en: 'No data is collected or processed over the network or on any server. All data is processed locally in your browser, and stays on your own device.',
						fr: 'Aucune donnée n\'est collectée ou traitée sur le réseau ou sur un serveur. Toutes les données sont traitées localement dans votre navigateur et restent sur votre propre appareil.',
					})}
				</p>
				<p>
					{t({
						en: 'This website uses no cookies and does no tracking.',
						fr: 'Ce site web n\'utilise pas de cookies et ne fait pas de suivi.',
					})}
				</p>
			</section>

			<section>
				<h2>
					<span className="icon-[mdi--code-braces]" />
					{t({ en: 'Open source project', fr: 'Projet open source' })}
				</h2>
				<p>
					{t({ en: 'See the source code on', fr: 'Voir le code source sur' })}{' '}
					<a href={__REPOSITORY_URL__}>GitHub</a>
					<span className={`${styles.version} tabular`}>v. {__APP_VERSION__}</span>
				</p>
				<p>
					{t({ en: 'Made by', fr: 'Créé par' })}{' '}
					<a href={site.authorUrl}>{site.author}</a>,{' '}
					{t({ en: 'based on the original by', fr: 'd\'après l\'original de' })}{' '}
					<a href={site.originalUrl}>{site.originalAuthor}</a>.{' '}
					{t({ en: 'Built with', fr: 'Construit avec' })}{' '}
					<a href="https://react.dev/">React</a>.
				</p>
			</section>
		</footer>
	)
}
