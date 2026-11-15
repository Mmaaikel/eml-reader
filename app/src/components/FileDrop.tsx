import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import { useTranslation } from 'react-i18next'
import { FILE_INPUT_ID } from '~/lib/filePicker'
import { loadEmlFile } from '~/lib/loadEml'
import emlLoading from '~/stores/emlLoading'

async function loadFile(file: File) {
	emlLoading.set(true)
	const ok = await loadEmlFile(file)
	emlLoading.set(false)
	if (ok) window.scrollTo({ top: 0 })
}

function hasFiles(event: DragEvent): boolean {
	return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

/** The hidden file input plus drop-anywhere handling for the whole page. */
export function FileDrop() {
	const { t } = useTranslation()
	const [dragging, setDragging] = useState(false)
	const depth = useRef(0)

	useEffect(() => {
		function onDragEnter(event: DragEvent) {
			if (!hasFiles(event)) return
			event.preventDefault()
			depth.current++
			setDragging(true)
		}

		function onDragOver(event: DragEvent) {
			if (!hasFiles(event)) return
			event.preventDefault()
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
		}

		function onDragLeave(event: DragEvent) {
			if (!hasFiles(event)) return
			depth.current = Math.max(0, depth.current - 1)
			if (depth.current === 0) setDragging(false)
		}

		function onDrop(event: DragEvent) {
			if (!hasFiles(event)) return
			event.preventDefault()
			depth.current = 0
			setDragging(false)
			const file = event.dataTransfer?.files?.[0]
			if (file) void loadFile(file)
		}

		window.addEventListener('dragenter', onDragEnter)
		window.addEventListener('dragover', onDragOver)
		window.addEventListener('dragleave', onDragLeave)
		window.addEventListener('drop', onDrop)
		return () => {
			window.removeEventListener('dragenter', onDragEnter)
			window.removeEventListener('dragover', onDragOver)
			window.removeEventListener('dragleave', onDragLeave)
			window.removeEventListener('drop', onDrop)
		}
	}, [])

	async function onChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget
		const file = input.files?.[0]
		if (file) await loadFile(file)
		input.value = ''
	}

	return (
		<>
			<input
				id={FILE_INPUT_ID}
				type="file"
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
				accept=".eml,message/rfc822"
				onChange={onChange}
			/>

			{dragging && (
				<div
					aria-hidden="true"
					className="fixed inset-0 z-[900] flex animate-fade-in items-center justify-center bg-book-900/80 p-6"
				>
					<div className="flex flex-col items-center gap-3 rounded border-2 border-dashed border-ultramarine-light px-12 py-10 text-center font-display text-2xl font-semibold text-white">
						<span className="icon-[mdi--tray-arrow-down] text-5xl text-ultramarine-light" />
						<span>{t('drop.overlay')}</span>
					</div>
				</div>
			)}
		</>
	)
}
