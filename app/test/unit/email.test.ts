import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

import { InvalidEmailError, parseEmail } from '../../src/lib/email'

const fixture = (name: string) => fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', name))

describe('parseEmail', () =>
{
	test('reads the header fields, body and attachments', async () =>
	{
		const email = await parseEmail(fixture('sample.eml'))
		expect(email.subject).toBe('Quote for kitchen renovation (final version)')
		expect(email.from).toEqual({ name: 'Sanne de Vries', email: 'sanne@studionoord.nl' })
		expect(email.to.map(address => address.email)).toEqual(['m@example.com', 'lotte@example.com'])
		expect(email.date?.toISOString()).toBe('2026-11-12T13:32:00.000Z')
		expect(email.html).toContain('<b>final quote</b>')
		expect(email.text).toContain('As promised')
		expect(email.headers.find(([key]) => key === 'Message-ID')?.[1]).toBe('<quote-2026-11-12@studionoord.nl>')

		const names = email.attachments.map(attachment => attachment.filename)
		expect(names).toEqual(['offerte-keuken.pdf', 'plattegrond.png', 'voorwaarden.docx', 'prijzen.csv', 'leverancier.eml', 'leeg.bin'])
		const pdf = email.attachments[0]!
		expect(pdf.contentType).toBe('application/pdf')
		expect(atob(pdf.data64).startsWith('%PDF')).toBe(true)
		expect(email.attachments.at(-1)!.size).toBe(0)
	})

	test('a raw 8-bit ISO-8859-1 body is decoded', async () =>
	{
		const email = await parseEmail(fixture('latin1-8bit.eml'))
		expect(email.text).toContain('Café, crème brûlée en één ü')
	})

	test('mixed charsets decode per part, including raw 8-bit headers', async () =>
	{
		const email = await parseEmail(fixture('mixed-8bit.eml'))
		expect(email.subject).toBe('Menú van de week')
		expect(email.from?.name).toBe('Zoë')
		expect(email.text).toContain('één ü — prijs € 12')
		expect(email.html).toContain('één ü — prijs € 12')
	})

	test('a file that is not an email is rejected', async () =>
	{
		await expect(parseEmail(fixture('not-an-email.eml'))).rejects.toBeInstanceOf(InvalidEmailError)
	})
})
