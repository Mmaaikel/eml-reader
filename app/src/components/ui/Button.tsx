import type { ButtonHTMLAttributes } from 'react'

import { cn } from '~/lib/cn'

const variants = {
	/** Ultramarine action, on paper or on the dark ground */
	primary: 'bg-ultramarine text-white hover:bg-ultramarine-dark',
	/** Outlined action on the dark ground */
	secondary: 'border border-book-500 text-book-100 hover:bg-book-700',
	/** White button on the dark ground (top bar) */
	paper: 'bg-white text-book-800 hover:bg-book-100',
	/** Raised white button inside a pale band on paper */
	raised: 'bg-white text-ultramarine shadow-segment hover:bg-book-200',
	/** Outlined action on paper */
	outline: 'border border-book-200 text-book-700 hover:bg-book-100',
}

const sizes = {
	sm: 'gap-1.5 px-3 py-1.5 text-sm',
	md: 'gap-2 px-5 py-2.5 text-base',
	lg: 'gap-2 px-5 py-3 text-lg',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: keyof typeof variants
	size?: keyof typeof sizes
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps)
{
	return (
		<button
			type={type}
			className={cn(
				'inline-flex cursor-pointer items-center rounded font-semibold transition-[background-color,transform] duration-150 ease-out',
				'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 aria-busy:cursor-progress aria-busy:opacity-80',
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		/>
	)
}
