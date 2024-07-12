import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

// List of icons for the right side of navbar - search, heart and profile
const navIcons = [
  { src: '/assets/icons/search.svg', alt: 'search' },
  { src: '/assets/icons/black-heart.svg', alt: 'heart' },
  { src: '/assets/icons/user.svg', alt: 'user' },
]

const Navbar = () => {
  return (
    <header className="w-full">
      <nav className="nav">

        {/* Whenever you click either on the logo or the test "PricePulse", it will route you to the homepaage. */}
        <Link href="/" className="flex items-center gap-1">
          <Image 
            src="/assets/icons/logo.svg"
            width={27}
            height={27}
            alt="logo"
          />

          <p className="nav-logo">
            Price<span className='text-primary'>Pulse</span>
          </p>
        </Link>


        <div className="flex items-center gap-5">
          {navIcons.map((icon) => (
              /* 
              For the image tag, 
                - Single image => No key is required. 
                - List of images rendering dynamically - Key is required. Else, react will not be able to track the changes properly, leading to potential rendering bugs. 
              */ 
            <Image 
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className="object-contain"
            />
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar