import { test, expect, devices } from '@playwright/test';

// test.use({...devices['Pixel 5']});

test('Toggle Menu', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);

    const menuToggle = page.locator('.action.nav-toggle');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    await page.getByRole('menuitem', { name: 'Contact' }).click();
    await page.waitForURL('https://www.zealousweb.com/contact/');
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
});


test('Check for ShopBy menu', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/magento2-extensions`);
  await page.getByRole('tab', { name: 'Shop By' }).click();
  await expect(page.getByRole('tablist').filter({ hasText: 'Shop By' })).toBeVisible();
});

test('Search toggle', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/magento2-extensions`);
    await page.locator('label').filter({ hasText: 'Search' }).click();
    await expect(page.getByRole('combobox', { name: 'Search' })).toBeVisible();
});

test('Check for Scroll bar on Seo packages', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/packages/local-seo-packages`);
    const scrollBar = page.locator('.feature-comparison-table');
    await expect(scrollBar).toBeVisible();
    const scrollBarWidth = await scrollBar.evaluate((el: HTMLElement) =>  el.scrollWidth > el.clientWidth && window.getComputedStyle(el).overflowX !== 'hidden');
    expect(scrollBarWidth).toBe(true);
});

test('Desicription on product listing page', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/magento2-extensions?product_list_mode=list`);
    const firstDescription = page.locator('.product-item-description').first();
    const isVisible = await firstDescription.isVisible();
    expect(isVisible).toBe(false);
});