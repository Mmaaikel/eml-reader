import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import { useTranslation } from 'react-i18next'
import { FILE_INPUT_ID } from '~/lib/filePicker'
import { loadEmlFile } from '~/lib/loadEml'
import emlLoading from '~/stores/emlLoading'
import styles from './FileDrop.module.css'

async function loadFile(file: File)
{
	emlLoading.set(true)
	const ok = await loadEmlFile(file)
	emlLoading.set(false)
	if (ok) window.scrollTo({ top: 0 })
}

function hasFiles(event: DragEvent): boolean
{
	return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

/** The hidden file input plus drop-anywhere handling for the whole page. */
export function FileDrop()
{
	const { t } = useTranslation()
	const [dragging, setDragging] = useState(false)
	const depth = useRef(0)

	useEffect(() =>
	{
		function onDragEnter(event: DragEvent)
		{
			if (!hasFiles(event)) return
			event.preventDefault()
			depth.current++
			setDragging(true)
		}

		function onDragOver(event: DragEvent)
		{
			if (!hasFiles(event)) return
			event.preventDefault()
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
		}

		function onDragLeave(event: DragEvent)
		{
			if (!hasFiles(event)) return
			depth.current = Math.max(0, depth.current - 1)
			if (depth.current === 0) setDragging(false)
		}

		function onDrop(event: DragEvent)
		{
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
		return () =>
		{
			window.removeEventListener('dragenter', onDragEnter)
			window.removeEventListener('dragover', onDragOver)
			window.removeEventListener('dragleave', onDragLeave)
			window.removeEventListener('drop', onDrop)
		}
	}, [])

	async function onChange(event: ChangeEvent<HTMLInputElement>)
	{
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
				<div className={styles.overlay} aria-hidden="true">
					<div className={styles.target}>
						<span className="icon-[mdi--tray-arrow-down]" />
						<span>{t('drop.overlay')}</span>
					</div>
				</div>
			)}
		</>
	)
}
