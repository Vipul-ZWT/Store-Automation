import { test,expect,Locator } from "@playwright/test";
import LoginPage from "./fixtures/login.page";
import AccountPage from "./fixtures/account.page";
import Email from "./fixtures/email.check";

test.use({ storageState: { cookies: [], origins: [] } });

test('Customer Login from Home Page', async ({page}) => {
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

test('Customer Login with Incorrect Credentials',async ({page}) => {
    await page.goto(`${process.env.BASE_URL}/customer/account/login/`);

    page.setDefaultTimeout(30000);
    
    const loginPage = new LoginPage(page);
    await loginPage.login(process.env.CUSTOMER_EMAIL_CHROMIUM!, process.env.CUSTOMER_PASSWORD_CHROMIUM! + "123");

    await page.waitForLoadState('networkidle');

    const errorMessage:Locator = await page.locator('div.message-error');
    await expect(errorMessage).toBeVisible();
})

test('Forgot Password Flow', async ({page}, testInfo) => {
    let steps: { title: string; status: string }[] = [];
    steps.push({ title: 'Verify Forgot Password Reset Email', status: 'started' });

    page.setDefaultTimeout(30000);

    const resetButton:Locator = page.getByRole('button', {name: 'Reset My Password'});

    const forgotpasswordUrl = `${process.env.BASE_URL}/customer/account/forgotpassword/`;
    await page.goto(forgotpasswordUrl);
  
    await page.fill('input#email_address', process.env.CUSTOMER_EMAIL_CHROMIUM!);
  
    await page.waitForLoadState('networkidle');
    await resetButton.click();

    await test.step('Verify Forgot Password Reset Email', async () => {
        try{
            const email = new Email();
            await email.checkEmail('Reset your ZealousWeb password');
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
        }
    });

    const successMessage:Locator = page.locator('div.message-success');
    await expect(successMessage).toBeVisible();

    testInfo.attachments.push({
        name: 'steps',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(steps))
      });
});

test('Update Password from Account',async ({page},testInfo) => {
    let steps: { title: string; status: string }[] = [];
    steps.push({ title: 'Verify Password Update Confirmation Email', status: 'started' });

    const loginPage = new LoginPage(page);
    await loginPage.completeLogin(process.env.OTHER_CUSTOMER_EMAIL!, process.env.OTHER_CUSTOMER_PASSWORD!);

    await page.goto(`${process.env.BASE_URL}/customer/account/edit`);

    const accountPage = new AccountPage(page);
    await accountPage.updatePassword(process.env.OTHER_CUSTOMER_PASSWORD!, process.env.OTHER_CUSTOMER_NEW_PASSWORD!);

    await test.step('Verify Password Update Confirmation Email', async () => {
        try{
            const email = new Email();
            await email.checkEmail('Your ZealousWeb password has been changed');
            steps[steps.length - 1].status = 'passed';
        } catch {
            steps[steps.length - 1].status = 'failed';
        }
    });

    await loginPage.completeLogin(process.env.OTHER_CUSTOMER_EMAIL!, process.env.OTHER_CUSTOMER_NEW_PASSWORD!);
    testInfo.attachments.push({
        name: 'steps',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(steps))
    });
});