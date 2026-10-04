'use client'

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { resolveProductImageUrl } from '@/lib/store-data'

export interface SafeProductImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null
  fallbackSrc?: string
}

export function SafeProductImage({
  src,
  alt = 'Product image',
  fallbackSrc = '/images/product-morph-3d.png',
  className = '',
  ...props
}: SafeProductImageProps) {
  const initialResolved = resolveProductImageUrl(src || '') || fallbackSrc
  const [imgSrc, setImgSrc] = useState(initialResolved)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const nextResolved = resolveProductImageUrl(src || '') || fallbackSrc
    setImgSrc(nextResolved)
    setHasError(false)
  }, [src, fallbackSrc])

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      unoptimized
      onError={handleError}
    />
  )
}
