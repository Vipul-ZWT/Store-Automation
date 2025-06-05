import {test, expect} from '@playwright/test';
import AffiliatePage from './fixtures/affiliate.page';
import CartPage from './fixtures/cart.page';
import CheckoutPage from './fixtures/checkout.page';
import gmail from "gmail-tester";
import path from "path";

test.describe.serial('Affiliate Testing', async () => {
    let orderNumber: string;
    
    test('Razorpay Testing', async ({ page }) => {
        const cartPage = new CartPage(page);
        const affiliate = new AffiliatePage(page);
    
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.PRODUCT_URL}#u7`,process.env.PRODUCT_NAME!);
        await affiliate.storeSwitch();
    
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.placeOrderRazorpay();
    
        orderNumber = await page.locator('a.order-number').innerText();
    
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
    
        // expect(email).toBeTruthy();
    
        await page.waitForLoadState('load');    
    });

    test('Complete order', async({page}) => {
        const affiliate = new AffiliatePage(page);
        await affiliate.completeOrder(orderNumber)
    })
})