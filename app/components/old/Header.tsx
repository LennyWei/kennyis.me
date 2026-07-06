'use client'

import React from 'react'

export default function Header() {
  return (
    <header className="w-full h-16 flex items-center justify-between px-4 bg-gray-100 border-4 border-gray-900 ">
        <h1 className="text-xl font-bold text-gray-950 ">Kenny Liang</h1>
        <nav>
            <ul className="flex gap-4">
                <li><a href="#" className="text-gray-800 hover:text-gray-950 font-bold">Home</a></li>
                <li><a href="#" className="text-gray-800 hover:text-gray-950 font-bold">About</a></li>
                <li><a href="#" className="text-gray-800 hover:text-gray-950 font-bold">Projects</a></li>
                <li><a href="#" className="text-gray-800 hover:text-gray-950 font-bold">Contact</a></li>
            </ul>
        </nav>
    </header>
  )
}

// shadow-[6px_6px_0_0_rgba(17,17,17,1)]