'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Play, Film, Sparkles, ExternalLink, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react'

export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'none'
  embedUrl?: string
  directUrl?: string
}

export function getVideoEmbedInfo(url?: string): VideoEmbedInfo {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { type: 'none' }
  }
  const trimmed = url.trim()

  // YouTube matchers:
  // e.g. https://www.youtube.com/watch?v=VIDEO_ID
  // e.g. https://youtu.be/VIDEO_ID
  // e.g. https://www.youtube.com/embed/VIDEO_ID
  // e.g. https://www.youtube.com/shorts/VIDEO_ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const ytMatch = trimmed.match(ytRegex)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    }
  }

  // Vimeo matchers:
  // e.g. https://vimeo.com/VIDEO_ID
  // e.g. https://player.vimeo.com/video/VIDEO_ID
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)|player\.vimeo\.com\/video\/(\d+))/i
  const vimeoMatch = trimmed.match(vimeoRegex)
  const vimeoId = vimeoMatch ? vimeoMatch[3] || vimeoMatch[4] : null
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`,
    }
  }

  // Direct video (mp4, webm, or other streaming URLs)
  return {
    type: 'direct',
    directUrl: trimmed,
  }
}

interface StoreSampleVideoProps {
  videoUrl?: string
  productTitle: string
  posterImage?: string
  subtitle?: string
}

export function StoreSampleVideo({
  videoUrl,
  productTitle,
  posterImage,
  subtitle,
}: StoreSampleVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const videoInfo = getVideoEmbedInfo(videoUrl)

  if (videoInfo.type === 'none') {
    return null
  }

  return (
    <div className="bg-white border border-[#E6E6E3] rounded-2xl p-4 sm:p-6 shadow-xs mb-8 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 mb-4 border-b border-[#E6E6E3]">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0088CC] uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" />
            <span>БОДИТ ҮЗҮҮЛЭХ БИЧЛЭГ • SAMPLE VIDEO</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#141414] mt-0.5 tracking-tight">
            {productTitle} ашигласан бодит үр дүн
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {subtitle || 'Энэ багцын дуу болон эффектүүд видео төсөлд хэрхэн зохицож буйг үзнэ үү.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>4K / 1080p 60fps</span>
          </span>
          <span className="text-[10px] font-semibold text-zinc-400">Timeline In-Action</span>
        </div>
      </div>

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-900 shadow-md group">
        {!isPlaying ? (
          /* Thumbnail / Poster Overlay with Play Button */
          <div className="relative w-full h-full">
            {posterImage && (
              <Image
                src={posterImage}
                alt={productTitle}
                fill
                className="object-cover opacity-80 group-hover:opacity-90 group-hover:scale-102 transition-all duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

            {/* Center Play Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 hover:bg-white text-[#141414] flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110 cursor-pointer"
                title="Бичлэг тоглуулах"
              >
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1 text-[#141414]" />
              </button>

              <div className="text-center px-4">
                <span className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-semibold text-xs shadow-sm">
                  Үзүүлэх бичлэгийг үзэх (Click to Play)
                </span>
                <p className="text-[11px] text-zinc-300 mt-1 font-mono">
                  дууны чанар болон динамикийг чихэвчээр сонсохыг зөвлөж байна
                </p>
              </div>
            </div>

            {/* Bottom Info bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 px-2">
              <span className="font-semibold text-xs truncate max-w-xs">{productTitle}</span>
              <span className="text-[10px] font-mono text-zinc-300 bg-black/40 px-2 py-0.5 rounded">
                Video Demo
              </span>
            </div>
          </div>
        ) : (
          /* Active Playing State */
          <div className="w-full h-full">
            {videoInfo.type === 'youtube' && videoInfo.embedUrl && (
              <iframe
                src={videoInfo.embedUrl}
                title={`${productTitle} Video Preview`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}

            {videoInfo.type === 'vimeo' && videoInfo.embedUrl && (
              <iframe
                src={videoInfo.embedUrl}
                title={`${productTitle} Vimeo Preview`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}

            {videoInfo.type === 'direct' && videoInfo.directUrl && (
              <video
                src={videoInfo.directUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
                poster={posterImage}
              >
                Таны хөтөч видео тоглуулахыг дэмжихгүй байна.
              </video>
            )}
          </div>
        )}
      </div>

      {/* Video Footer Hints */}
      <div className="mt-3.5 pt-3 border-t border-[#E6E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Premiere Pro, DaVinci Resolve болон CapCut дээр чирч тавихад бэлэн</span>
        </div>

        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#0088CC] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Эх сурвалж линкээр үзэх</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}
