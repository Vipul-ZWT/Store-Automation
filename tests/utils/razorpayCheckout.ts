import {test,Page, TestInfo,expect} from '@playwright/test';
import AffiliatePage from '../fixtures/affiliate.page';
import CheckoutPage from '../fixtures/checkout.page';
import Email from '../fixtures/email.check';


export async function runRazorpayCheckoutTest(page: Page, testInfo: TestInfo,isMobile: boolean, storeOrderNumber: (orderNumber: string) => void = () => {}) {
    let orderNumber: string;
    const steps: { title: string; status: string }[] = [];
    let failed = false;

    await test.step('Store Switch', async () => {
        steps.push({ title: 'Store Switch', status: 'started' });
        try {
            const affiliate = new AffiliatePage(page);
            await affiliate.storeSwitch();
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    await test.step('Place Order (Razorpay)', async () => {
        steps.push({ title: 'Place Order (Razorpay)', status: 'started' });
        try {
            const checkoutPage = new CheckoutPage(page);
            await checkoutPage.placeOrderRazorpay(isMobile);
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    await test.step('Order Success Page', async () => {
        steps.push({ title: 'Order Success Page', status: 'started' });
        try {
            orderNumber = await page.locator('a.order-number').innerText();
            storeOrderNumber(orderNumber);
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
            failed = true;
        }
    });

    await test.step('Order Email Verification', async () => {
        steps.push({ title: 'Order Email Verification', status: 'started' });
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