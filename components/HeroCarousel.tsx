"use client"   // In this component, we are client side rendering as here also we want interactivity. For the carousel part, we also have the buttons at the bottom of the carousel page, which is clickable. So, basically it is similar to the event handlers (onClick or onChange). 

import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import { Carousel } from 'react-responsive-carousel';
import Image from "next/image";

const heroImages = [
    { imgUrl: '/assets/images/hero-1.svg', alt: 'smartwatch'},
    { imgUrl: '/assets/images/hero-2.svg', alt: 'bag'},
    { imgUrl: '/assets/images/hero-3.svg', alt: 'lamp'},
    { imgUrl: '/assets/images/hero-4.svg', alt: 'air fryer'},
    { imgUrl: '/assets/images/hero-5.svg', alt: 'chair'},
  ]

const HeroCarousel = () => {
  return (
    <div className="hero-carousel">
        <Carousel
        showThumbs={false}
        autoPlay
        interval = {2000}
        infiniteLoop
        showArrows={false}
        showStatus={false}
        >
            {heroImages?.map((image) => (
                <Image 
                key = {image.alt}
                src = {image.imgUrl}
                alt = {image.alt}
                width={484}
                height={484}
                className="object-contain"
                />
            ))}
        </Carousel>

        {/* For the arrow at the bottom of the carousel which is pointing to the search bar, just to seek the customer's attention to search something. The arrow will only be present if the size of the screen is greater than a particular threshold screen size. */}
        <Image 
            src="assets/icons/hand-drawn-arrow.svg"
            alt="arrow"
            width={175}
            height={175}
            className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
        />
    </div>
  )
}

export default HeroCarousel