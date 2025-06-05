import { test,expect,Locator } from "@playwright/test";
import LoginPage from "./fixtures/login.page";
import Email from "./fixtures/email.check";

test.use({ storageState: { cookies: [], origins: [] } });

test('Login From Home Page', async ({page}) => {
    await page.goto(`${process.env.BASE_URL}/`);
    await page.getByRole('button', { name: 'hidden' }).click();
    await page.getByRole('link', { name: 'Sign In' }).click();

    await expect(page).toHaveURL((url) => url.pathname.includes('/customer/account/login'));

    const loginPage = new LoginPage(page);
    await loginPage.login(process.env.CUSTOMER_EMAIL_CHROMIUM!, process.env.CUSTOMER_PASSWORD_CHROMIUM!);

    const timestamp = Date.now();
    const currentUrl = page.url();
    const timestampedUrl = `${currentUrl}?ts=${timestamp}`;
    await page.goto(timestampedUrl);

    await page.waitForLoadState('networkidle');

    const loginStatus = await page.evaluate(() => {
        return localStorage.getItem('mage-customer-login');
    });

    expect(loginStatus).toBe("1")
});

test('Customer Incorrect Login Test',async ({page}) => {
    await page.goto(`${process.env.BASE_URL}/customer/account/login/`);

    page.setDefaultTimeout(30000);
    
    const loginPage = new LoginPage(page);
    await loginPage.login(process.env.CUSTOMER_EMAIL_CHROMIUM!, process.env.CUSTOMER_PASSWORD_CHROMIUM! + "123");

    await page.waitForLoadState('networkidle');

    const errorMessage:Locator = await page.locator('div.message-error');
    await expect(errorMessage).toBeVisible();
})

test('Email check',async ({page}) => {
    const email = new Email();
    email.checkEmail('Your ZealousWeb password has been changed');
})