import {test, expect} from '@playwright/test';
import AffiliatePage from './fixtures/affiliate.page';
import CartPage from './fixtures/cart.page';
import CheckoutPage from './fixtures/checkout.page';
import LoginPage from './fixtures/login.page';
import Email from './fixtures/email.check';
test.describe.serial('Order with Razorpay', async () => {
    let orderNumber: string;
    
    test('Razorpay Testing', async ({ page }) => {
        const cartPage = new CartPage(page);
        const affiliate = new AffiliatePage(page);

        await page.goto(`${process.env.BASE_URL}#u6`);
    
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}`,process.env.PRODUCT_NAME!);
        await affiliate.storeSwitch();
    
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.placeOrderRazorpay();
    
        orderNumber = await page.locator('a.order-number').innerText();

        const email = new Email();
        email.checkEmail(`Your ZealousWeb order confirmation for #${orderNumber}`);
    
        // const email = await gmail.check_inbox(
        //     path.resolve('credentials.json'),
        //     path.resolve('token.json'),
        //     {
        //         subject: `Your ZealousWeb order confirmation for #${orderNumber}`,
        //         max_wait_time_sec: 60,
        //         wait_time_sec: 10,
        //         include_body: true,
        //         label: 'SENT'
        //     }
        // );
    
        expect(email).toBeTruthy();
    
        await page.waitForLoadState('load');    
    });

    test('Complete order', async({page}) => {
        const affiliate = new AffiliatePage(page);
        await affiliate.completeOrder(orderNumber)
    })
})

// test.describe.serial('Affiliate',async () => {
//     test.use({storageState : {cookies: [], origins: []}});

//     test('Affiliate Withdrawl',async ({page}) => {
//         const loginPage = new LoginPage(page);
//         await loginPage.completeLogin(process.env.AFFILIATE_EMAIL!, process.env.AFFILIATE_PASSWORD!);

//         await page.goto(`${process.env.BASE_URL}/affiliate/account/withdraw/`);
        
//         const affiliate = new AffiliatePage(page);
//         await affiliate.myWithdrawal();

//         await affiliate.cancelWithdrawal()
//     });
// })