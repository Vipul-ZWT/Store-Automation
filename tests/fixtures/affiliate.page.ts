import { Locator, Page, expect } from "@playwright/test";
import { profileEnd } from "console";

class AffiliatePage {
    readonly page;
    readonly storeSwitcher;
    readonly adminUsername;
    readonly adminPassword;
    readonly adminSignInButton;
    readonly loader;
    readonly idFilter;
    readonly applyFilterButton;
    readonly orderInvoiceButton;
    readonly submitInvoiceButton;
    readonly withdrawAmount;
    readonly withdrawEmail;
    readonly withdrawRequestButton;
    readonly cancelWithdrawButton;

    constructor(page: Page){
        this.page = page;
        this.storeSwitcher = page.locator("#currency-select");
        this.adminUsername = page.getByRole('textbox', { name: 'Username *' });
        this.adminPassword = page.getByRole('textbox', { name: 'Password *' });
        this.adminSignInButton = page.getByRole('button', { name: 'Sign in' });
        this.loader = page.locator('#container > .admin__data-grid-outer-wrap > .admin__data-grid-loading-mask');
        this.idFilter = page.getByRole('textbox', { name: 'ID' });
        this.applyFilterButton = page.getByRole('button', { name: 'Apply Filters' });
        this.orderInvoiceButton = page.locator("#order_invoice");
        this.submitInvoiceButton = page.locator('button[data-ui-id="order-items-submit-button"]');
        this.withdrawAmount = page.locator("#withdraw_amount");
        this.withdrawEmail = page.locator("#paypal_email");
        this.withdrawRequestButton = page.getByRole('button',{name: "Send Request"});
        this.cancelWithdrawButton = page.locator("#affiliate-withdraws-history tbody tr").first().locator('a',{hasText: 'Cancel'});
    }

    async storeSwitch(){
        await this.storeSwitcher.selectOption({label: 'INR'});

        const selectedOption = this.storeSwitcher.locator('option:checked');
        await expect(selectedOption).toHaveAttribute('value', 'INR');
    }

    async completeOrder(orderNumber: string){
        await this.page.goto(`${process.env.BASE_URL}/admin`);
        await this.adminUsername.fill('gourav');
        await this.adminPassword.fill('Gourav@123');
        await this.adminSignInButton.click();

        await this.page.goto(`${process.env.BASE_URL}/admin/sales/order/index`);
        await expect(this.loader).toBeHidden({timeout: 60000});
        await this.page.getByRole('button', { name: 'Filters' }).click();
        await this.idFilter.fill(orderNumber);
        await this.applyFilterButton.click();
        await this.page.getByRole('cell', { name: orderNumber }).locator('div').click();

        await this.orderInvoiceButton.click();
        await this.page.waitForLoadState('load');

        await this.submitInvoiceButton.scrollIntoViewIfNeeded();
        await this.submitInvoiceButton.click();
        await this.page.waitForEvent('load')

        const successMessage = this.page.locator('.message-success');
        await expect(successMessage).toContainText('The invoice has been created.');
    }

    async myWithdrawal(){
        await this.withdrawAmount.fill("10");
        await this.withdrawEmail.fill("magento.qa.testing@gmail.com");
        await this.withdrawRequestButton.scrollIntoViewIfNeeded();
        await this.withdrawRequestButton.click();

        await this.page.waitForLoadState('load');
        const rowLocator = this.page.locator("#affiliate-withdraws-history tbody tr").first().filter({
            hasText: 'Pending'
        });

        await expect(rowLocator).toBeVisible();
    }

    async cancelWithdrawal(){
        await this.cancelWithdrawButton.scrollIntoViewIfNeeded();
        await this.page.once('dialog', async(dialog) => {await dialog.accept()})
        await this.cancelWithdrawButton.click();

        await this.page.waitForLoadState('load');
        const rowLocator = this.page.locator("#affiliate-withdraws-history tbody tr").first().filter({
            hasText: 'Cancel'
        });

        await expect(rowLocator).toBeVisible();
    }

    async checkAffiliateCommission(){
        const rowLocator = this.page.locator("#commission-logs-table tbody tr").first().filter({
            hasText: 'Vipul Patel'
        });

        await expect(rowLocator).toBeVisible();
    }
}

export default AffiliatePage;