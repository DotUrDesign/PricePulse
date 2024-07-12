"use server";

const nodemailer = require("nodemailer");

const AppNotification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
}


export async function generateEmailBody(productUrl : string, productTitle : string, notificationType : string) {
    try {

        if(!notificationType || !productTitle || !productUrl)
            return;

        const THRESHOLD_PERCENTAGE = 40;

        const shortenedTitle = productTitle.length > 20 ? `${productTitle.substring(0, 20)}` : productTitle;
        
        let subject = "";
        let body = "";

        switch(notificationType) {
            case AppNotification.WELCOME:
                subject = `Welcome to Price Tracking for ${shortenedTitle}`;
                body = `
                    <div>
                    <h2>Welcome to PricePulse 🚀</h2>
                    <p>You are now tracking ${productTitle}.</p>
                    <p>Here's an example of how you'll receive updates:</p>
                    <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
                        <h3>${productTitle} is back in stock!</h3>
                        <p>We're excited to let you know that ${productTitle} is now back in stock.</p>
                        <p>Don't miss out - <a href="${productUrl}" target="_blank" rel="noopener noreferrer">buy it now</a>!</p>
                        <img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Product Image" style="max-width: 100%;" />
                    </div>
                    <p>Stay tuned for more updates on ${productTitle} and other products you're tracking.</p>
                    </div>
                `;
                break;

                case AppNotification.CHANGE_OF_STOCK:
                subject = `${shortenedTitle} is now back in stock!`;
                body = `
                    <div>
                    <h4>Hey, ${productTitle} is now restocked! Grab yours before they run out again!</h4>
                    <p>See the product <a href="${productUrl}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                    </div>
                `;
                break;

                case AppNotification.LOWEST_PRICE:
                subject = `Lowest Price Alert for ${shortenedTitle}`;
                body = `
                    <div>
                    <h4>Hey, ${productTitle} has reached its lowest price ever!!</h4>
                    <p>Grab the product <a href="${productUrl}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
                    </div>
                `;
                break;

                case AppNotification.THRESHOLD_MET:
                subject = `Discount Alert for ${shortenedTitle}`;
                body = `
                    <div>
                    <h4>Hey, ${productTitle} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
                    <p>Grab it right away from <a href="${productUrl}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                    </div>
                `;
                break;

                default:
                throw new Error("Invalid AppNotification type.");

        }

        return {subject, body};

    } catch (error : any) {
        console.log(error.message);
    }
}

interface Props {
    subject : string, 
    body : string
};

const transporter = nodemailer.createTransport({
    pool: true,
    service: 'hotmail',
    port: 2525,
    auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD
    },
    maxConnections: 1
})

export async function sendEmail(emailContent : Props , userEmail : string[]) {
    try {
        
        const mailOptions = {
            from : process.env.NODEMAILER_USERNAME,
            to: userEmail,
            html : emailContent.body,
            subject : emailContent.subject
        }

        transporter.sendMail(mailOptions, (error : any, info : any) => {
            if(error)
                return console.log(error);

            return console.log(info);
        }) 

    } catch (error : any) {
        console.log(error.message);
    }
}