import { parseEmail } from '~/lib/email'
import openedAttachmentIndex from '~/stores/openedAttachmentIndex'
import emlData from '~/stores/emlData'
import emlError from '~/stores/emlError'

/** Parse raw .eml data and put it in the reader. Resolves true on success. */
export async function loadEmlBytes(raw: ArrayBuffer | Uint8Array): Promise<boolean>
{
	try
	{
		const email = await parseEmail(raw)
		emlError.set(null)
		openedAttachmentIndex.set(null)
		emlData.set(email)
		return true
	}
	catch (error)
	{
		emlError.set(error instanceof Error ? error.message : String(error))
		openedAttachmentIndex.set(null)
		emlData.set(null)
		return false
	}
}

export async function loadEmlFile(file: File): Promise<boolean>
{
	return loadEmlBytes(await file.arrayBuffer())
}

/** Load an email from base64 data, such as an attached .eml file. */
export function loadEmlBase64(data64: string): Promise<boolean>
{
	const binary = atob(data64.replace(/\s/g, ''))
	return loadEmlBytes(Uint8Array.from(binary, c => c.charCodeAt(0)))
}
