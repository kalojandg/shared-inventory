import { test, expect } from '@playwright/test';

const FIXTURE = '/test/fixtures/items-fixture.html';

// Item 0: short note (Меч)
// Item 1: long note (Некромансърска книга)

test.describe('Item accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForSelector('#invBody tr[data-idx]');
  });

  test('item note cell exists and has overflow hidden', async ({ page }) => {
    const noteCell = page.locator('.item-note-cell').nth(1);
    await expect(noteCell).toBeVisible();
    const overflow = await noteCell.evaluate(el => getComputedStyle(el).overflow);
    expect(overflow).toBe('hidden');
  });

  test('row starts collapsed (no item-expanded class)', async ({ page }) => {
    await expect(page.locator('tr[data-idx="1"]')).not.toHaveClass(/item-expanded/);
  });

  test('click on row expands it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(1).click();
    await expect(row).toHaveClass(/item-expanded/);
  });

  test('click on expanded row collapses it', async ({ page }) => {
    const row = page.locator('tr[data-idx="1"]');
    await row.locator('td').nth(1).click();
    await expect(row).toHaveClass(/item-expanded/);
    await row.locator('td').nth(1).click();
    await expect(row).not.toHaveClass(/item-expanded/);
  });

  test('only one row expanded at a time — expanding second collapses first', async ({ page }) => {
    const row0 = page.locator('tr[data-idx="0"]');
    const row1 = page.locator('tr[data-idx="1"]');

    await row0.locator('td').nth(1).click();
    await expect(row0).toHaveClass(/item-expanded/);
    await expect(row1).not.toHaveClass(/item-expanded/);

    await row1.locator('td').nth(1).click();
    await expect(row0).not.toHaveClass(/item-expanded/);
    await expect(row1).toHaveClass(/item-expanded/);
  });

  test('clicking edit button does not expand the row', async ({ page }) => {
    const row = page.locator('tr[data-idx="0"]');
    const editBtn = row.locator('.tbl-actions button').first();
    await editBtn.click();
    await expect(page.locator('tr[data-idx="0"]')).not.toHaveClass(/item-expanded/);
  });

  test('clicking delete button does not expand the row', async ({ page }) => {
    page.on('dialog', d => d.dismiss());
    const row = page.locator('tr[data-idx="0"]');
    const deleteBtn = row.locator('.tbl-actions button').nth(1);
    await deleteBtn.click();
    await expect(page.locator('tr[data-idx="0"]')).not.toHaveClass(/item-expanded/);
  });
});
