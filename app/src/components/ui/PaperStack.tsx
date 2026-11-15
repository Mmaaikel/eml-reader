import type { ReactNode } from 'react'

import { cn } from '~/lib/cn'

/** The letter on top of a small stack of sheets; one more sheet when there are attachments. */
export function PaperStack({
	extraSheet = false,
	className,
	children,
}: {
	extraSheet?: boolean
	className?: string
	children: ReactNode
}) {
	return (
		<div className="relative isolate">
			<div className="absolute inset-0 -z-10 translate-x-[-6px] translate-y-[6px] -rotate-[1.4deg] rounded-[3px] bg-book-200" />
			{extraSheet && (
				<div className="absolute inset-0 -z-20 translate-x-[8px] translate-y-[4px] rotate-[1.2deg] rounded-[3px] bg-book-300" />
			)}
			<div className={cn('relative rounded-[3px] bg-white text-book-800 shadow-sheet', className)}>
				{children}
			</div>
		</div>
	)
}
