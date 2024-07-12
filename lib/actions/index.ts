"use server"

// This file generally contains all the functions which involves the fetching of data from the database. 
// Don't get confused between the "utils.ts" file and "lib/actions/index.ts" file. 
// Both involve some logical parts but serves different purpose.

import { revalidatePath } from "next/cache";
import productModel from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";


// this function will do 2 things - first scrape the product using  brightData and then store the data into the DB
export async function scrapeAndStoreProduct(productUrl : string) {
    if(!productUrl) return;

    try {
        
        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        connectToDB();

        if(!scrapedProduct)
            return;

        /*
            CASES -
            -> product is present in the DB => update the product details
            -> product is not present in the DB => insert a new one
        */

        // const existingProduct = await productModel.findOne({ url : scrapedProduct.url });   ---> Why this one is not working ??

        const existingProduct = await productModel.findOne({ url: productUrl });

        // console.log(productUrl);
        // console.log("Scraped Product Data is starts here --------------------------------->>>>>>>>>");
        // console.log(scrapedProduct);
        // console.log("Scraped Product Data is ends here --------------------------------->>>>>>>>>");
        
        let newProduct;
        if(existingProduct) {
            console.log(existingProduct);

            // scrapedProduct.currentPrice = 12000;

            let updatedPriceHistory = existingProduct.priceHistory;
            updatedPriceHistory.push({
                price : scrapedProduct.currentPrice,
            });

            const product = {
                ...scrapedProduct,
                priceHistory : updatedPriceHistory,
                lowestPrice : getLowestPrice(updatedPriceHistory),
                highestPrice : getHighestPrice(updatedPriceHistory),
                averagePrice : getAveragePrice(updatedPriceHistory)
            };

            const updatedProduct = await productModel.updateOne(
                {url : productUrl},
                product
            );

            newProduct = updatedProduct;

            // console.log("Updated Product details starts from here ------------------->>>>>>>>>>>>>>>>>");
            // console.log(updatedProduct);
            // console.log("Updated Product details ends here ------------------->>>>>>>>>>>>>>>>>");
        }
        else {
            const updatedPriceHistory = [];
            updatedPriceHistory.push({ price : scrapedProduct.currentPrice});

            const product = {
                ...scrapedProduct,
                priceHistory : updatedPriceHistory
            }
            const productDetails = await productModel.create(
                product
            );

            newProduct = productDetails;

            // console.log(productDetails);
        }

        /*
            IMPORTANCE OF THIS REVALIDATE LINE - 
            -> Even if, we don't implement the caching feature for our website, NextJS has in-built caching feature for optimisation purposes. 
            -> So, when a new product details is saved in the DB, the new user making a request to fetch the product details, has no guarantee that the request will be routing to the DB, it can route to the cached data too. And if we don't write the revalidate code, the cached data will store the stale product details. 
            -> Basically in the below line, we are invalidating the stale data and updating the new data of the product details.
        */
        revalidatePath(`/products/${newProduct._id}`); 

    } catch (error : any) {
        console.log(error.message);
    }
}

export async function getProductById(productId : string) {
    if(!productId)
        return;
    try {
        connectToDB();
        const productDetails = await productModel.findOne({ _id : productId});
        if(!productDetails)
            return null;
        console.log(productDetails);
        return productDetails;
    } catch (error : any) {
        throw new Error(`Unable to fetch the product. Error : ${error.message}`);     
    }
}
 
export async function getAllProducts() {
    try {
        connectToDB();
        const allProducts = await productModel.find();
        if(!allProducts) {
            console.log("Nothing is present in the DB");
            return;
        }
        return allProducts;
    } catch (error : any) {
        console.log(error.message);
    }
}

export async function getSimilarProducts(productId : string) {
    if(!productId)
        return;
    try {
        connectToDB();

    const currentProduct = await productModel.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await productModel.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
    } catch (error : any) {
        console.log(error.message);
    }
}

export async function addUserEmailToProduct(productId : string, userEmail : string) {
    try {
        
        if(!productId) {
            console.log("Product Id is invalid");
            return;
        }
        let product = await productModel.findOne({ _id : productId});
        if(!product) {
            console.log("No such product found");
            return;
        }

        let checkUserExists = false;
        for(const user of product.users) {
            if(userEmail === user.email) {
                checkUserExists = true;
                break;
            }
        }

        if(!checkUserExists) {
            console.log("User does not exists in DB");
            console.log("User mail : " + userEmail);
            product.users.push({email : userEmail});
            await product.save();
            const emailContent = await generateEmailBody(product.url, product.title, "WELCOME");

            console.log(emailContent?.body, emailContent?.subject);

            if(!emailContent)
                return;

            await sendEmail(emailContent, [userEmail]);
        }

    } catch (error : any) {
        console.log(error.message);
    }
}

