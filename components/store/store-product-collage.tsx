'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Film,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react'
import { resolveProductImageUrl } from '@/lib/store-data'

interface StoreProductCollageProps {
  images?: string[]
  primaryImage: string
  title: string
  badge?: string
  sampleVideoUrl?: string
  className?: string
}

export function StoreProductCollage({
  images = [],
  primaryImage,
  title,
  badge,
  sampleVideoUrl,
  className = '',
}: StoreProductCollageProps) {
  // Normalize images list (maximum 6)
  const allImages = Array.isArray(images) && images.length > 0
    ? Array.from(new Set(images.filter(Boolean).map(resolveProductImageUrl))).slice(0, 6)
    : [resolveProductImageUrl(primaryImage) || '/images/product-morph-3d.png']

  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const nextLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Handle keyboard navigation for lightbox
  React.useEffect(() => {
    if (!isLightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % allImages.length)
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, allImages.length])

  // Single Image Display
  if (allImages.length <= 1) {
    return (
      <div className={`relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden border border-[#E6E6E3] bg-zinc-100 group shadow-xs ${className}`}>
        <Image
          src={allImages[0]}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-103 transition-transform duration-300 cursor-pointer"
          onClick={() => openLightbox(0)}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
          {badge && (
            <div className="bg-[#141414] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {badge}
            </div>
          )}
          {sampleVideoUrl && (
            <div className="bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Film className="w-2.5 h-2.5" />
              <span>ВИДЕОТОЙ</span>
            </div>
          )}
        </div>

        {/* Expand Icon */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          title="Томруулж үзэх"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {renderLightbox()}
      </div>
    )
  }

  // Multi-Image Collage Display (2 to 6 images)
  return (
    <div className={`w-full flex flex-col gap-2.5 ${className}`}>
      {/* Dynamic Collage Container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-[#E6E6E3] bg-zinc-100 shadow-xs">
        {/* Render Collage by Count */}
        {renderCollageGrid(allImages, openLightbox, setActiveIndex)}

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
          {badge && (
            <div className="bg-[#141414] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {badge}
            </div>
          )}
          {sampleVideoUrl && (
            <div className="bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Film className="w-2.5 h-2.5" />
              <span>ВИДЕОТОЙ</span>
            </div>
          )}
          <div className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Layers className="w-2.5 h-2.5 text-[#00B0FF]" />
            <span>{allImages.length} ЗУРАГ</span>
          </div>
        </div>

        {/* Expand button */}
        <button
          type="button"
          onClick={() => openLightbox(activeIndex)}
          className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer z-10"
          title="Бүх зургийг галерейгаар үзэх"
        >
          <Maximize2 className="w-3 h-3 text-[#00B0FF]" />
          <span>Бүгдийг үзэх ({allImages.length})</span>
        </button>
      </div>

      {/* Interactive Thumbnail Filmstrip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveIndex(idx)
              openLightbox(idx)
            }}
            className={`relative w-14 h-11 sm:w-16 sm:h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
              activeIndex === idx
                ? 'border-[#0088CC] shadow-xs scale-102 ring-2 ring-[#0088CC]/20'
                : 'border-zinc-200 hover:border-zinc-400 opacity-75 hover:opacity-100'
            }`}
          >
            <Image
              src={img}
              alt={`${title} - зураг ${idx + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
            {idx === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center font-mono py-0.2">
                Үндсэн
              </span>
            )}
          </button>
        ))}
      </div>

      {renderLightbox()}
    </div>
  )

  // Lightbox Modal
  function renderLightbox() {
    if (!isLightboxOpen) return null

    return (
      <div
        onClick={() => setIsLightboxOpen(false)}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
      >
        {/* Top Controls */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-300">{title}</span>
            <span className="text-[11px] font-mono text-zinc-400">
              ({lightboxIndex + 1} / {allImages.length})
            </span>
          </div>

          <button
            onClick={() => setIsLightboxOpen(false)}
            className="p-2 text-zinc-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            title="Хаах (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Main Image with Prev / Next */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-5xl max-h-[80vh] w-full h-[70vh] flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            <Image
              src={allImages[lightboxIndex]}
              alt={`${title} - зураг ${lightboxIndex + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Left Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={prevLightbox}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white hover:text-[#00B0FF] transition-all cursor-pointer"
              title="Өмнөх зураг"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={nextLightbox}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white hover:text-[#00B0FF] transition-all cursor-pointer"
              title="Дараагийн зураг"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnails */}
        {allImages.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 overflow-x-auto px-4 z-20"
          >
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-14 h-11 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  lightboxIndex === idx
                    ? 'border-[#00B0FF] scale-105 shadow-md'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
}

/**
 * Grid rendering engine depending on 1, 2, 3, 4, 5, or 6 images
 */
export function renderCollageGrid(
  images: string[],
  onOpen: (index: number) => void,
  onHover: (index: number) => void
) {
  const count = images.length

  // 1 Image fallback
  if (count <= 1) {
    const single = images[0] || '/images/product-morph-3d.png'
    return (
      <div
        onClick={() => onOpen(0)}
        onMouseEnter={() => onHover(0)}
        className="relative w-full h-full aspect-[16/10] sm:aspect-[4/3] overflow-hidden group cursor-pointer bg-zinc-100"
      >
        <Image
          src={single}
          alt="Product image"
          fill
          sizes="100vw"
          className="object-cover group-hover:scale-103 transition-transform duration-300"
        />
      </div>
    )
  }

  // 2 Images: 50% / 50% split collage
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 aspect-[16/10] sm:aspect-[4/3]">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => onOpen(idx)}
            onMouseEnter={() => onHover(idx)}
            className="relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
          >
            <Image
              src={img}
              alt={`Collage ${idx + 1}`}
              fill
              sizes="50vw"
              className="object-cover group-hover:scale-104 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          </div>
        ))}
      </div>
    )
  }

  // 3 Images: 1 large left (65%) + 2 stacked right (35%)
  if (count === 3) {
    return (
      <div className="grid grid-cols-12 gap-1 aspect-[16/10] sm:aspect-[4/3]">
        <div
          onClick={() => onOpen(0)}
          onMouseEnter={() => onHover(0)}
          className="col-span-8 relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
        >
          <Image
            src={images[0]}
            alt="Collage 1"
            fill
            sizes="65vw"
            className="object-cover group-hover:scale-103 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
        </div>
        <div className="col-span-4 grid grid-rows-2 gap-1 h-full">
          {images.slice(1, 3).map((img, idx) => (
            <div
              key={idx + 1}
              onClick={() => onOpen(idx + 1)}
              onMouseEnter={() => onHover(idx + 1)}
              className="relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
            >
              <Image
                src={img}
                alt={`Collage ${idx + 2}`}
                fill
                sizes="35vw"
                className="object-cover group-hover:scale-104 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 4 Images: 1 Large Left (60%) + 3 Stacked Right (40%)
  if (count === 4) {
    return (
      <div className="grid grid-cols-12 gap-1 aspect-[16/10] sm:aspect-[4/3]">
        <div
          onClick={() => onOpen(0)}
          onMouseEnter={() => onHover(0)}
          className="col-span-7 relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
        >
          <Image
            src={images[0]}
            alt="Collage 1"
            fill
            sizes="60vw"
            className="object-cover group-hover:scale-103 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
        </div>
        <div className="col-span-5 grid grid-rows-3 gap-1 h-full">
          {images.slice(1, 4).map((img, idx) => (
            <div
              key={idx + 1}
              onClick={() => onOpen(idx + 1)}
              onMouseEnter={() => onHover(idx + 1)}
              className="relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
            >
              <Image
                src={img}
                alt={`Collage ${idx + 2}`}
                fill
                sizes="40vw"
                className="object-cover group-hover:scale-104 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 5 Images: 1 Large Left (60%) + 2x2 Grid Right (40%)
  if (count === 5) {
    return (
      <div className="grid grid-cols-12 gap-1 aspect-[16/10] sm:aspect-[4/3]">
        <div
          onClick={() => onOpen(0)}
          onMouseEnter={() => onHover(0)}
          className="col-span-7 relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
        >
          <Image
            src={images[0]}
            alt="Collage 1"
            fill
            sizes="60vw"
            className="object-cover group-hover:scale-103 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
        </div>
        <div className="col-span-5 grid grid-cols-2 grid-rows-2 gap-1 h-full">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={idx + 1}
              onClick={() => onOpen(idx + 1)}
              onMouseEnter={() => onHover(idx + 1)}
              className="relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
            >
              <Image
                src={img}
                alt={`Collage ${idx + 2}`}
                fill
                sizes="25vw"
                className="object-cover group-hover:scale-104 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 6 Images: 1 Hero Top/Left + 5 Balanced Grid Mosaic
  return (
    <div className="grid grid-cols-12 gap-1 aspect-[16/10] sm:aspect-[4/3]">
      <div
        onClick={() => onOpen(0)}
        onMouseEnter={() => onHover(0)}
        className="col-span-7 relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
      >
        <Image
          src={images[0]}
          alt="Collage 1"
          fill
          sizes="60vw"
          className="object-cover group-hover:scale-103 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
      </div>
      <div className="col-span-5 grid grid-cols-2 grid-rows-3 gap-1 h-full">
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx + 1}
            onClick={() => onOpen(idx + 1)}
            onMouseEnter={() => onHover(idx + 1)}
            className="relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
          >
            <Image
              src={img}
              alt={`Collage ${idx + 2}`}
              fill
              sizes="20vw"
              className="object-cover group-hover:scale-104 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          </div>
        ))}
        {/* 6th tile spans full width of the remaining row */}
        {images[5] && (
          <div
            onClick={() => onOpen(5)}
            onMouseEnter={() => onHover(5)}
            className="col-span-2 relative h-full overflow-hidden group cursor-pointer bg-zinc-100"
          >
            <Image
              src={images[5]}
              alt="Collage 6"
              fill
              sizes="40vw"
              className="object-cover group-hover:scale-104 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          </div>
        )}
      </div>
    </div>
  )
}
