import { test,expect,Locator } from "@playwright/test";
import LoginPage from "./fixtures/login.page";
import Email from "./fixtures/email.check";
import gmail from "gmail-tester";
import path from "path";

test.use({ storageState: { cookies: [], origins: [] } });

// test('Login From Home Page', async ({page}) => {
//     await page.goto(`${process.env.BASE_URL}/`);
//     await page.getByRole('button', { name: 'hidden' }).click();
//     await page.getByRole('link', { name: 'Sign In' }).click();

//     await expect(page).toHaveURL((url) => url.pathname.includes('/customer/account/login'));

//     const loginPage = new LoginPage(page);
//     await loginPage.login(process.env.CUSTOMER_EMAIL_CHROMIUM!, process.env.CUSTOMER_PASSWORD_CHROMIUM!);

//     const timestamp = Date.now();
//     const currentUrl = page.url();
//     const timestampedUrl = `${currentUrl}?ts=${timestamp}`;
//     await page.goto(timestampedUrl);

//     await page.waitForLoadState('networkidle');

//     const loginStatus = await page.evaluate(() => {
//         return localStorage.getItem('mage-customer-login');
//     });

//     expect(loginStatus).toBe("1")
// });

test('Customer Incorrect Login Test', async ({ page }, testInfo) => {
    let steps: { title: string; status: string }[] = [];
  
    await test.step('Navigate to Login Page', async () => {
      steps.push({ title: 'Navigate to Login Page', status: 'started' });
      try {
        await page.goto(`${process.env.BASE_URL}/customer/account/login/`);
        steps[steps.length - 1].status = 'passed';
      } catch {
        steps[steps.length - 1].status = 'failed';
      }
    });
  
    await test.step('Attempt Login with Incorrect Credentials', async () => {
      steps.push({ title: 'Attempt Login with Incorrect Credentials', status: 'started' });
      try {
        const loginPage = new LoginPage(page);
        await loginPage.login(
          process.env.CUSTOMER_EMAIL_CHROMIUM!,
          process.env.CUSTOMER_PASSWORD_CHROMIUM! + '123'
        );
        await page.waitForLoadState('networkidle');
        steps[steps.length - 1].status = 'passed';
      } catch {
        steps[steps.length - 1].status = 'failed';
      }
    });
  
    await test.step('Verify Error Message', async () => {
      steps.push({ title: 'Verify Error Message', status: 'started' });
      try {
        const errorMessage = page.locator('div.message-error');
        await expect(errorMessage).toBeVisible();
        steps[steps.length - 1].status = 'passed';
      } catch {
        steps[steps.length - 1].status = 'failed';
      }
    });
  
    // Attach steps to testInfo for reporter use
    testInfo.attachments.push({
      name: 'steps',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(steps))
    });
});
  

test('Email check',async ({page}) => {
    const email = new Email();
    email.checkEmail('Your ZealousWeb order confirmation for #4000000150');
})