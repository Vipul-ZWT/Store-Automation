import {expect, Locator, Page} from '@playwright/test';
import { stdout } from 'process';

class CheckoutPage {
    readonly page: Page;
    readonly billingAddressSection: Locator;
    readonly grandTotal: Locator;
    readonly placeOrderButton: Locator;
    readonly firstNameField: Locator;
    readonly lastNameField: Locator;
    readonly phoneNumberField: Locator;
    readonly streetAddressField: Locator;
    readonly countryField: Locator;
    readonly cityField: Locator;
    readonly stateField: Locator;
    readonly zipCodeField: Locator;
    readonly updateAddressButton: Locator;
    readonly stirpePaymentSection: Locator;
    readonly cancelSubscriptionButton: Locator;
    readonly payWithRazorPayButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.billingAddressSection = page.locator('[data-bind*="isAddressFormVisible"]');
        this.stirpePaymentSection = page.locator('[data-bind*="visible: isPaymentFormVisible"]');
        this.grandTotal = page.locator("tr.grand.totals .price");
        this.placeOrderButton = page.locator("button[title='Place Order']");
        this.payWithRazorPayButton = page.locator("button[title='Pay with Razorpay']");
        this.firstNameField = page.getByRole('textbox', { name: /first name/i });
        this.lastNameField = page.getByRole('textbox', { name: /last name/i });
        this.phoneNumberField = page.getByRole('textbox', { name: /phone number/i });
        this.streetAddressField = page.locator('.billing-address-form input[name="street[0]"]');
        this.zipCodeField = page.locator('.billing-address-form input[name="postcode"]');
        this.cityField = page.locator('.billing-address-form input[name="city"]');
        this.countryField = page.locator(".billing-address-form select[name='country_id']");
        this.stateField = page.locator(".billing-address-form select[name='region_id']");
        this.updateAddressButton = page.getByRole('button', { name: 'Update' });
        this.cancelSubscriptionButton = page.locator('.table-order-items tbody tr:first-child .delete');
    }

    async waitForStripeIframeReload() {
        const iframeLocator = this.page.frameLocator('iframe[title="Secure payment input frame"]');
        const cardNumberInput = iframeLocator.getByRole('textbox', { name: 'Card number' });
        await cardNumberInput.waitFor({ state: 'detached', timeout: 10000 });
        await cardNumberInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async fillStripeCardInputs() {
        const frame = this.page.frameLocator('iframe[title="Secure payment input frame"]');
    
        await frame.getByRole('textbox', { name: 'Card number' }).fill(process.env.CARD_NUMBER!);
        await frame.getByRole('textbox', { name: 'Expiration date' }).fill(process.env.CARD_EXPIRY!);
        await frame.getByRole('textbox', { name: 'Security code' }).fill(process.env.CARD_CVV!);
    }

    async fillBillingAddressIfVisible(razorpay: Boolean = false) {
        if (await this.billingAddressSection.isVisible()) {
            await this.firstNameField.fill(process.env.CUSTOMER_FIRST_NAME!);
            await this.lastNameField.fill(process.env.CUSTOMER_LAST_NAME!);
            await this.phoneNumberField.fill(process.env.CUSTOMER_PHONE!);
            await this.streetAddressField.fill(process.env.CUSTOMER_ADDRESS!);
            if(razorpay){
                await this.countryField.selectOption({ label: "India" });
                await this.stateField.selectOption({ label: "Gujarat"});
                await this.cityField.fill("Ahmedabad");
                await this.zipCodeField.fill("388120");
            }
            else{
                await this.countryField.selectOption({ label: process.env.CUSTOMER_COUNTRY! });
                await this.cityField.fill(process.env.CUSTOMER_CITY!);
                await this.stateField.selectOption({ label: process.env.CUSTOMER_STATE! });
                await this.zipCodeField.fill(process.env.CUSTOMER_POSTAL_CODE!);
            }
        }

        if(await this.updateAddressButton.isVisible()) {
            await this.updateAddressButton.scrollIntoViewIfNeeded();
            await this.updateAddressButton.click();
    
            if (await this.stirpePaymentSection.isVisible()) {
                await this.waitForStripeIframeReload();
            }
        }
    }

    async placeOrder() {
        await this.page.goto(`${process.env.BASE_URL}/checkout/#payment`);
        await expect(this.grandTotal).toBeVisible({timeout: 60000});

        await this.fillBillingAddressIfVisible();

        const priceText = await this.grandTotal.innerText();
        if(priceText.includes('$')) {
            if(await this.stirpePaymentSection.isVisible()) {
                await this.fillStripeCardInputs();
            }

            await this.placeOrderButton.scrollIntoViewIfNeeded();
            await this.placeOrderButton.click();

            const orderSuccessMessage = this.page.locator('text=Thank you for your purchase!');
            await expect(orderSuccessMessage).toBeVisible({timeout: 60000});
        }
    }

    async cancelSubscription() {
        await this.cancelSubscriptionButton.scrollIntoViewIfNeeded();
        await this.page.once('dialog', async dialog => {await dialog.accept();});
        
        await this.cancelSubscriptionButton.click();
        
        await expect(this.cancelSubscriptionButton).toBeHidden();
    }

    async placeOrderRazorpay(){
        await this.page.goto(`${process.env.BASE_URL}/checkout/#payment`);
        await expect(this.grandTotal).toBeVisible({timeout: 60000});

        await this.fillBillingAddressIfVisible(true);

        await this.payWithRazorPayButton.scrollIntoViewIfNeeded();
        await this.payWithRazorPayButton.click();

        const razorpayFrame = this.page.locator('iframe').first().contentFrame();

        await razorpayFrame.getByRole('textbox', { name: 'Mobile number' }).fill('9725406871');

        await razorpayFrame.getByTestId('nav-sidebar').locator('div').filter({ hasText: 'Cards' }).nth(2).click();

        await razorpayFrame.getByPlaceholder('Card Number').fill('4111 1111 1111 1111');
        await razorpayFrame.getByPlaceholder('MM / YY').fill('11 / 29');
        await razorpayFrame.getByPlaceholder('CVV').fill('123');

        await razorpayFrame.locator('[data-test-id="add-card-cta"]').scrollIntoViewIfNeeded();
        await razorpayFrame.locator('[data-test-id="add-card-cta"]').click();

        await razorpayFrame.getByText('INR ₹').click();
        await razorpayFrame.getByRole('button', { name: 'Pay ₹' }).click();

        const page1Promise = this.page.waitForEvent('popup');
        await razorpayFrame.getByRole('button', { name: 'Maybe later' }).click();

        const page1 = await page1Promise;

        await razorpayFrame.getByPlaceholder('Enter OTP').fill('1234');
        await razorpayFrame.getByTestId('overlay-[object Object]').getByRole('button', { name: 'Continue' }).click();

        const orderSuccessMessage = this.page.locator('text=Thank you for your purchase!');
        await expect(orderSuccessMessage).toBeVisible({timeout: 80000});
    }
}

export default CheckoutPage;