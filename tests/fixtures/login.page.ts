import {Locator, Page,expect} from '@playwright/test';

class LoginPage {
    readonly page:Page;
    readonly email:Locator;
    readonly password:Locator;
    readonly loginButton: Locator;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly registrationEmail: Locator;
    readonly registrationPassword: Locator;
    readonly passwordConfirmation: Locator;
    readonly createAccountButton: Locator;

    constructor(page:Page){
        this.page = page;
        this.email = page.locator("input[name='login[username]']");
        this.password = page.locator("input[name='login[password]']");
        this.loginButton = page.getByRole('button', {name: 'Sign In'});
        this.firstName = page.locator("#firstname");
        this.lastName = page.locator("#lastname");
        this.registrationEmail = page.locator("#email_address");
        this.registrationPassword = page.locator("#password");
        this.passwordConfirmation = page.locator("#password-confirmation");
        this.createAccountButton = page.getByRole('button', {name: 'Create an Account'});
    }

    async login(email:string, password:string){
        await this.email.fill(email);
        await this.password.fill(password);
        await this.loginButton.click();
    }

    async completeLogin(email:string, password:string){
        await this.page.goto(`${process.env.BASE_URL}/customer/account/login/`);

        await this.login(email,password);

        await this.page.waitForLoadState('networkidle');
        
        const loginStatus = await this.page.evaluate(() => {
            return localStorage.getItem('mage-customer-login');
        });

        expect(loginStatus).toBe("1")
    }

    async createAccount(){
        await this.page.goto(`${process.env.BASE_URL}/customer/account/create/`);
        await this.firstName.fill(process.env.AFFILIATE_FIRST_NAME!);
        await this.lastName.fill(process.env.AFFILIATE_LAST_NAME!);
        await this.registrationEmail.fill(process.env.AFFILIATE_CUSTOMER_EMAIL!);
        await this.registrationPassword.fill(process.env.AFFILIATE_CUSTOMER_PASSWORD!);
        await this.passwordConfirmation.fill(process.env.AFFILIATE_CUSTOMER_PASSWORD!);
        await this.createAccountButton.scrollIntoViewIfNeeded();
        await this.createAccountButton.click();

        await this.page.waitForURL(`${process.env.BASE_URL}/customer/account/`)
    }
}

export default LoginPage;