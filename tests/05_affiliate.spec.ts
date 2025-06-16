import {test, expect} from '@playwright/test';
import AffiliatePage from './fixtures/affiliate.page';
import CartPage from './fixtures/cart.page';
import LoginPage from './fixtures/login.page';
import { runRazorpayCheckoutTest } from './utils/razorpayCheckout';

test.use({storageState : {cookies: [], origins: []}});

test('Affiliate Customer Registration', async ({page}, testInfo) => {
    const register = new LoginPage(page);
    await register.createAccount()
});

test('Desktop: Razorpay Checkout Flow', async ({ page },testInfo) => {
    test.setTimeout(280000);
    let orderNumber: string;
    let steps: { title: string; status: string }[] = [];

    const login = new LoginPage(page);
    await login.completeLogin(process.env.AFFILIATE_CUSTOMER_EMAIL!, process.env.AFFILIATE_CUSTOMER_PASSWORD!);

    const cartPage = new CartPage(page);

    await page.goto(`${process.env.BASE_URL}/affiliate/index/index#u8`);

    await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`,process.env.PRODUCT_NAME!);

    await runRazorpayCheckoutTest(page, testInfo,false, (number) => orderNumber = number);
});

test.describe('Affiliate Flow',async () => {
    test('Affiliate: Initiate Withdrawal Request',async ({page},testInfo) => {
        let steps: { title: string; status: string }[] = [];
        const loginPage = new LoginPage(page);
        await loginPage.completeLogin(process.env.AFFILIATE_EMAIL!, process.env.AFFILIATE_PASSWORD!);

        await page.goto(`${process.env.BASE_URL}/affiliate/account/withdraw/`);
        
        const affiliate = new AffiliatePage(page);
        await test.step('Affiliate: Initiate Withdrawal Request', async() => {
            steps.push({ title: 'Affiliate: Initiate Withdrawal Request', status: 'started' });
            try {
                await affiliate.myWithdrawal();
                steps[steps.length - 1].status = 'passed';
            } catch (error) {
                steps[steps.length - 1].status = 'failed';
            }
        });

        await test.step('Affiliate: Cancel Withdrawal Request', async() => {
            steps.push({ title: 'Affiliate: Cancel Withdrawal Request', status: 'started' });
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

    test('Affiliate: Verify Commission Details', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.completeLogin(process.env.AFFILIATE_EMAIL!, process.env.AFFILIATE_PASSWORD!);

        await page.goto(`${process.env.BASE_URL}/affiliate/account/commissionlogs/`);

        const affiliate = new AffiliatePage(page);
        await affiliate.checkAffiliateCommission();
    })
});