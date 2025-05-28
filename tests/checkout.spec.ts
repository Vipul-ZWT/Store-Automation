import {test,expect} from '@playwright/test';
import CheckoutPage from './fixtures/checkout.page';
import CartPage from './fixtures/cart.page';

test.describe.serial('Stripe Order', () => {
    let orderNumber: string;
    test('Subscription Product Checkout', async ({ page }) => {
        await test.step('Add Subscription Product to Cart', async () => {
            const cartPage = new CartPage(page);
            await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.CHECKOUT_PRODUCT_URL}`, process.env.CHECKOUT_PRODUCT_NAME!);
        });

        await test.step('Place Order', async () => {
            const checkoutPage = new CheckoutPage(page);
            await checkoutPage.placeOrder();

            orderNumber = await page.locator('a.order-number').innerText();
            await page.waitForLoadState('load');
        });
    });

    test('Check Downladable product', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/downloadable/customer/products/`);
        const rowLocator = page.locator('.table-downloadable-products tbody tr').filter({hasText: 'Test Subscription Product'});
        
        await expect(rowLocator).toBeVisible();
    })

    test('Stripe Subscription Verification and Cancellation', async ({page}) => {
        test.setTimeout(180000);
        const checkoutPage = new CheckoutPage(page);
        
        await page.goto(`${process.env.BASE_URL}/stripe/customer/subscriptions/`, {waitUntil: 'domcontentloaded'});
        const rowLocator = page.locator('.table-order-items tbody tr').first().filter({hasText: orderNumber});
        await expect(rowLocator).toBeVisible();
        
        await checkoutPage.cancelSubscription();
    });
});

test.describe("Guest checkout", () => {
    test.use({storageState: {cookies: [], origins: []}});
    test('Guest checkout', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/checkout`);
        await page.waitForLoadState('load');
    
        await expect(page.getByText('Shopping Cart', { exact: true })).toBeVisible;
    });
})