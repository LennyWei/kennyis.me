'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from "next/image";

export type CarouselImage = {
  src: string
  alt?: string
  href?: string
  onClick?: () => void
}

export type CarouselProps = {
  images: CarouselImage[]
  intervalMs?: number
  className?: string
}

export default function Carousel({ images, intervalMs = 3000, className = '' }: CarouselProps) {
    
    const [index, setIndex] = useState(0)
    const count = images.length

    const safeImages = useMemo(() => images.filter(Boolean), [images])

    useEffect(() => {
        if (count <= 1) return
        const id = setInterval(() => {
        setIndex((prev) => (prev + 1) % count)
        }, intervalMs)
        return () => clearInterval(id)
    }, [count, intervalMs])

    if (safeImages.length === 0) return null

    return (
        <div className={`w-full overflow-hidden border-4 border-gray-900 shadow-[6px_6px_0_0_rgba(17,17,17,1)] ${className}`}>
        <div
            className="flex m-10 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
        >
            {safeImages.map((img, i) => {
            const content = (
                <img
                src={img.src}
                alt={img.alt ?? `Slide ${i + 1}`}
                className="w-full h-64 object-cover cursor-pointer select-none"
                onClick={img.onClick}
                draggable={false}
                />
            )

            return (
                <div key={`${img.src}-${i}`} className="min-w-full">
                {img.href ? (
                    <a href={img.href} aria-label={img.alt ?? `Slide ${i + 1}`}>
                    {content}
                    </a>
                ) : (
                    content
                )}
                </div>
            )
            })}
        </div>
        </div>
    )
}