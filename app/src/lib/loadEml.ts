import { readEml } from 'eml-parse-js'

import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import emlData from '~/stores/emlData'
import emlError from '~/stores/emlError'

/** Text parts arrive as strings without base64; give every attachment data64. */
function normalizeAttachments(data: any)
{
	for (const attachment of data?.attachments ?? [])
	{
		if (!attachment.data64 && typeof attachment.data === 'string' && attachment.data.length > 0)
		{
			const bytes = new TextEncoder().encode(attachment.data)
			let binary = ''
			for (let i = 0; i < bytes.length; i += 0x8000)
			{
				binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
			}
			attachment.data64 = btoa(binary)
		}
	}
}

function fail(message: string)
{
	emlError.set(message)
	openedAttachmentIndex.set(null)
	emlData.set(null)
}

/** Parse raw .eml text and put it in the reader. Resolves true on success. */
export function loadEmlText(content: string): Promise<boolean>
{
	return new Promise(resolve =>
	{
		readEml(content, (error: any, data: any) =>
		{
			if (error)
			{
				fail(String(error))
				resolve(false)
				return
			}

			if (
				!data ||
				Object.keys(data.headers ?? {}).length <= 0 ||
				(
					!data.headers.hasOwnProperty('Content-Type') &&
					data.headers.hasOwnProperty('')
				)
			)
			{
				fail('Invalid EML file')
				resolve(false)
				return
			}

			normalizeAttachments(data)
			emlError.set(null)
			openedAttachmentIndex.set(null)
			emlData.set(data)
			resolve(true)
		})
	})
}

export function loadEmlFile(file: File): Promise<boolean>
{
	return new Promise(resolve =>
	{
		const reader = new FileReader()
		reader.onerror = () =>
		{
			fail(String(reader.error ?? 'Unreadable file'))
			resolve(false)
		}
		reader.onload = async () =>
		{
			resolve(await loadEmlText(reader.result as string))
		}
		reader.readAsText(file)
	})
}
