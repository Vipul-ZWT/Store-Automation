import gmail from "gmail-tester";
import path from "path";
import { expect } from "@playwright/test";

class Email {
    async checkEmail(subject: string){
        const email = await gmail.check_inbox(
            path.resolve('credentials.json'),
            path.resolve('token.json'),
            {
                subject: subject,
                max_wait_time_sec: 60,
                wait_time_sec: 10,
                include_body: true,
                label: 'SENT'
            }
        );

        console.log(email);
        
        expect(email).toBeTruthy();
    }
    
}

export default Email;