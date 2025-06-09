import {test,expect} from '@playwright/test';
import CheckoutPage from './fixtures/checkout.page';
import CartPage from './fixtures/cart.page';
import gmail from "gmail-tester";
import path from "path";

test.describe.serial('Stripe Order', () => {
    let orderNumber: string;
    test('Subscription Product Checkout', async ({ page }) => {
        const cartPage = new CartPage(page);
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`,process.env.PRODUCT_NAME!);

        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.placeOrder();

        orderNumber = await page.locator('a.order-number').innerText();

        const email = await gmail.check_inbox(
            path.resolve('credentials.json'),
            path.resolve('token.json'),
            {
                subject: `Your ZealousWeb order confirmation for #${orderNumber}`,
                max_wait_time_sec: 60,
                wait_time_sec: 10,
                include_body: true,
                label: 'SENT'
            }
        );


        expect(email).toBeTruthy();

        await page.waitForLoadState('load');
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

// test.describe("Guest checkout", () => {
//     test.use({storageState: {cookies: [], origins: []}});
//     test('Guest checkout', async ({page}) => {
//         await page.goto(`${process.env.BASE_URL}/checkout`);
//         await page.waitForLoadState('load');
    
//         await expect(page.getByText('Shopping Cart', { exact: true })).toBeVisible;
//     });
// })