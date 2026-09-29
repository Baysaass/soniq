/**
 * Image Processing Utility
 * Converts any image format (PNG, JPG, GIF, AVIF, etc.) to optimized WebP.
 * Resizes to optimal e-commerce display resolution and compresses file size.
 */

export interface ConvertedWebPResult {
  file: File
  blob: Blob
  dataUrl: string
  width: number
  height: number
  originalSize: number
  convertedSize: number
  originalName: string
}

export interface ConvertImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Converts a single File to an optimized .webp File + DataURL using HTML5 Canvas.
 */
export async function convertImageFileToWebP(
  file: File,
  options: ConvertImageOptions = {}
): Promise<ConvertedWebPResult> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = options

  return new Promise((resolve, reject) => {
    // If not in a browser environment, throw error
    if (typeof window === 'undefined') {
      return reject(new Error('Browser environment required for canvas conversion'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Зургийн файлыг уншиж чадсангүй.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Зургийн форматыг уншихад алдаа гарлаа.'))
      img.onload = () => {
        try {
          // Calculate aspect ratio and new dimensions
          let { width, height } = img

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          // Create canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            return reject(new Error('Canvas 2D context үүсгэж чадсангүй.'))
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw image
          ctx.drawImage(img, 0, 0, width, height)

          // Generate dataUrl
          const dataUrl = canvas.toDataURL('image/webp', quality)

          // Generate Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('WebP хөрвүүлэлт амжилтгүй боллоо.'))
              }

              // Sanitize filename and replace extension with .webp
              const rawName = file.name.replace(/\.[^/.]+$/, '')
              const cleanName = rawName
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '-')
                .replace(/-+/g, '-')
              const webpFileName = `${cleanName}-${Date.now()}.webp`

              const webpFile = new File([blob], webpFileName, { type: 'image/webp' })

              resolve({
                file: webpFile,
                blob,
                dataUrl,
                width,
                height,
                originalSize: file.size,
                convertedSize: blob.size,
                originalName: file.name,
              })
            },
            'image/webp',
            quality
          )
        } catch (err: any) {
          reject(new Error(err?.message || 'WebP хөрвүүлэлтийн явцад алдаа гарлаа.'))
        }
      }

      img.src = reader.result as string
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Format bytes into human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
