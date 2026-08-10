import { test, expect } from '@playwright/test';

const FIXTURE = '/test/fixtures/bases-fixture.html';

// Base 0: short location
// Base 1: long location (mountain sanctuary)

test.describe('Bases accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForSelector('#baseBody tr[data-idx]');
  });

  test('base location element exists and has overflow hidden', async ({ page }) => {
    const location = page.locator('.base-location').nth(1);
    await expect(location).toBeVisible();
    const overflow = await location.evaluate(el => getComputedStyle(el).overflow);
    expect(overflow).toBe('hidden');
  });

  test('row starts collapsed (no base-expanded class)', async ({ page }) => {
    await expect(page.locator('tr[data-idx="1"]')).not.toHaveClass(/base-expanded/);
  });

  test('click on row expands it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(2).click();
    await expect(row).toHaveClass(/base-expanded/);
  });

  test('click on expanded row collapses it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(2).click();
    await expect(row).toHaveClass(/base-expanded/);
    await row.locator('td').nth(2).click();
    await expect(row).not.toHaveClass(/base-expanded/);
  });

  test('only one row expanded at a time — expanding second collapses first', async ({ page }) => {
    const row0 = page.locator('tr[data-idx="0"]');
    const row1 = page.locator('tr[data-idx="1"]');

    await row0.locator('td').nth(2).click();
    await expect(row0).toHaveClass(/base-expanded/);
    await expect(row1).not.toHaveClass(/base-expanded/);

    await row1.locator('td').nth(2).click();
    await expect(row0).not.toHaveClass(/base-expanded/);
    await expect(row1).toHaveClass(/base-expanded/);
  });

  test('clicking detail button does not expand the row', async ({ page }) => {
    const row = page.locator('tr[data-idx="0"]');
    const detailBtn = row.locator('.tbl-actions button').first();
    await detailBtn.click();
    await expect(page.locator('tr[data-idx="0"]')).not.toHaveClass(/base-expanded/);
  });
});
