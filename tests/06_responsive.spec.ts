import { test, expect, devices, Page } from '@playwright/test';
import CartPage from './fixtures/cart.page';
import { runSubscriptionCheckoutTest } from './utils/checkoutTests';
import { runRazorpayCheckoutTest } from './utils/razorpayCheckout';
import * as http from 'http';
import * as url from 'url';
import imageSize from 'image-size';


function getImageResponse(imageUrl: string): Promise<{ width: number; height: number; aspectRatio: number; sizeKB: number }> {
    return new Promise((resolve, reject) => {
        const options = url.parse(imageUrl);

        http.get(options, function (response) {
            const chunks: Buffer[] = [];
            response
                .on('data', function (chunk) {
                    chunks.push(chunk);
                })
                .on('end', function () {
                    try {
                        const buffer = Buffer.concat(chunks);
                        const sizeKB = buffer.length / 1024;
                        const dimensions = imageSize(buffer);
                        const aspectRatio = Number(dimensions.width) / Number(dimensions.height);

                        resolve({ width: dimensions.width || 0, height: dimensions.height || 0, aspectRatio, sizeKB });
                    } catch (err) {
                        reject(err);
                    }
                })
                .on('error', function (err) {
                    reject(err);
                });
        });
    });
}

async function ApplyFilter(page: Page){
    await page.goto(`${process.env.BASE_URL}/magento2-extensions`);
    await page.getByRole('tab', { name: 'Shop By' }).click();
    const filter = page.locator('.filter-options-content').first().locator('ol li.item a').first();

    await filter.click();
    await expect(page.locator('.filter-clear')).toBeVisible();
}

test.use({...devices['Pixel 5']});

test.describe('Responsive Tests', () => {
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
    
    test('Remove filter', async ({ page }, testInfo) => {
        let steps: { title: string; status: string }[] = [];

        await test.step('Apply filter', async () => {
            steps.push({ title: 'Apply filter', status: 'started' });
            try {
                await ApplyFilter(page);
                steps[steps.length - 1].status = 'passed';
            } catch  {
                steps[steps.length - 1].status = 'failed';
            }
        });

        await test.step('Remove filter', async () => {
            steps.push({ title: 'Remove filter', status: 'started' });
            try {
                const clearFilter = page.locator('.filter-clear');
                await clearFilter.click();
                await page.waitForURL(`${process.env.BASE_URL}/magento2-extensions`);
                await expect(clearFilter).toBeHidden();
                steps[steps.length - 1].status = 'passed';
            } catch  {
                steps[steps.length - 1].status = 'failed';
            }
        });

        testInfo.attachments.push({
            name: 'steps',
            contentType: 'application/json',
            body: Buffer.from(JSON.stringify(steps))
        });
        
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
    
    test('Image size and aspect ratio (PLP)', async ({ page },testInfo) => {
        let steps: { title: string; status: string }[] = [];
        let failed: boolean = false;
        await page.goto(`${process.env.BASE_URL}/magento2-extensions`);
    
        const imageUrls = await page.$$eval('.product-image-photo', (imgs) => imgs.map((img) => (img as HTMLImageElement).src));
    
        const lastTwoUrls = imageUrls.slice(-5);
        expect(lastTwoUrls.length).toBe(5);
    
        const imageMeta = await Promise.all(
            lastTwoUrls.map(async (url) => {
                return await getImageResponse(url);
            })
        );

        await test.step('Image size', async () => {
            steps.push({ title: 'Image size', status: 'started' });
            try {
                for (const img of imageMeta) {
                    expect(img.sizeKB).toBeLessThan(500);
                }
                steps[steps.length - 1].status = 'passed';
            } catch {
                steps[steps.length - 1].status = 'failed';
                failed = true;
            }
        });

        await test.step('Aspect ratio', async () => {
            steps.push({ title: 'Aspect ratio', status: 'started' });
            try {
                const referenceAspectRatio = imageMeta[0].aspectRatio;
    
                for (let i = 1; i < imageMeta.length; i++) {
                    const currentAspectRatio = imageMeta[i].aspectRatio;
                    expect(Math.abs(currentAspectRatio - referenceAspectRatio)).toBeLessThan(0.05);
                }

                steps[steps.length - 1].status = 'passed';
            } catch {
                steps[steps.length - 1].status = 'failed';
                failed = true;
            }
        });

        testInfo.attachments.push({
            name: 'steps',
            contentType: 'application/json',
            body: Buffer.from(JSON.stringify(steps))
        });

        if (failed) {
            throw new Error('Image size or aspect ratio test failed');
        }
    });

    test('Image size and aspect ratio (PDP)', async ({ page },testInfo) => {
        let steps: { title: string; status: string }[] = [];
        let failed = false;
        await page.goto(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`);

        const imageUrls = await page.$$eval('.product-image-gallery .carousel-item a img', (imgs) => imgs.map((img) => (img as HTMLImageElement).src));

        const lastTwoUrls = imageUrls;
        const imageMeta = await Promise.all(
            lastTwoUrls.map(async (url) => {
                return await getImageResponse(url);
            })
        );

        await test.step('Image size', async () => {
            steps.push({ title: 'Image size', status: 'started' });
            try {
                for (const img of imageMeta) {
                    expect(img.sizeKB).toBeLessThan(550);
                }
                steps[steps.length - 1].status = 'passed';
            } catch {
                steps[steps.length - 1].status = 'failed';
                failed = true;
            }
        });

        await test.step('Aspect ratio', async () => {
            steps.push({ title: 'Aspect ratio', status: 'started' });
            try {
                const referenceAspectRatio = imageMeta[0].aspectRatio;
    
                for (let i = 1; i < imageMeta.length; i++) {
                    const currentAspectRatio = imageMeta[i].aspectRatio;
                    expect(Math.abs(currentAspectRatio - referenceAspectRatio)).toBeLessThan(5);
                }

                steps[steps.length - 1].status = 'passed';
            } catch {
                steps[steps.length - 1].status = 'failed';
                failed = true;
            }
        });

        testInfo.attachments.push({
            name: 'steps',
            contentType: 'application/json',
            body: Buffer.from(JSON.stringify(steps))
        });

        if (failed) {
            throw new Error('Image size or aspect ratio test failed');
        }
    });

    test('Add to cart', async ({ page }) => {
        const cartPage = new CartPage(page);
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`, process.env.PRODUCT_NAME!);
    });

    test('Subscription Product Checkout (Mobile)', async ({ page }, testInfo) => {
        let orderNumber = '';
        await runSubscriptionCheckoutTest(page,testInfo,true,(number) => orderNumber = number);
    });

    test('Razorpay Product Checkout(Mobile)', async ({ page }, testInfo) => {
        test.setTimeout(285000);
        let orderNumber = '';
        const cartPage = new CartPage(page);
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`, process.env.PRODUCT_NAME!);
        await runRazorpayCheckoutTest(page, testInfo, true, (number) => orderNumber = number);
    });
});