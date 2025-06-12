import {test, expect} from '@playwright/test';
import AffiliatePage from './fixtures/affiliate.page';
import CartPage from './fixtures/cart.page';
import CheckoutPage from './fixtures/checkout.page';
import LoginPage from './fixtures/login.page';
import Email from './fixtures/email.check';

test.use({storageState : {cookies: [], origins: []}});

test('Affiliate Customer Registration', async ({page}, testInfo) => {
    const register = new LoginPage(page);
    await register.createAccount()
});

test('Razorpay Testing', async ({ page },testInfo) => {
    test.setTimeout(280000);
    let orderNumber: string;
    let steps: { title: string; status: string }[] = [];

    const login = new LoginPage(page);
    await login.completeLogin(process.env.AFFILIATE_CUSTOMER_EMAIL!, process.env.AFFILIATE_CUSTOMER_PASSWORD!);

    const cartPage = new CartPage(page);
    const affiliate = new AffiliatePage(page);
    

    await page.goto(`${process.env.BASE_URL}/affiliate/index/index#u8`);

    await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`,process.env.PRODUCT_NAME!);

    await test.step('Store Switch', async() => {
        steps.push({ title: 'Store Switch', status: 'started' });
        try {
            await affiliate.storeSwitch();
            steps[steps.length - 1].status = 'passed';
        } catch (error) {
            steps[steps.length - 1].status = 'failed';
        }
    });

    await test.step('Place Order (Razorpay)', async() => {
        steps.push({ title: 'Place Order (Razorpay)', status: 'started' });
        try {
            const checkoutPage = new CheckoutPage(page);
            await checkoutPage.placeOrderRazorpay();
            steps[steps.length - 1].status = 'passed';
        } catch (error) {
            steps[steps.length - 1].status = 'failed';
        }
    });

    await test.step('Order Success Page', async() => {
        steps.push({ title: 'Order Success Page', status: 'started' });
        try {
            orderNumber = await page.locator('a.order-number').innerText();
            steps[steps.length - 1].status = 'passed';
        } catch (error) {
            steps[steps.length - 1].status = 'failed';
        }
    });

    await test.step('Order Email Verification', async () => {
        steps.push({ title: 'Order Email Verification', status: 'started' });
        try{
            const email = new Email();
            await email.checkEmail(`Your ZealousWeb order confirmation for #${orderNumber}`);
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
        }
    });

    await page.waitForLoadState('load');

    testInfo.attachments.push({
        name: 'steps',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(steps))
    });
});

test.describe('Affiliate',async () => {
    test('Affiliate Withdrawl',async ({page},testInfo) => {
        let steps: { title: string; status: string }[] = [];
        const loginPage = new LoginPage(page);
        await loginPage.completeLogin(process.env.AFFILIATE_EMAIL!, process.env.AFFILIATE_PASSWORD!);

        await page.goto(`${process.env.BASE_URL}/affiliate/account/withdraw/`);
        
        const affiliate = new AffiliatePage(page);
        await test.step('Affiliate Withdrawal', async() => {
            steps.push({ title: 'Affiliate Withdrawal', status: 'started' });
            try {
                await affiliate.myWithdrawal();
                steps[steps.length - 1].status = 'passed';
            } catch (error) {
                steps[steps.length - 1].status = 'failed';
            }
        });

        await test.step('Affiliate Cancel Withdrawal', async() => {
            steps.push({ title: 'Affiliate Cancel Withdrawal', status: 'started' });
            try {
                await affiliate.cancelWithdrawal();
                steps[steps.length - 1].status = 'passed';
            } catch (error) {
                steps[steps.length - 1].status = 'failed';
            }
        });

        testInfo.attachments.push({
            name: 'steps',
            contentType: 'application/json',
            body: Buffer.from(JSON.stringify(steps))
        });
    });

    test('Check Affiliate Commission', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.completeLogin(process.env.AFFILIATE_EMAIL!, process.env.AFFILIATE_PASSWORD!);

        await page.goto(`${process.env.BASE_URL}/affiliate/account/commissionlogs/`);

        const affiliate = new AffiliatePage(page);
        await affiliate.checkAffiliateCommission();
    })
});