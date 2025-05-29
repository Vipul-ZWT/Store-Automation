import { test as setup, expect } from '@playwright/test';
import path from 'path';
import LoginPage from './fixtures/login.page';


setup('Customer Authentication', async ({ page,browserName }) => {
  const authFile = path.join(__dirname, `../playwright/.auth/user.${browserName}.json`);
  const browserEngine = browserName?.toUpperCase() || "UNKNOWN";
  let emailValue = process.env[`CUSTOMER_EMAIL_${browserEngine}`];
  let passwordValue = process.env[`CUSTOMER_PASSWORD_${browserEngine}`];

  const loginPage = new LoginPage(page);
  await loginPage.completeLogin(emailValue!, passwordValue!);

  await page.context().storageState({ path: authFile });
});

//test branch