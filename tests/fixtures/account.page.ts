import {Locator,Page,expect} from '@playwright/test';

class AccountPage {
    readonly page:Page;
    readonly changePasswordCheck: Locator;
    readonly currentPasswordField: Locator;
    readonly newPasswordField: Locator;
    readonly confirmNewPasswordField: Locator;
    readonly genericSaveButton: Locator;
    readonly firstNameField: Locator;
    readonly lastNameField: Locator;
    readonly phoneNumberField: Locator;
    readonly streetAddressField: Locator;
    readonly countryField: Locator;
    readonly cityField: Locator;
    readonly stateField: Locator;
    readonly zipCodeField: Locator;
    readonly saveAddressButton: Locator;
    readonly defaultBillingAdressCheckbox: Locator;
    readonly firstAddressDeleteButton: Locator;
    readonly firstAddressEditButton: Locator;

    constructor(page:Page){
        this.page = page;

        //Address Book
        this.firstNameField = page.locator("input[name='firstname']");
        this.lastNameField = page.locator("input[name='lastname']");
        this.phoneNumberField = page.locator("input[name='telephone']");
        this.streetAddressField = page.locator("input[name='street[0]']");
        this.countryField = page.locator("select[name='country_id']");
        this.cityField = page.locator("input[name='city']");
        this.stateField = page.locator("select[name='region_id']");
        this.zipCodeField = page.locator("input[name='postcode']");
        this.saveAddressButton = page.getByRole('button', { name: 'Save Address' });
        this.defaultBillingAdressCheckbox = page.locator("input[name='default_billing']");

        //Delete Address
        this.firstAddressDeleteButton = page.locator(".table-additional-addresses-items tbody tr:first-child .delete");

        //Edit Address
        this.firstAddressEditButton = page.locator(".table-additional-addresses-items tbody tr:first-child .edit");

        //Account Information
        this.changePasswordCheck = page.locator("input[name='change_password']");
        this.currentPasswordField = page.locator("input[name='current_password']");
        this.newPasswordField = page.locator("#password");
        this.confirmNewPasswordField = page.locator("input[name='password_confirmation']");
        this.genericSaveButton = page.getByRole('button', { name: 'Save' });
    }

    async updatePassword(currentPassword:string, newPassword: string){
        await this.changePasswordCheck.check();
    
        await this.currentPasswordField.fill(currentPassword);
        await this.newPasswordField.fill(newPassword);
        await this.confirmNewPasswordField.fill(newPassword);
    
        await this.genericSaveButton.click();

        await this.page.waitForLoadState();

        const successMessage:Locator = this.page.locator('div.message-success');
        await expect(successMessage).toBeVisible();
    }

    async addNewAddress(firstName:string, lastName:string, phoneNumber:string, streetAddress:string, country:string, city:string, state:string, zipCode:string){
        await this.firstNameField.fill(firstName);
        await this.lastNameField.fill(lastName);
        await this.phoneNumberField.fill(phoneNumber);
        await this.streetAddressField.fill(streetAddress);
        await this.countryField.selectOption({label: country});
        await this.cityField.fill(city);
        await this.stateField.selectOption({label: state});
        await this.zipCodeField.fill(zipCode);

        await this.saveAddressButton.scrollIntoViewIfNeeded();
        await this.saveAddressButton.click();

        const addressBookUrl = `${process.env.BASE_URL}/customer/address/index/`;
        await this.page.waitForURL(addressBookUrl);
        const rowLocator = this.page.locator('#additional-addresses-table tbody tr').first().filter({
            hasText: process.env.CUSTOMER_FIRST_NAME
        });
        
        await expect(rowLocator).toBeVisible();
    }

    async deleteAddress(){
        await this.firstAddressDeleteButton.scrollIntoViewIfNeeded();
        await this.firstAddressDeleteButton.click();
        await expect(this.page.locator(".modal-popup.confirm")).toBeVisible();
        const okButton = this.page.getByRole('button', { name: 'OK' });
        await okButton.scrollIntoViewIfNeeded();
        await okButton.click();

        await this.page.waitForLoadState('load');

        const rowLocator = this.page.locator('#additional-addresses-table tbody tr').first().filter({hasText: process.env.CUSTOMER_UPDATED_CITY});

        await expect(rowLocator).toBeHidden();
    }

    async editAddress(){
        await this.firstAddressEditButton.scrollIntoViewIfNeeded();
        await this.firstAddressEditButton.click();

        await this.page.waitForURL(new RegExp(`${process.env.BASE_URL}/customer/address/edit/id/\\d+/$`));

        await expect(this.saveAddressButton).toBeVisible();
        await this.cityField.fill(process.env.CUSTOMER_UPDATED_CITY!);
        await this.saveAddressButton.scrollIntoViewIfNeeded();
        await this.saveAddressButton.click();
        
        const addressBookUrl = `${process.env.BASE_URL}/customer/address/index/`;
        await this.page.waitForURL(addressBookUrl);
        const rowLocator = this.page.locator('#additional-addresses-table tbody tr').first().filter({
            hasText: process.env.CUSTOMER_UPDATED_CITY
        });
        
        await expect(rowLocator).toBeVisible();
    }
}

export default AccountPage;