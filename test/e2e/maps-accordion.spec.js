import { test, expect } from '@playwright/test';

const FIXTURE = '/test/fixtures/maps-fixture.html';

// Map 0: short short/details
// Map 1: long short/details (jungle map)

test.describe('Maps accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForSelector('#mapBody tr[data-idx]');
  });

  test('map details element exists and has overflow hidden', async ({ page }) => {
    const details = page.locator('.map-details').nth(1);
    await expect(details).toBeVisible();
    const overflow = await details.evaluate(el => getComputedStyle(el).overflow);
    expect(overflow).toBe('hidden');
  });

  test('row starts collapsed (no map-expanded class)', async ({ page }) => {
    await expect(page.locator('tr[data-idx="1"]')).not.toHaveClass(/map-expanded/);
  });

  test('click on row expands it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(1).click();
    await expect(row).toHaveClass(/map-expanded/);
  });

  test('click on expanded row collapses it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(1).click();
    await expect(row).toHaveClass(/map-expanded/);
    await row.locator('td').nth(1).click();
    await expect(row).not.toHaveClass(/map-expanded/);
  });

  test('only one row expanded at a time — expanding second collapses first', async ({ page }) => {
    const row0 = page.locator('tr[data-idx="0"]');
    const row1 = page.locator('tr[data-idx="1"]');

    await row0.locator('td').nth(1).click();
    await expect(row0).toHaveClass(/map-expanded/);
    await expect(row1).not.toHaveClass(/map-expanded/);

    await row1.locator('td').nth(1).click();
    await expect(row0).not.toHaveClass(/map-expanded/);
    await expect(row1).toHaveClass(/map-expanded/);
  });

  test('clicking edit button does not expand the row', async ({ page }) => {
    const row = page.locator('tr[data-idx="0"]');
    const editBtn = row.locator('.tbl-actions button').first();
    await editBtn.click();
    await expect(page.locator('tr[data-idx="0"]')).not.toHaveClass(/map-expanded/);
  });
});
