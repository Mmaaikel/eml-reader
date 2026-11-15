import type { InkKind } from '~/lib/attachments'

/** One engraved ink per kind of attachment, set as --ink and used everywhere that kind appears */
export const inkClass: Record<InkKind, string> = {
	pdf: '[--ink:var(--color-carmine)]',
	image: '[--ink:var(--color-ultramarine)]',
	other: '[--ink:var(--color-olive)]',
}
