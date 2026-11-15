import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { readEml } from 'eml-parse-js'

import { decodeEmlBytes } from '../../src/lib/decodeEml'

const fixture = (name: string) => fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', name))

function parse(name: string): Promise<any>
{
	return new Promise((resolve, reject) =>
		readEml(decodeEmlBytes(fixture(name)), (error: any, data: any) => error ? reject(error) : resolve(data)))
}

describe('decodeEmlBytes', () =>
{
	test('UTF-8 files pass through unchanged', () =>
	{
		const bytes = fixture('sample.eml')
		expect(decodeEmlBytes(bytes)).toBe(new TextDecoder().decode(bytes))
	})

	test('a raw 8-bit ISO-8859-1 body is decoded instead of dropped', async () =>
	{
		const data = await parse('latin1-8bit.eml')
		expect(data.text).toContain('Café, crème brûlée en één ü')
	})

	test('mixed charsets decode per part, including raw 8-bit headers', async () =>
	{
		const data = await parse('mixed-8bit.eml')
		expect(data.subject).toBe('Menú van de week')
		expect(data.from.name).toBe('Zoë')
		expect(data.text).toContain('één ü — prijs € 12')
		expect(data.html).toContain('één ü — prijs € 12')
	})
})
