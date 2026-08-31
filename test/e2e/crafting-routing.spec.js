import { test, expect } from '@playwright/test';

const FIXTURE = '/test/fixtures/crafting-fixture.html';

// Crafting reference page (⚒ → #crafting), tested against the REAL styles.css
// (the fixture links it instead of inlining a copy, like bases-routing does).
// Playwright's toBeVisible/toBeHidden read computed styles, so a missing or
// broken CSS rule fails here even when the class toggling itself is correct —
// the `.hidden` utility must really hide the tab nav and the tab panes, or the
// crafting page would render glued UNDER the still-visible tab view.

test.describe('Crafting reference routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForSelector('.tab-nav .tab-btn');
  });

  test('boots into the tab view: tabs visible, crafting page hidden', async ({ page }) => {
    await expect(page.locator('.tab-nav')).toBeVisible();
    await expect(page.locator('#tab-bases')).toBeVisible();
    await expect(page.locator('#craftingPage')).toBeHidden();
  });

  test('⚒ replaces the tab view with the crafting page — nav and tabs are really hidden', async ({ page }) => {
    await page.locator('button[aria-label="Крафтинг референции"]').click();

    await expect(page.locator('#craftingPage')).toBeVisible();
    await expect(page.locator('.tab-nav')).toBeHidden();
    await expect(page.locator('#tab-bases')).toBeHidden();
    await expect(page.locator('#craftBody tr.craft-row')).toHaveCount(5);
  });

  test('name search narrows the list, clearing it restores every row', async ({ page }) => {
    await page.locator('button[aria-label="Крафтинг референции"]').click();
    await expect(page.locator('#craftBody tr.craft-row')).toHaveCount(5);

    // Case-insensitive substring on the name column.
    await page.locator('#craftSearch').fill('fox');

    await expect(page.locator('#craftBody tr.craft-row')).toHaveCount(1);
    await expect(page.locator('#craftBody tr.craft-row').first()).toContainText('Fox');
    await expect(page.locator('#craftBody tr:has-text("Wolf")')).toHaveCount(0);

    await page.locator('#craftSearch').fill('');

    await expect(page.locator('#craftBody tr.craft-row')).toHaveCount(5);
  });

  test('badge filter keeps only the rows of the selected value', async ({ page }) => {
    await page.locator('button[aria-label="Крафтинг референции"]').click();

    await page.locator('#craftBadge').selectOption('Tiny');

    await expect(page.locator('#craftBody tr.craft-row')).toHaveCount(2);
    await expect(page.locator('#craftBody .craft-badge').first()).toHaveText('Tiny');
    await expect(page.locator('#craftBody tr:has-text("Wolf")')).toHaveCount(0);

    await page.locator('#craftBadge').selectOption({ label: 'Всички' });

    await expect(page.locator('#craftBody tr.craft-row')).toHaveCount(5);
  });

  test('clicking a row opens the details accordion, clicking it again closes it', async ({ page }) => {
    await page.locator('button[aria-label="Крафтинг референции"]').click();
    await expect(page.locator('#craftBody .craft-details-row')).toHaveCount(0);

    await page.locator('#craftBody tr[data-idx="0"]').click();

    const details = page.locator('#craftBody .craft-details-row');
    await expect(details).toHaveCount(1);
    await expect(details).toBeVisible();
    await expect(details).toContainText('Harvest DC: 5');
    await expect(details).toContainText('Leather / Hide: Pelt');

    await page.locator('#craftBody tr[data-idx="0"]').click();

    await expect(page.locator('#craftBody .craft-details-row')).toHaveCount(0);
  });

  test('back returns to the tab view', async ({ page }) => {
    await page.locator('button[aria-label="Крафтинг референции"]').click();
    await expect(page.locator('#craftingPage')).toBeVisible();

    await page.locator('#btnCraftBack').click();

    await expect(page.locator('#craftingPage')).toBeHidden();
    await expect(page.locator('.tab-nav')).toBeVisible();
    await expect(page.locator('#tab-bases')).toBeVisible();
  });

  test('F5 while in the crafting page lands back on the tab view (boot strip)', async ({ page }) => {
    await page.locator('button[aria-label="Крафтинг референции"]').click();
    await expect(page.locator('#craftingPage')).toBeVisible();

    await page.reload();
    await page.waitForSelector('.tab-nav .tab-btn');

    await expect(page.locator('.tab-nav')).toBeVisible();
    await expect(page.locator('#tab-bases')).toBeVisible();
    await expect(page.locator('#craftingPage')).toBeHidden();
    expect(new URL(page.url()).hash).toBe('');
  });
});
