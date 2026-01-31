import { test, expect } from '@playwright/test';

test.describe('MCP Marketplace UI', () => {
  test('should show MCP tab in settings', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'MCP' }).click();
    await expect(page.getByText('MCP 市場')).toBeVisible();
  });

  test('should show search input in marketplace', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'MCP' }).click();
    await expect(page.getByPlaceholder('搜尋 MCP 服務...')).toBeVisible();
  });

  test('should show installed tab and count', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'MCP' }).click();
    await expect(page.getByRole('tab', { name: /已安裝/ })).toBeVisible();
  });
});
