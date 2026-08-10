import { test, expect } from '@playwright/test';

const FIXTURE = '/test/fixtures/bases-routing-fixture.html';

// Visibility of the bases detail routing, tested against the REAL styles.css
// (the fixture links it instead of inlining a copy). Playwright's
// toBeVisible/toBeHidden read computed styles, so a missing/broken CSS rule
// fails here even when the class toggling itself is correct — exactly the
// bug this spec was written for: the `hidden` class was applied but had no
// global rule, so the detail rendered glued UNDER the still-visible list.

test.describe('Bases detail routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForSelector('#baseBody tr[data-idx]');
  });

  test('boots into the tab view: list visible, detail hidden', async ({ page }) => {
    await expect(page.locator('.tab-nav')).toBeVisible();
    await expect(page.locator('#tab-bases')).toBeVisible();
    await expect(page.locator('#baseDetail')).toBeHidden();
  });

  test('📖 replaces the tab view with the detail — nav and list are really hidden', async ({ page }) => {
    await page.locator('tr[data-idx="0"] .tbl-actions button').first().click();

    await expect(page.locator('#baseDetail')).toBeVisible();
    await expect(page.locator('#bdName')).toHaveValue('Крепостта на хълма');
    await expect(page.locator('.tab-nav')).toBeHidden();
    await expect(page.locator('#tab-bases')).toBeHidden();
    await expect(page.locator('#baseBody')).toBeHidden();
  });

  test('back returns to the list view', async ({ page }) => {
    await page.locator('tr[data-idx="0"] .tbl-actions button').first().click();
    await expect(page.locator('#baseDetail')).toBeVisible();

    await page.locator('#btnBaseBack').click();

    await expect(page.locator('#baseDetail')).toBeHidden();
    await expect(page.locator('.tab-nav')).toBeVisible();
    await expect(page.locator('#tab-bases')).toBeVisible();
  });

  test('F5 while in the detail lands back on the tab view (stale hash is dropped)', async ({ page }) => {
    await page.locator('tr[data-idx="0"] .tbl-actions button').first().click();
    await expect(page.locator('#baseDetail')).toBeVisible();

    await page.reload();
    await page.waitForSelector('#baseBody tr[data-idx]');

    await expect(page.locator('.tab-nav')).toBeVisible();
    await expect(page.locator('#tab-bases')).toBeVisible();
    await expect(page.locator('#baseDetail')).toBeHidden();
    expect(new URL(page.url()).hash).toBe('');
  });
});
