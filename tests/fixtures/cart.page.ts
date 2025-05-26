import { Locator, Page, expect } from "@playwright/test";

class CartPage {
    readonly page: Page;
    readonly policyButton: Locator;
    readonly addToCartButton: Locator;
    readonly couponCodeInput: Locator;
    readonly applyCouponButton: Locator;
    readonly applyCouponCodeButton: Locator
    readonly removeButton: Locator;

    constructor (page: Page){
        this.page = page;
        this.policyButton = page.locator(".product-add-form .police-condition .checkbox");
        this.addToCartButton = page.locator(".product-addtocart-button");
        this.couponCodeInput = page.locator("input[name='coupon_code']");
        this.applyCouponButton = page.getByRole('button', { name: 'Apply Discount' });
        this.applyCouponCodeButton = page.locator("#block-discount-heading");
        this.removeButton = page.getByRole('button', { name: 'Cancel Coupon' });
    }

    async revealCouponButton() {
        await expect(this.applyCouponCodeButton).toBeVisible({timeout: 60000});
        await this.applyCouponCodeButton.scrollIntoViewIfNeeded();
        await this.applyCouponCodeButton.click();

        await expect(this.couponCodeInput).toBeVisible({timeout: 60000});
    }

    async addToCart(url: string,productName: string) {
        await this.page.goto(url);
        await expect(this.policyButton).toBeVisible();
        await this.policyButton.scrollIntoViewIfNeeded();
        await this.policyButton.check();

        await this.addToCartButton.scrollIntoViewIfNeeded();
        await this.addToCartButton.click();

        const checkoutUrl = `${process.env.BASE_URL}/checkout/cart/`;
        await this.page.waitForURL(checkoutUrl);
        
        await expect(this.page.getByRole('strong').getByRole('link', { name: productName }),`${productName} should be in cart`).toBeVisible();      
    }

    async removeProduct(productName: string = process.env.PRODUCT_NAME!) {
        await this.page.goto(`${process.env.BASE_URL}/checkout/cart/`);

        const rowLocator = this.page.locator('#shopping-cart-table tbody tr', {
            hasText: productName
        });
        const removeButton = rowLocator.locator('.action-delete');
        
        await expect(removeButton).toBeVisible({timeout: 60000});
        await removeButton.scrollIntoViewIfNeeded();
        await removeButton.click();

        await expect(removeButton,`Button to remove specified product is not visible in the cart`).toBeHidden();
    }

    async applyCoupon(couponCode: string,isValid: boolean = true) {
        await this.page.goto(`${process.env.BASE_URL}/checkout/cart/`);
        await this.page.waitForLoadState('load');
        await this.revealCouponButton();
        
        await this.couponCodeInput.fill(couponCode);
        await this.applyCouponButton.scrollIntoViewIfNeeded();
        await this.applyCouponButton.click();

        await this.page.waitForLoadState('load')

        if(isValid) {
            await expect(this.removeButton).toBeVisible({timeout: 60000});
        }
        else{
            await this.revealCouponButton();
            await expect(this.couponCodeInput).toBeEmpty({timeout: 60000});
        }
    }

    async removeCoupon() {
        await this.page.goto(`${process.env.BASE_URL}/checkout/cart/`);
        await expect(this.removeButton).toBeVisible();
        await this.removeButton.scrollIntoViewIfNeeded();
        await this.removeButton.click();

        await this.page.waitForLoadState('load');
        await this.revealCouponButton();
        await expect(this.couponCodeInput).toBeEmpty({timeout: 60000});
    }
}

export default CartPage;