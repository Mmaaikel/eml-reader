import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

const fixture = (name: string) => path.join(import.meta.dirname, '..', 'fixtures', name)

async function open(page: Page, name: string)
{
	// Wait until React has mounted so the input has its handler
	await page.locator('html[data-ready]').waitFor({ state: 'attached' })
	await page.setInputFiles('#eml-file-input', fixture(name))
}

test.beforeEach(async ({ page }) =>
{
	await page.goto('/')
})

test('empty state invites a file and states the privacy promise', async ({ page }) =>
{
	await expect(page.getByRole('heading', { level: 1, name: 'Read an email file' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Choose a file' })).toBeVisible()
	await expect(page.getByText('Stays on this device. Nothing is uploaded.').first()).toBeAttached()
})

test('a file that is not an email shows a clear error', async ({ page }) =>
{
	await open(page, 'not-an-email.eml')
	await expect(page.getByRole('alert')).toContainText('couldn\'t be read as an email')
})

test('an email opens as a letter with its attachments', async ({ page }) =>
{
	await open(page, 'sample.eml')
	await expect(page.getByRole('heading', { level: 1, name: 'Quote for kitchen renovation (final version)' })).toBeVisible()
	await expect(page.getByText('sanne@studionoord.nl').first()).toBeVisible()
	await expect(page.getByRole('heading', { name: /Enclosed · 6 attachments/ })).toBeVisible()
	await expect(page.locator('[data-stamp]')).toHaveCount(6)
	await expect(page.getByRole('button', { name: /leeg\.bin/ })).toBeDisabled()
})

test('remote images are blocked until the reader allows them', async ({ page }) =>
{
	await open(page, 'sample.eml')
	const notice = page.getByRole('status').filter({ hasText: 'Remote images are blocked' })
	await expect(notice).toBeVisible()
	await notice.getByRole('button', { name: 'Load remote images' }).click()
	await expect(page.getByRole('button', { name: 'Block again' })).toBeVisible()
})

test('switching between formatted and plain text', async ({ page }) =>
{
	await open(page, 'sample.eml')
	await page.getByRole('radio', { name: 'Plain text' }).click()
	await expect(page.getByRole('radio', { name: 'Plain text' })).toHaveAttribute('aria-checked', 'true')
	await expect(page.frameLocator('iframe[title="Message body"]').locator('pre')).toContainText('As promised')
})

test('headers tab lists key headers first and all headers on request', async ({ page }) =>
{
	await open(page, 'sample.eml')
	await page.getByRole('tab', { name: 'Headers' }).click()
	await expect(page.getByText('<quote-2026-11-12@studionoord.nl>').first()).toBeVisible()
	await page.locator('summary', { hasText: 'All headers' }).click()
	await expect(page.getByRole('button', { name: 'Copy all headers' })).toBeVisible()
})

test('attachments preview and close with Escape', async ({ page }) =>
{
	await open(page, 'sample.eml')

	await page.getByRole('button', { name: /plattegrond\.png/ }).click()
	await expect(page.getByRole('dialog')).toBeVisible()
	await expect(page.getByRole('dialog').getByRole('img')).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(page.getByRole('dialog')).toBeHidden()

	await page.getByRole('button', { name: /prijzen\.csv/ }).click()
	await expect(page.getByRole('dialog')).toContainText('Oak worktop;1450')
	await page.keyboard.press('Escape')

	await page.getByRole('button', { name: /voorwaarden\.docx/ }).click()
	await expect(page.getByRole('button', { name: 'Download file' })).toBeVisible()
	await page.keyboard.press('Escape')
})

test('an attached email opens in the reader', async ({ page }) =>
{
	await open(page, 'sample.eml')
	await page.getByRole('button', { name: /leverancier\.eml/ }).click()
	await page.getByRole('button', { name: 'Open this email' }).click()
	await expect(page.getByRole('heading', { level: 1, name: 'Supplier confirmation: oak worktop' })).toBeVisible()
})

test('French locale', async ({ page }) =>
{
	await page.goto('/fr/')
	await open(page, 'plain.eml')
	await expect(page.getByRole('tab', { name: 'En-têtes' })).toBeVisible()
	await expect(page.getByRole('heading', { name: 'Aucune pièce jointe' })).toBeVisible()
})

test('older emails in a legacy charset show their text', async ({ page }) =>
{
	await open(page, 'mixed-8bit.eml')
	await expect(page.getByRole('heading', { level: 1, name: 'Menú van de week' })).toBeVisible()
	await expect(page.getByText('Zoë').first()).toBeVisible()
	await page.getByRole('radio', { name: 'Plain text' }).click()
	await expect(page.frameLocator('iframe[title="Message body"]').locator('pre')).toContainText('één ü — prijs € 12')
})
