'use client'

import React, { useState } from 'react'
import { Play, Volume2 } from 'lucide-react'
import { audioSynthesizer } from '@/lib/audio-synthesizer'

interface SoundPad {
  id: string
  name: string
  type: 'whoosh' | 'impact' | 'braam' | 'ui' | 'glitch' | 'anime' | 'riser'
  category: string
  description: string
}

const SOUND_PADS: SoundPad[] = [
  {
    id: 'braam',
    name: 'Heavy Sub Braam',
    type: 'braam',
    category: 'Cinematic',
    description: 'Гүн басс, сүрлэг нүргээн',
  },
  {
    id: 'impact',
    name: 'Sub-Drop Impact',
    type: 'impact',
    category: 'Epic Hits',
    description: 'Хүнд цохилт, доргилт',
  },
  {
    id: 'whoosh',
    name: 'Air Rush Whoosh',
    type: 'whoosh',
    category: 'Transitions',
    description: 'Хурдан шилжилт, салхи',
  },
  {
    id: 'ui',
    name: 'Creator Pop & Click',
    type: 'ui',
    category: 'Social / Reels',
    description: 'Тод цэвэр поп, товшилт',
  },
  {
    id: 'glitch',
    name: 'Cyberpunk Glitch',
    type: 'glitch',
    category: 'Digital',
    description: 'Тоон эвдрэл, глитч чимээ',
  },
  {
    id: 'anime',
    name: 'Anime Action Slash',
    type: 'anime',
    category: 'Dynamic',
    description: 'Анимэ тулаан, хурд',
  },
]

export function StoreSoundPreviewStation() {
  const [activePad, setActivePad] = useState<string | null>(null)

  const handlePlay = (pad: SoundPad) => {
    setActivePad(pad.id)
    audioSynthesizer.playByType(pad.type)
    setTimeout(() => {
      setActivePad(null)
    }, 1200)
  }

  return (
    <section id="preview-station" className="py-8 sm:py-10 bg-white border-b border-[#E6E6E3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold text-[#0088CC] uppercase tracking-wider block mb-1">
            ШУУД СОНСОЖ ТУРШИХ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
            Интерактив дууны тавцан
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-sm mx-auto">
            Доорх товчлуурууд дээр дарж үндсэн дууны хэв маягуудыг чихээрээ бодитоор шалгана уу.
          </p>
        </div>

        {/* Sound Pads Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SOUND_PADS.map((pad) => {
            const isActive = activePad === pad.id

            return (
              <button
                key={pad.id}
                onClick={() => handlePlay(pad)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-[#00B0FF] bg-[#E5F6FF] shadow-xs'
                    : 'border-[#E6E6E3] bg-[#FAFAFA] hover:bg-white hover:border-zinc-300'
                }`}
              >

                <div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block mb-0.5">
                    {pad.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#141414]">{pad.name}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{pad.description}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <span
                        key={bar}
                        className={`w-0.5 rounded-full transition-all duration-150 ${
                          isActive ? 'bg-[#00B0FF]' : 'bg-zinc-300'
                        }`}
                        style={{
                          height: isActive ? `${Math.floor(Math.random() * 12) + 6}px` : '4px',
                        }}
                      />
                    ))}
                  </div>

                  <div className="w-6 h-6 rounded-full bg-white border border-[#E6E6E3] flex items-center justify-center text-zinc-700 shadow-xs">
                    <Play className={`w-2.5 h-2.5 fill-current ${isActive ? 'text-[#00B0FF]' : ''}`} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
