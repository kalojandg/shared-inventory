import { test, expect } from '@playwright/test';

const FIXTURE = '/test/fixtures/quests-fixture.html';

// Quest 0: short desc/note (Куест 1)
// Quest 1: long desc/note (некромансърски книги)

test.describe('Quest accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForSelector('#questBody tr[data-idx]');
  });

  test('quest description element exists and has overflow hidden', async ({ page }) => {
    const desc = page.locator('.quest-desc').first();
    await expect(desc).toBeVisible();
    const overflow = await desc.evaluate(el => getComputedStyle(el).overflow);
    expect(overflow).toBe('hidden');
  });

  test('quest note cell exists and has overflow hidden', async ({ page }) => {
    const noteCell = page.locator('.quest-note-cell').nth(1);
    await expect(noteCell).toBeVisible();
    const overflow = await noteCell.evaluate(el => getComputedStyle(el).overflow);
    expect(overflow).toBe('hidden');
  });

  test('row starts collapsed (no quest-expanded class)', async ({ page }) => {
    await expect(page.locator('tr[data-idx="1"]')).not.toHaveClass(/quest-expanded/);
  });

  test('click on row expands it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(1).click();
    await expect(row).toHaveClass(/quest-expanded/);
  });

  test('click on expanded row collapses it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(1).click();
    await expect(row).toHaveClass(/quest-expanded/);
    await row.locator('td').nth(1).click();
    await expect(row).not.toHaveClass(/quest-expanded/);
  });

  test('only one row expanded at a time — expanding second collapses first', async ({ page }) => {
    const row0 = page.locator('tr[data-idx="0"]');
    const row1 = page.locator('tr[data-idx="1"]');

    await row0.locator('td').nth(1).click();
    await expect(row0).toHaveClass(/quest-expanded/);
    await expect(row1).not.toHaveClass(/quest-expanded/);

    await row1.locator('td').nth(1).click();
    await expect(row0).not.toHaveClass(/quest-expanded/);
    await expect(row1).toHaveClass(/quest-expanded/);
  });

  test('clicking cycle-status button does not expand the row', async ({ page }) => {
    const row = page.locator('tr[data-idx="0"]');
    const cycleBtn = row.locator('button').first();
    await cycleBtn.click();
    await expect(page.locator('tr[data-idx="0"]')).not.toHaveClass(/quest-expanded/);
  });

  test('clicking edit button does not expand the row', async ({ page }) => {
    const row = page.locator('tr[data-idx="0"]');
    const editBtn = row.locator('.tbl-actions button').first();
    await editBtn.click();
    await expect(page.locator('tr[data-idx="0"]')).not.toHaveClass(/quest-expanded/);
  });

  test('expanded state preserved after re-render from cycleStatus on different row', async ({ page }) => {
    // Expand quest 1
    await page.locator('tr[data-idx="1"]').locator('td').nth(1).click();
    await expect(page.locator('tr[data-idx="1"]')).toHaveClass(/quest-expanded/);

    // Cycle status on quest 0 (triggers renderQuests)
    await page.locator('tr[data-idx="0"]').locator('button').first().click();

    // Quest 1 should remain expanded
    await expect(page.locator('tr[data-idx="1"]')).toHaveClass(/quest-expanded/);
  });
});
