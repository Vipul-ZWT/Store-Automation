import {Locator, Page,expect} from '@playwright/test';

class LoginPage {
    readonly page:Page;
    readonly email:Locator;
    readonly password:Locator;
    readonly loginButton: Locator;

    constructor(page:Page){
        this.page = page;
        this.email = page.locator("input[name='login[username]']");
        this.password = page.locator("input[name='login[password]']");
        this.loginButton = page.getByRole('button', {name: 'Sign In'});
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
}

export default LoginPage;