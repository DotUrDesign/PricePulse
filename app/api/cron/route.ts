import productModel from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice, getNotificationType } from "@/lib/utils";

export async function GET(request : Request) {
    try {
        
        connectToDB();
        const products = await productModel.find();
        if(!products)
            throw new Error("No product found");

        for(const currentProduct of products) 
        {
            // scraping from the website - original
            // update in DB
            // send email - comparison between the previous product in the DB and the scraped Product from the website

            // STEP-1: scraping from the website - original
            console.log(currentProduct.url);
            const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

            if(!scrapedProduct)
                return;

            // STEP-2: updating the original contents in the DB
            const updatedPriceHistory = currentProduct.priceHistory;
            updatedPriceHistory.push({price : currentProduct.currentPrice});

            const product = {
                ...scrapedProduct,
                updatedPriceHistory,
                lowestPrice : getLowestPrice(updatedPriceHistory),
                highestPrice : getHighestPrice(updatedPriceHistory),
                averagePrice : getAveragePrice(updatedPriceHistory)
            }

            const updatedProduct = await productModel.findOneAndUpdate(
                {url : currentProduct.url},
                product
            )

            if(updatedProduct.users.length == 0)
                return;

            // STEP-3: send the email - emailContent, sendEmail
            // emailContent - body, subject

            // get the notification type 
            const notificationType = await getNotificationType(scrapedProduct, currentProduct);

            if(!notificationType)
                return;

            // get the email body and subject 
            const emailContent = await generateEmailBody(scrapedProduct.url, scrapedProduct.title,notificationType);

            if(!emailContent)
                return;

            // send the mail
            await sendEmail(emailContent, updatedProduct.users);

        }

    } catch (error : any) {
        console.log(error.message);
        
    }
}