// This file generally contains all the logical functions where extraction of data from the parsed data is involved. 
// Don't get confused between the "utils.ts" file and "lib/actions/index.ts" file. 
// Both involve some logical parts but serves different purpose.

import { PriceHistoryItem, Product } from "../types";

const Notification = {
    WELCOME : "WELCOME",
    CHANGE_OF_STOCK : "CHANGE_OF_STOCK",
    LOWEST_PRICE : "LOWEST_PRICE",
    THRESHOLD_MET : "THRESHOLD_MET"
}

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(...elements : any) {
    for(const element of elements) {
        let priceText = element.text().trim();
        /*
            Testing all the cases...

            priceText = "678883.22222212.";    ---> 678883.22
            priceText = "19.444.2.2.222";      ---> 19.44
            priceText = "2342342.23232";       ---> 2342342.23
            priceText = "6868.";               ---> 6868.00
            priceText = "3434.2";              ---> 3434.20

            I want the cleanPrice to be in the format 
            [digits][one dot][either 2 digits or 1 digit 1 zero or 2 zeros]
        */

        if(priceText) {
            let isDot = false;
            let noOfDigitsAfterDot = 0;
            let cleanPrice = '';
            let flag = true;
            for(let i=0;i<priceText.length;i++) {
                if(priceText[i] >= '0' && priceText[i] <= '9') {
                    if(!isDot)
                        cleanPrice += priceText[i];
                    else if(isDot && noOfDigitsAfterDot < 2) {
                        cleanPrice += priceText[i];
                        noOfDigitsAfterDot++;
                    }
                }
                else if(priceText[i] == '.') {
                    if(!isDot) {
                        isDot = true;
                        cleanPrice += priceText[i];
                    } else if(isDot) 
                        flag = false;
                }
                if(!flag)
                    break;
            }
            if(!isDot)
                cleanPrice += '.';
            while(noOfDigitsAfterDot < 2) {
                cleanPrice += '0';
                noOfDigitsAfterDot++;
            }

            return cleanPrice;
        }

        return "";
    }
}

export function extractCurrency(element : any) {
    if(!element)   
        return;
    const currencyText = element.text().trim().slice(0,1);
    return currencyText ? currencyText : "";
}

export function extractDiscountRate(element : any) {
    if(!element)
        return;

    const discountRate = element.text().trim();
    let exactDiscountRate = "";
    for(let i=0;i<discountRate.length;i++) {
        if(discountRate[i] == '%')
            break;
        exactDiscountRate += discountRate[i];
    }

    return exactDiscountRate ? exactDiscountRate : "";
}

export function extractDescription(cheerioData : any) {
    const selectors = [
        ".a-unordered-list .a-list-item",
        ".a-expander-content p",
        // Add more selectors here if needed
      ];

      for (const selector of selectors) {
        const elements = cheerioData(selector);
        if (elements.length > 0) {
          const textContent = elements
            .map((_: any, element: any) => cheerioData(element).text().trim())
            .get()
            .join("\n");
          return textContent;
        }
      }

    return "";
}

export function getLowestPrice(priceHistory : PriceHistoryItem[]) {
    if(priceHistory.length == 0)
        return Number.MAX_VALUE;

    let lowestPrice = Number.MAX_VALUE;
    for(let element of priceHistory) {
        lowestPrice = Math.min(lowestPrice, element.price);
    }

    return lowestPrice;
}

export function getHighestPrice(priceHistory : PriceHistoryItem[]) {
    if(priceHistory.length == 0)
        return Number.MIN_VALUE;

    let highestPrice = Number.MIN_VALUE;
    for(let element of priceHistory) {
        highestPrice = Math.max(highestPrice, element.price);
    }

    return highestPrice;
}

export function getAveragePrice(priceHistory : PriceHistoryItem[]) {
    if(priceHistory.length == 0)
        return 0;

    let sum = 0, count = 0;
    for(let element of priceHistory) {
        sum += element.price;
        count++;
    }

    let averagePrice = sum / count;

    return averagePrice;
}

export const formatNumber = (num: number = 0) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
}

export const getNotificationType = (scrapedProduct : Product, currentProduct : Product) => {
    try {
        
        const lowestPriceFromPriceHistory = getLowestPrice(currentProduct.priceHistory);
        if(lowestPriceFromPriceHistory > scrapedProduct.currentPrice) {
            return Notification.LOWEST_PRICE as keyof typeof Notification;
        }
        if(currentProduct.isOutOfStock && !scrapedProduct.isOutOfStock) {
            return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
        }
        if(scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
            return Notification.THRESHOLD_MET as keyof typeof Notification;
        }

        return null;

    } catch (error : any) {
        console.log("Unable to fetch the notification");
        
    }
}