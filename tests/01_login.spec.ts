import { test,expect,Locator } from "@playwright/test";
import LoginPage from "./fixtures/login.page";
import AccountPage from "./fixtures/account.page";
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

test('Forgot Password', async ({page}) => {
    page.setDefaultTimeout(30000);

    const resetButton:Locator = page.getByRole('button', {name: 'Reset My Password'});

    const forgotpasswordUrl = `${process.env.BASE_URL}/customer/account/forgotpassword/`;
    await page.goto(forgotpasswordUrl);
  
    await page.fill('input#email_address', process.env.CUSTOMER_EMAIL_CHROMIUM!);
  
    await page.waitForLoadState('networkidle');
    await resetButton.click();

    const email = new Email();
    await email.checkEmail('Reset your ZealousWeb password')
    
    expect(email).toBeTruthy();

    const successMessage:Locator = page.locator('div.message-success');
    await expect(successMessage).toBeVisible();
});

test('Update Password',async ({page,browserName}) => {
    const loginPage = new LoginPage(page);
    await loginPage.completeLogin(process.env.OTHER_CUSTOMER_EMAIL!, process.env.OTHER_CUSTOMER_PASSWORD!);

    await page.goto(`${process.env.BASE_URL}/customer/account/edit`);

    const accountPage = new AccountPage(page);
    await accountPage.updatePassword(process.env.OTHER_CUSTOMER_PASSWORD!, process.env.OTHER_CUSTOMER_NEW_PASSWORD!);

    const email = new Email();
    await email.checkEmail('Your ZealousWeb password has been changed');
    
    await loginPage.completeLogin(process.env.OTHER_CUSTOMER_EMAIL!, process.env.OTHER_CUSTOMER_NEW_PASSWORD!);
})