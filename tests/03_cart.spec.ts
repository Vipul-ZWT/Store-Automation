import {test, expect, Page, Browser} from '@playwright/test';
import CartPage from './fixtures/cart.page';
import LoginPage from './fixtures/login.page';

async function addtocart(page: Page, url: string = `${process.env.BASE_URL}/${process.env.PRODUCT_URL}`,productName: string = process.env.PRODUCT_NAME!) {
    const cartPage = new CartPage(page);
    await cartPage.addToCart(url,productName);
}

async function removeProduct(page: Page) {
    const cartPage = new CartPage(page);
    await cartPage.removeProduct();
}

test.describe.serial('Cart', () => {
    test('User: Add Product to Cart', async ({page}) => {
        await addtocart(page);
    })
    test('User: Remove Product From Cart', async ({page}) => {
        await removeProduct(page);
    });
});

test.describe.serial('Guest User', () => {
    test.use({storageState: {cookies: [], origins: []}});

    test('Guest: Add and Remove Product From Cart', async ({page}) => {
        await test.step('Add product to cart', async () => {
            await addtocart(page);
        });
        await test.step('Remove product from cart', async () => {
            await removeProduct(page);
        });
    });

    test('Guest: Product Remains in Cart After Login', async ({page,browserName}) => {
        const browserEngine = browserName?.toUpperCase() || "UNKNOWN";
        await test.step('Add another product to cart', async () =>{
            const url = process.env[`SECOND_PRODUCT_URL_${browserEngine}`];
            await addtocart(page, `${process.env.BASE_URL}/${url}`, process.env[`SECOND_PRODUCT_NAME_${browserEngine}`]!);
        });

        await test.step('Log in with account', async () =>{
            const loginPage = new LoginPage(page);
            let emailInputValue = process.env[`CUSTOMER_EMAIL_${browserEngine}`];
            let passwordInputValue = process.env[`CUSTOMER_PASSWORD_${browserEngine}`];

            await loginPage.completeLogin(emailInputValue!, passwordInputValue!);
        });

        await page.goto(`${process.env.BASE_URL}/checkout/cart/`);
        await page.waitForLoadState('load');
        await expect(page.getByRole('strong').getByRole('link', { name: process.env[`SECOND_PRODUCT_NAME_${browserEngine}`] }),`${process.env[`SECOND_PRODUCT_NAME_${browserEngine}`]} should still be in cart`).toBeVisible();      
    });
});

test.describe.serial('Apply and Remove Coupon Code', () => {
    test('Apply Valid Coupon Code', async ({page}) => {
        const cartPage = new CartPage(page);
        await cartPage.addToCart(`${process.env.BASE_URL}/${process.env.COUPON_PRODUCT_URL}`, process.env.COUPON_PRODUCT_NAME!);
        await cartPage.applyCoupon(process.env.COUPON_CODE!);
    });

    test('Remove Applied Coupon Code', async ({page}) => {
        const cartPage = new CartPage(page);
        await cartPage.removeCoupon();
    });

    test('Apply Invalid Coupon Code', async ({page}) => {
        const cartPage = new CartPage(page);
        await cartPage.applyCoupon(process.env.INCORRECT_COUPON_CODE!,false);
    });
});