<script lang="ts">
import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'
import emlData from '~/stores/emlData'

let locale: Locales | undefined = undefined
export { locale }

const _ = i18nFactory(locale)
</script>

{#if $emlData}
	<button type="button" class="open-btn" on:click={() => document.getElementById('eml-file-input')?.click()}>
		<span class="icon-[mdi--file-upload-outline]"></span>
		<span class="label-long">{_({ en: 'Open another file', fr: 'Ouvrir un autre fichier' })}</span>
		<span class="label-short">{_({ en: 'Open', fr: 'Ouvrir' })}</span>
	</button>
{/if}

<style lang="scss">
@reference "#tailwind.css";

.open-btn {
	@apply inline-flex cursor-pointer items-center gap-2 rounded bg-white px-3.5 py-2 text-[15px] font-semibold text-book-800;
	transition: background-color 150ms ease-out;

	&:hover {
		@apply bg-book-100;
	}

	> span:first-child {
		@apply text-lg;
	}
}

.label-long {
	@apply hidden sm:inline;
}

.label-short {
	@apply sm:hidden;
}

</style>
