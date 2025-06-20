import {test,expect} from '@playwright/test';
import CheckoutPage from './fixtures/checkout.page';
// import Email from './fixtures/email.check';
import { runSubscriptionCheckoutTest } from './utils/checkoutTests';

test.describe.serial('Stripe Order', () => {
    let orderNumber: string;
    test('Desktop: Subscription Product Checkout', async ({ page },testInfo) => {
        await runSubscriptionCheckoutTest(page,testInfo,false,(number) => orderNumber = number);
    });

    test('Verify Downloadable Product Checkout', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/downloadable/customer/products/`);
        const rowLocator = page.locator('.table-downloadable-products tbody tr').filter({hasText: 'Test Subscription Product'});
        
        await expect(rowLocator).toBeVisible();
    })

    test('Stripe: Subscription Verification and Cancellation', async ({page}, testInfo) => {
        let steps: { title: string; status: string }[] = [];
        const checkoutPage = new CheckoutPage(page);
        
        test.setTimeout(180000);
        
        await test.step('Verify Active Subscription Product', async () => {
            steps.push({ title: 'Verify Active Subscription Product', status: 'started' });
            try {
                await page.goto(`${process.env.BASE_URL}/stripe/customer/subscriptions/`, {waitUntil: 'domcontentloaded'});
                const rowLocator = page.locator('.table-order-items tbody tr').first().filter({hasText: orderNumber});
                await expect(rowLocator).toBeVisible();
                steps[steps.length - 1].status = 'passed';
            } catch  {
                steps[steps.length - 1].status = 'failed';
            }
        });

        await test.step('Cancel Active Subscription', async () => {
            steps.push({ title: 'Cancel Active Subscription', status: 'started' });
            try {
                await checkoutPage.cancelSubscription();
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
});

test.describe("Guest: Product Checkout Flow", () => {
    test.use({storageState: {cookies: [], origins: []}});
    test('Guest: Product Checkout Flow', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/checkout`);
        await page.waitForLoadState('load');
    
        await expect(page.getByText('Shopping Cart', { exact: true })).toBeVisible();
    });
})