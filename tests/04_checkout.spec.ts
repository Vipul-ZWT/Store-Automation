import {test,expect} from '@playwright/test';
import CheckoutPage from './fixtures/checkout.page';
import Email from './fixtures/email.check';

test.describe.serial('Stripe Order', () => {
    let orderNumber: string;
    test('Subscription Product Checkout', async ({ page },testInfo) => {
        let steps: { title: string; status: string }[] = [];

        await test.step('Place Order', async() => {
            steps.push({ title: 'Place Order', status: 'started' });
            try {
                const checkoutPage = new CheckoutPage(page);
                await checkoutPage.placeOrder();
                steps[steps.length - 1].status = 'passed';
            } catch (error) {
                steps[steps.length - 1].status = 'failed';
            }
        })

        await test.step('Order Success Page', async() => {
            steps.push({ title: 'Order Success Page', status: 'started' });
            try {
                orderNumber = await page.locator('a.order-number').innerText();
                steps[steps.length - 1].status = 'passed';
            } catch (error) {
                steps[steps.length - 1].status = 'failed';
            }
        })
        
        await test.step('Order Email Verification', async () => {
            steps.push({ title: 'Order Email Verification', status: 'started' });
            try{
                const email = new Email();
                await email.checkEmail(`Your ZealousWeb order confirmation for #${orderNumber}`);
                steps[steps.length - 1].status = 'passed';
            } catch {
                steps[steps.length - 1].status = 'failed';
            }
        })

        await page.waitForLoadState('load');

        testInfo.attachments.push({
            name: 'steps',
            contentType: 'application/json',
            body: Buffer.from(JSON.stringify(steps))
        });
    });

    test('Check Downladable product', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/downloadable/customer/products/`);
        const rowLocator = page.locator('.table-downloadable-products tbody tr').filter({hasText: 'Test Subscription Product'});
        
        await expect(rowLocator).toBeVisible();
    })

    test('Stripe Subscription Verification and Cancellation', async ({page}, testInfo) => {
        let steps: { title: string; status: string }[] = [];
        const checkoutPage = new CheckoutPage(page);
        
        test.setTimeout(180000);
        
        await test.step('Verify Subscription Product', async () => {
            steps.push({ title: 'Verification of Subscription Product', status: 'started' });
            try {
                await page.goto(`${process.env.BASE_URL}/stripe/customer/subscriptions/`, {waitUntil: 'domcontentloaded'});
                const rowLocator = page.locator('.table-order-items tbody tr').first().filter({hasText: orderNumber});
                await expect(rowLocator).toBeVisible();
                steps[steps.length - 1].status = 'passed';
            } catch  {
                steps[steps.length - 1].status = 'failed';
            }
        });

        await test.step('Cancel Subscription', async () => {
            steps.push({ title: 'Cancel Subscription', status: 'started' });
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

test.describe("Guest checkout", () => {
    test.use({storageState: {cookies: [], origins: []}});
    test('Guest checkout', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/checkout`);
        await page.waitForLoadState('load');
    
        await expect(page.getByText('Shopping Cart', { exact: true })).toBeVisible();
    });
})