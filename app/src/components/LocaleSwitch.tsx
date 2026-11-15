import { locales, type Locale } from '~/config/site'
import { locale as current, localeUrl } from '~/i18n'
import styles from './LocaleSwitch.module.css'

const meta: Record<Locale, { short: string, label: string }> = {
	en: { short: 'EN', label: 'English' },
	fr: { short: 'FR', label: 'Français' },
}

export function LocaleSwitch()
{
	return (
		<nav className={styles.switch} aria-label="Language / Langue">
			{locales.map(locale => (
				<a
					key={locale}
					href={localeUrl(locale)}
					className={locale === current ? `${styles.locale} ${styles.current}` : styles.locale}
					lang={locale}
					aria-current={locale === current ? 'page' : undefined}
					title={meta[locale].label}
				>
					{meta[locale].short}
				</a>
			))}
		</nav>
	)
}
