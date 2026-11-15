import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge about the custom theme so it doesn't drop project classes as conflicts
const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			color: [
				'book-100',
				'book-200',
				'book-300',
				'book-400',
				'book-500',
				'book-600',
				'book-700',
				'book-800',
				'book-900',
				'ultramarine',
				'ultramarine-light',
				'ultramarine-dark',
				'carmine',
				'carmine-light',
				'carmine-bright',
				'carmine-wash',
				'olive',
				'olive-light',
				'glassine',
				'glassine-fade',
				'glassine-edge',
			],
			shadow: ['sheet', 'page', 'segment', 'tab'],
			font: ['display'],
		},
	},
})

/** Join class names and resolve Tailwind conflicts (later classes win). */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}
