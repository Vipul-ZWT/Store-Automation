import {test,expect,Locator, Browser, Page} from '@playwright/test';
import { webkit, chromium, firefox } from '@playwright/test';
import AccountPage from './fixtures/account.page';

test.describe.serial('Account Information Actions Flow',{annotation: {type: 'Account Dashboard', description: 'Test for Account Information'}},async () => {

    test('Add New Address',async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/customer/address/new/`);

        const accountPage = new AccountPage(page);
        await accountPage.addNewAddress(process.env.CUSTOMER_FIRST_NAME!, process.env.CUSTOMER_LAST_NAME!, process.env.CUSTOMER_PHONE!, process.env.CUSTOMER_ADDRESS!, process.env.CUSTOMER_COUNTRY!, process.env.CUSTOMER_CITY!, process.env.CUSTOMER_STATE!, process.env.CUSTOMER_POSTAL_CODE!);
    })

    test('Edit Address',async ({page}) => {
        await page.goto(`${process.env.BASE_URL}/customer/address/index/`);

        const accountPage = new AccountPage(page);
        await accountPage.editAddress();
    })

    test('Delete Address',async({page}) => {
        await page.goto(`${process.env.BASE_URL}/customer/address/index/`);

        const accountPage = new AccountPage(page);
        await accountPage.deleteAddress();
    })
})