import {test,Page, TestInfo,expect} from '@playwright/test';
import AffiliatePage from '../fixtures/affiliate.page';
import CheckoutPage from '../fixtures/checkout.page';
import Email from '../fixtures/email.check';


export async function runRazorpayCheckoutTest(page: Page, testInfo: TestInfo,isMobile: boolean, storeOrderNumber: (orderNumber: string) => void = () => {}) {
    let orderNumber: string;
    const steps: { title: string; status: string }[] = [];
    let failed = false;

    await test.step('Store Switchiching', async () => {
        steps.push({ title: 'Store Switchiching', status: 'started' });
        try {
            const affiliate = new AffiliatePage(page);
            await affiliate.storeSwitch();
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    await test.step('Place Order Using Razorpay Payment Method', async () => {
        steps.push({ title: 'Place Order Using Razorpay Payment Method', status: 'started' });
        try {
            const checkoutPage = new CheckoutPage(page);
            await checkoutPage.placeOrderRazorpay(isMobile);
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    await test.step('Verify Order Success Page Display', async () => {
        steps.push({ title: 'Verify Order Success Page Display', status: 'started' });
        try {
            orderNumber = await page.locator('a.order-number').innerText();
            storeOrderNumber(orderNumber);
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    await test.step('Verify Order Confirmation Email Receipt', async () => {
        steps.push({ title: 'Verify Order Confirmation Email Receipt', status: 'started' });
        try {
            const email = new Email();
            await email.checkEmail(`Your ZealousWeb order confirmation for #${orderNumber}`);
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    testInfo.attachments.push({
        name: 'steps',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(steps)),
    });

    if (failed) {
        throw new Error('Razorpay checkout test failed');
    }
}