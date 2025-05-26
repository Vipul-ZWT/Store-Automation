import {test,expect} from '@playwright/test';
import CheckoutPage from './fixtures/checkout.page';
import CartPage from './fixtures/cart.page';

test.describe('Stripe Order', () => {
    test.beforeEach(async ({page}) => {
        const cartPage = new CartPage(page);
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.CHECKOUT_PRODUCT_URL}`, process.env.CHECKOUT_PRODUCT_NAME!);
    });
    test('Checkout', async ({page}) => {
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.placeOrder();
    });
})

test.describe("Guest checkout", () => {
    test.use({storageState: {cookies: [], origins: []}});
    test('Guest checkout', async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/checkout`);
        await page.waitForLoadState('load');
    
        await expect(page.getByText('Shopping Cart', { exact: true })).toBeVisible;
    });
})