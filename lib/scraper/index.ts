"use server"    // want this component to be rendered on the server side. 

import axios from "axios";
import * as cheerio from 'cheerio'
import { extractCurrency, extractDescription, extractDiscountRate, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url : any) {
    if(!url)
        return;

    try {

        const username = String(process.env.BRIGHT_DATA_USERNAME);
        const password = String(process.env.BRIGHT_DATA_PASSWORD);
        const port = String(process.env.BRIGHT_DATA_PORT);
        const session_id = (1000000 * Math.random()) | 0;
        
        // No need to mug up the options syntax...It's provided in the BRIGHT DATA documentation, every software have their own syntax.
        const options = {
            auth : {
                username : `${username}-session-${session_id}`,
                password
            },
            host : 'brd.superproxy.io',
            port,
            rejectUnauthorized : false
        }

        const response = await axios.get(url, options);   // I am saying to BRIGHT DATA(i.e., options) to fetch me all the data from the given url.

        // console.log(response.data);    // This data will be shown in the VS Code console, not in the browser console. 
        /*
            VSCode Console - Server rendering components 
            Browser Console - Client rendering components 
        */

        // Scrapping of data is done now, from here parsing of data will be going on.
        /* 
            We basically have 3 steps - Scraping of data 
                                      - Parsing of data 
                                      - Extracting the relevant data out of all data
        */

        const cheerioData = cheerio.load(response.data);  // scraped data of the product page

        // Getting all the details of the product
        const title = cheerioData('#productTitle').text().trim();  // Get the productTitle, extract only the text out of productTitle and then trim the leading and trailing whitespaces from the string.

        const currentPrice = extractPrice(
                cheerioData('.priceToPay span.a-price-whole').first(),
                cheerioData('.a.size.base.a-color-price').first(),
                cheerioData('.a-button-selected .a-color-base').first(),
            );

            if(!currentPrice)
                console.log("Current Price is not present... some error ");
            // console.log("Current Price --------------> " + currentPrice);

        const originalPrice = extractPrice(
                cheerioData('#priceblock_ourprice'),
                cheerioData('.a-price.a-text-price span.a-offscreen'),
                cheerioData('#listPrice'),
                cheerioData('#priceblock_dealprice'),
                cheerioData('.a-size-base.a-color-price')
            );

        const outOfStock = cheerioData('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = 
        cheerioData('#imgBlkFront').attr('data-a-dynamic-image') || 
        cheerioData('#landingImage').attr('data-a-dynamic-image') ||
        '{}';

        const imageUrls = Object.keys(JSON.parse(images));
        const currency = extractCurrency(cheerioData('.a-price-symbol'));

        const discountRate = extractDiscountRate(cheerioData('.savingsPercentage'));

        const description = extractDescription(cheerioData);

        // console.log(title, currentPrice, originalPrice, outOfStock, images, imageUrls, currency, discountRate, description);

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount:100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        };

        // console.log(data);

        return data;
    } catch (error : any) {
        console.log(`Failed to scrape the product. Error : ${error.message}`);
        
    }
}