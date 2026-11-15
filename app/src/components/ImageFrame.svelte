<script lang="ts">
import { createEventDispatcher } from 'svelte'
import { formatBase64Size } from '~/lib/fileSize'

import type { Locales } from '~/i18n/type.d.ts'
import { i18nFactory } from '~/i18n'

// Props
let userClass: string | undefined = undefined
let style: string | undefined = undefined
let locale: Locales | undefined = undefined
let filename: string | undefined = undefined
let contentType: string | undefined = undefined
let data64: string | undefined = undefined
export {
	userClass as class,
	style,
	locale,
	filename,
	contentType,
	data64,
}

const _ = i18nFactory(locale)

let contentWrapper: HTMLDivElement

async function downloadImage()
{
	if (!data64)
	{
		return
	}

	const a = document.createElement('a')
	a.href = `data:${contentType};base64,${data64}`
	a.download = filename ?? 'image'
	a.click()
	a.remove()
}

const dispatch = createEventDispatcher()

async function closePdfFrame()
{
	dispatch('close')
}
</script>

<div
	class={Array.from(new Set([
		'wrapper',
		...(userClass ? userClass.split(' ') : []),
	])).join(' ')}
	style={style}
>

	<div class="image-nav">
		<div class="image-nav-section">
			<p>{filename}</p>
		</div>
		<!-- <div class="image-nav-section">
			<p class="min-width-1">
				<span class="sr-only">Zoom</span>
				{scale ? `${Math.round(scale * 100)}%` : '...'}
			</p>
			<div class="buttons-group">
				<button disabled>
					<span class="sr-only">Zoom Out</span>
					<span class="icon icon-[mdi--magnify-minus]"></span>
				</button>
				<button disabled>
					<span class="sr-only">Zoom In</span>
					<span class="icon icon-[mdi--magnify-plus]"></span>
				</button>
				<button class={scaleFit ? 'active' : undefined} disabled>
					<span class="sr-only">Fit screen</span>
					<span class="icon icon-[mdi--fit-to-screen]"></span>
				</button>
			</div>
		</div> -->
		<div class="image-nav-section image-nav-section-end sm-small">
			<p class="sm-hidden">
				<span class="icon icon-[mdi--database] align-icon-inline"></span>
				{formatBase64Size(data64)}
			</p>
			<button
				on:click|preventDefault={downloadImage}
			>
				<span class="sr-only">
					{_({
						en: 'Download',
						fr: 'Télécharger',
					})}
				</span>
				<span class="icon icon-[mdi--download]"></span>
			</button>
			<button
				on:click|preventDefault={closePdfFrame}
					data-autofocus
			>
				<span class="icon icon-[mdi--close]"></span>
				<span class="sr-only">
					{_({
						en: 'Close',
						fr: 'Fermer',
					})}
				</span>
			</button>
		</div>
	</div>

	<div
		class="image-content"
		bind:this={contentWrapper}
	>
		<img
			class="max-h-full max-w-full object-contain"
			src={`data:${contentType};base64,${data64}`}
			alt={filename}
		/>
	</div>

</div>

<style lang="scss">
@reference "#tailwind.css";

.wrapper
{
	@apply
		flex
		flex-col
		items-center
		w-full
		h-full
		overflow-hidden
		;

	> * {
		@apply
			w-full
			shrink-0
			;
	}

	> .image-nav,
	> .image-footer {
		@apply
			bg-book-900
			grid
			grid-flow-col
			auto-cols-fr
			gap-4
			h-12
			px-4
			text-book-100
			;

		.image-nav-section {
			@apply
				col-span-3
				flex
				items-center
				justify-center
				gap-2
				;

			&.sm-small {
				@apply
					col-span-2
					;
			}

			&.sm-xsmall {
				@apply
					col-span-1
					;
			}

			&:has(.image-nav-section) {
				@apply
					gap-4
					;
			}

			&.image-nav-section-start {
				@apply
					justify-start
					;
			}

			&.image-nav-section-end {
				@apply
					justify-end
					;
			}

			> p {
				@apply
					truncate
					;

				&.min-width-1 {
					@apply
						min-w-10
						;
				}

				&.min-width-2 {
					@apply
						min-w-20
						;
				}
			}
		}

		.buttons-group {
			@apply
				flex
				items-center
				justify-center
				;
		}

		button {
			@apply
				flex
				items-center
				justify-center
				min-w-10
				h-10
				;

			&:disabled {
				@apply
					cursor-not-allowed
					opacity-50
					;
			}

			&:not(:disabled):hover {
				@apply
					bg-book-700
					;
			}

			&:not(:disabled):active, &.active {
				@apply
					bg-book-600
					;

				&:disabled {
					@apply
						bg-book-700
						;
				}
			}
		}
	}

	@media (max-width: 899.98px)
	{
		> .image-nav {
			> .image-nav-section {
				&:has(.image-nav-section) {
					@apply
						flex-col
						gap-0
						;

					&.image-nav-section-start {
						@apply
							items-start
							justify-center
							;
					}

					&.image-nav-section-end {
						@apply
							items-end
							justify-center
							;
					}
				}
			}
		}
	}

	@media (max-width: 599.98px)
	{
		> .image-nav {
			.image-nav-section.sm-small {
				@apply
					col-span-1
					;
			}

			.sm-hidden {
				@apply
					hidden
					;
			}
		}
	}

	> .image-content {
		@apply
			relative
			bg-book-700
			min-h-64
			grow
			flex
			items-center
			justify-center
			mx-auto
			overflow-y-auto
			;

		background-image: repeating-conic-gradient(var(--color-book-600) 0% 25%, var(--color-book-700) 0% 50%);
		background-size: 20px 20px;

		> .text-layer {
			@apply
				text-transparent
				;

			&, > :global(*) {
				@apply
					absolute
					;
			}

			> :global(br) {
				@apply
					hidden
					;
			}
		}
	}

	> .image-footer {
		@apply
			flex
			items-center
			justify-around
			items-stretch
			;
	}
}
</style>
