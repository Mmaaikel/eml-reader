import { cn } from '~/lib/cn'

/** The round cancel stamp: the only circle in the interface. */
export function Postmark({ top, main, bottom, cancelled = false, className }: {
	top: string
	main: string
	bottom: string
	/** Adds the cancellation bars and the stamping motion */
	cancelled?: boolean
	className?: string
})
{
	return (
		<div
			aria-hidden="true"
			className={cn(
				'relative float-right mb-3 ml-4 flex size-[7.25rem] -rotate-8 flex-col items-center justify-center rounded-full border-[3px] border-current text-center text-ultramarine sm:mb-4 sm:ml-8 sm:size-[132px]',
				cancelled && [
					'animate-cancel',
					"after:pointer-events-none after:absolute after:-left-16 after:-right-3 after:top-1/2 after:-z-10 after:hidden after:h-9 after:-translate-y-1/2 after:border-y-[3px] after:border-current after:opacity-20 after:content-[''] sm:after:block",
				],
				className,
			)}
		>
			<small className="font-display text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em]">{top}</small>
			<strong className="my-0.5 max-w-[90%] font-display text-base font-bold uppercase leading-[1.05] sm:text-[22px]">{main}</strong>
			<small className="font-display text-[9px] font-semibold uppercase tracking-[0.08em] tabular-nums sm:text-[11px] sm:tracking-[0.12em]">{bottom}</small>
		</div>
	)
}
