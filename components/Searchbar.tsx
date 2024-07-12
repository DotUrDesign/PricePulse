"use client"   // This is used when we want this component to be rendered on the client side, by default next-js supports server side rendering. We have used client side rendering for this component, as we want interactivity( event handlers - onClick or onChange ) and hooks ( useState or useEffect) 

import { scrapeAndStoreProduct } from '@/lib/actions';
import React, { FormEvent } from 'react'
import { useState } from 'react'

const isValidAmazonProductURL = (url : string) => {
    try {
      
        const parsedUrl = new URL(url);  // creates a URL object and takes string(url) as an argument, if url is invalid(meaning not a string), it simply throws an error in the first place.

        const hostName = parsedUrl.hostname;  // Get the hostname like 'www.amazon.com'

        if(hostName.includes('amazon.com') || hostName.includes('amazon') || hostName.includes('amazon.')) {
          return true;
        }

    } catch (error) {
      return false;
    }

    return false;
}

const Searchbar = () => {
    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();    // prevent reloading the page everytime I click on submit button

        const isValidUrl = isValidAmazonProductURL(searchPrompt);

        if(!isValidUrl) {
          alert('Please provide a valid Amazon link');
        }

        try {

          setIsLoading(true);
          const product = await scrapeAndStoreProduct(searchPrompt);
          setSearchPrompt('');   // clear the input field after the data is scraped and stored.

        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
    }

  return (

    // Just a simple form, within which there is an input field and a search button 
    <form
       className = "flex flex-wrap gap-4 mt-12"
       onSubmit = {handleSubmit}
    >
      <input
        type = "text"
        value = {searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder='Enter product link'
        className = "searchbar-input"
      >
      </input>
      
      <button
        type="submit"
        className = "searchbar-btn"
        disabled={searchPrompt === '' ? true : false}
      >
        {isLoading == true ? 'Searching...' : 'Search'}
      </button>
        
    </form>
  )
}

export default Searchbar