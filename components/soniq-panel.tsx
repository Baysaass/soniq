'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Search, Star, ChevronDown, Check, Play, CloudUpload } from 'lucide-react'

// Define the sound items type
interface SoundItem {
  id: string
  title: string
  subtitle: string
  tags: string[]
  duration: string
}

const INITIAL_SOUNDS: SoundItem[] = [
  { id: '1', title: 'Camera Clicks', subtitle: 'SFX - camera, clicks', tags: ['camera', 'clicks'], duration: '0:02' },
  { id: '2', title: 'Camera Shutter', subtitle: 'SFX - camera, shutter', tags: ['camera', 'shutter'], duration: '0:01' },
  { id: '3', title: 'Cinematic Impact', subtitle: 'SFX - cinematic, impact', tags: ['cinematic', 'impact'], duration: '0:05' },
  { id: '4', title: 'Ding', subtitle: 'SFX - ding', tags: ['ding'], duration: '0:01' },
  { id: '5', title: 'Gear', subtitle: 'SFX - gear', tags: ['gear'], duration: '0:03' },
]

// AppIcon Component (Top Left)
export function AppIcon() {
  return (
    <div className="absolute -left-12 -top-10 z-20 animate-float-medium pointer-events-auto">
      <div className="relative group cursor-pointer">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-[#00B0FF]/15 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Main Squircle Icon */}
        <div className="w-14 h-14 bg-[#232326] border border-white/10 rounded-2xl shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <svg viewBox="0 0 64 64" className="w-9 h-9 text-[#E6E6E3] drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Top hexagon */}
            <polygon points="32,9 41,14 41,24 32,29 23,24 23,14" className="fill-[#00B0FF]/10 stroke-[#00B0FF]" />
            {/* Bottom left hexagon */}
            <polygon points="23,24 32,29 32,39 23,44 14,39 14,29" className="stroke-muted-foreground group-hover:stroke-foreground transition-colors duration-300" />
            {/* Bottom right hexagon */}
            <polygon points="41,24 50,29 50,39 41,44 32,39 32,29" className="stroke-muted-foreground group-hover:stroke-foreground transition-colors duration-300" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// MacFolder Component (Top Right)
export function MacFolder() {
  return (
    <div className="absolute -right-12 -top-14 z-20 animate-float-slow pointer-events-auto flex flex-col items-center">
      <div className="relative group cursor-pointer">
        {/* Folder Icon */}
        <svg viewBox="0 0 64 64" className="w-16 h-16 filter drop-shadow-md group-hover:scale-105 transition-transform duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Back flap */}
          <path d="M6 14C6 11.7909 7.79086 10 10 10H24.5C26.046 10 27.4815 10.887 28.1623 12.2743L29.7254 15.4578C30.0658 16.1514 30.7836 16.5952 31.5566 16.5952H54C56.2091 16.5952 58 18.3844 58 20.5935V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V14Z" fill="#009BF2" />
          {/* Front pocket */}
          <path d="M6 21.5C6 19.2909 7.79086 17.5 10 17.5H54C56.2091 17.5 58 19.2909 58 21.5V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V21.5Z" fill="#38B3FF" />
          {/* Pocket top highlight */}
          <path d="M10 17.5H54C56.2091 17.5 58 19.2909 58 21.5V23C58 20.7909 56.2091 19 54 19H10C7.79086 19 6 20.7909 6 23V21.5C6 19.2909 7.79086 17.5 10 17.5Z" fill="white" fillOpacity="0.25" />
        </svg>
        {/* Label */}
        <span className="mt-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-foreground bg-white/60 backdrop-blur-sm border border-black/5 shadow-xs block text-center max-w-[80px] truncate select-none">
          Whoosh
        </span>
      </div>
    </div>
  )
}

// SoniqPanel Component (Main)
export function SoniqPanel({
  highlightUpload = false,
  searchPlaceholder = 'Search',
  searchValue,
  onSearchChange,
  revealItems = true,
}: {
  highlightUpload?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
  /** false үед extension хоосон; true болмогц SFX-үүд нэг нэгээр нэмэгдэнэ. */
  revealItems?: boolean
}) {
  // Нэг л удаа latch хийнэ — reveal болмогц дуунууд харагдсаар үлдэнэ.
  const [revealed, setRevealed] = useState(revealItems)
  useEffect(() => {
    if (revealItems) setRevealed(true)
  }, [revealItems])

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'SFX' | 'Starred'>('All')
  const [activePack, setActivePack] = useState<string>('Essentials')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [starredSounds, setStarredSounds] = useState<Set<string>>(new Set(['2'])) // Shutter is starred by default
  const [insertedId, setInsertedId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Handlers
  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newStars = new Set(starredSounds)
    if (newStars.has(id)) {
      newStars.delete(id)
    } else {
      newStars.add(id)
    }
    setStarredSounds(newStars)
  }

  const handleInsert = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setInsertedId(id)
    setTimeout(() => {
      setInsertedId(null)
    }, 1500)
  }

  const togglePlay = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (playingId === id) {
      setPlayingId(null)
    } else {
      setPlayingId(id)
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)
    }
  }

  // Filtering Logic
  const filteredSounds = INITIAL_SOUNDS.filter((sound) => {
    // 1. Filter by Tab
    if (activeTab === 'Starred' && !starredSounds.has(sound.id)) return false
    
    // 2. Filter by Pack (Mock logic)
    if (activePack === 'Essentials' && sound.id === '5') return false // Hide Gear in essentials
    if (activePack === 'Soniq Starter' && (sound.id === '1' || sound.id === '3')) return false

    // 3. Filter by Selected Tag
    if (selectedTag && !sound.tags.includes(selectedTag)) return false

    // 4. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return sound.title.toLowerCase().includes(q) || sound.subtitle.toLowerCase().includes(q)
    }

    return true
  })

  // Tag color classes
  const getTagColorClass = (tag: string) => {
    const isSelected = selectedTag === tag
    if (isSelected) {
      return 'bg-brand text-white border-brand'
    }
    switch (tag) {
      case 'camera': return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
      case 'riser': return 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
      case 'clicks': return 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
      case 'shutter': return 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
      case 'cinematic': return 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100'
      case 'impact': return 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
      case 'ding': return 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
      case 'gear': return 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
    }
  }

  return (
    <div className="w-full max-w-[390px] bg-white border border-[#E6E6E3] rounded-[24px] shadow-lg overflow-hidden flex flex-col pointer-events-auto select-none animate-float-panel font-sans">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        {/* Logo — inline SVG (viewBox тул h-[18px] w-auto-той төгс масштаблагдана) */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 754 228" className="h-[18px] w-auto" role="img" aria-label="Soniq" xmlns="http://www.w3.org/2000/svg">
            <path d="M667.875 51.209C677.629 51.209 685.757 53.4853 692.26 58.0371C698.925 62.4264 703.72 67.8724 706.646 74.375H709.085L712.499 54.8672H753.954L723.473 228.001H682.018L692.747 165.819H690.797C686.408 171.184 680.88 175.817 674.215 179.719C667.712 183.458 660.721 185.327 653.243 185.327C643.814 185.327 635.361 182.97 627.883 178.256C620.567 173.541 614.796 166.957 610.569 158.504C606.343 150.05 604.229 140.296 604.229 129.241C604.229 113.635 607.237 99.8976 613.252 88.0303C619.429 76.163 627.396 67.0598 637.149 60.7197C647.066 54.3796 657.308 51.209 667.875 51.209ZM86.3232 6.09668C104.043 6.09668 118.105 9.10415 128.51 15.1191C139.077 21.1341 146.554 28.125 150.943 36.0908C155.333 43.894 158.26 51.7784 159.723 59.7441H113.879C112.741 55.68 109.652 52.2656 104.612 49.502C99.7353 46.5758 92.9074 45.1133 84.1289 45.1133C79.4146 45.1133 75.5942 45.6824 72.668 46.8203C69.742 47.9582 67.5471 49.4209 66.084 51.209C64.7835 52.9972 64.1329 54.9482 64.1328 57.0615C64.1328 59.9876 65.4333 62.67 68.0342 65.1084C70.7978 67.3843 74.2938 69.4168 78.5205 71.2051C82.7471 72.9932 88.5179 75.1066 95.833 77.5449C107.375 81.609 116.967 85.511 124.607 89.25C132.248 92.8265 138.751 97.7849 144.116 104.125C149.643 110.465 152.407 118.35 152.407 127.778C152.407 138.183 149.48 147.856 143.628 156.797C137.938 165.738 129.648 172.972 118.756 178.499C108.026 183.864 95.2643 186.547 80.4707 186.547C63.8889 186.547 49.908 183.864 38.5283 178.499C27.3114 172.972 18.614 165.738 12.4365 156.797C6.42153 147.856 2.27594 137.857 0 126.803H45.8438C47.4694 132.655 51.2091 137.614 57.0615 141.678C63.0765 145.579 71.2862 147.53 81.6904 147.53C85.9171 147.53 89.656 146.961 92.9072 145.823C96.3211 144.685 99.0033 143.06 100.954 140.946C103.067 138.833 104.124 136.232 104.124 133.144C104.124 130.217 102.742 127.616 99.9785 125.34C97.3775 123.064 94.0453 121.113 89.9814 119.487C85.9173 117.699 80.146 115.504 72.668 112.903C60.9632 108.839 51.3716 105.019 43.8936 101.442C36.4155 97.7033 29.912 92.6643 24.3848 86.3242C18.8575 79.9841 16.0938 72.0988 16.0938 62.6699C16.0938 52.7535 18.9391 43.4871 24.6289 34.8711C30.4813 26.2551 38.691 19.3457 49.2578 14.1436C59.9872 8.77886 72.3425 6.09668 86.3232 6.09668ZM244.199 51.209C257.042 51.209 268.504 53.9727 278.583 59.5C288.662 65.0272 296.465 72.505 301.992 81.9336C307.519 91.1999 310.283 101.442 310.283 112.659C310.283 125.665 306.788 137.776 299.798 148.993C292.97 160.048 283.704 168.907 271.999 175.572C260.457 182.075 247.938 185.327 234.445 185.327C221.603 185.327 210.142 182.563 200.062 177.036C189.983 171.509 182.181 164.112 176.653 154.846C171.126 145.417 168.362 135.093 168.362 123.876C168.362 110.871 171.776 98.8406 178.604 87.7861C185.594 76.5692 194.86 67.7097 206.402 61.207C218.107 54.5418 230.706 51.209 244.199 51.209ZM575.082 181.669H533.627L556.062 54.8662H597.517L575.082 181.669ZM490.151 44.502C507.429 44.5021 521.435 58.8954 521.435 76.6504V113.085C521.434 116.636 518.633 119.515 515.178 119.515H483.895C480.439 119.515 477.638 122.393 477.638 125.944V175.238C477.638 178.789 474.836 181.668 471.381 181.668H435.927C435.648 181.668 435.382 181.611 435.14 181.51C435.07 181.481 434.989 181.491 434.932 181.541C434.851 181.611 434.73 181.601 434.662 181.519L396.898 135.82C393.129 131.259 385.873 133.999 385.873 139.982V149.52C385.873 167.275 371.866 181.668 354.589 181.668H329.562C326.107 181.668 323.306 178.789 323.306 175.238V113.085C323.306 109.534 326.107 106.655 329.562 106.655H354.589C358.044 106.655 360.846 103.776 360.846 100.226V53.0742C360.846 49.5234 363.647 46.6446 367.103 46.6445H400.472C401.888 46.6445 403.221 47.01 404.389 47.6504C404.543 47.7348 404.731 47.7178 404.864 47.6016C405.038 47.4499 405.298 47.4721 405.445 47.6504L447.842 98.957C451.611 103.518 458.867 100.779 458.867 94.7949V50.9316C458.867 47.3808 461.669 44.5021 465.124 44.502H490.151ZM242.005 86.5674C236.64 86.5674 231.52 88.1115 226.643 91.2002C221.928 94.1263 218.108 98.4344 215.182 104.124C212.255 109.651 210.792 116.073 210.792 123.389C210.792 128.591 211.849 133.224 213.962 137.288C216.238 141.352 219.327 144.522 223.229 146.798C227.13 148.911 231.601 149.969 236.641 149.969C242.005 149.969 247.045 148.505 251.759 145.579C256.636 142.49 260.538 138.182 263.464 132.655C266.39 126.965 267.854 120.462 267.854 113.146C267.853 107.944 266.715 103.311 264.439 99.2471C262.326 95.1831 259.318 92.0948 255.417 89.9814C251.515 87.7055 247.044 86.5674 242.005 86.5674ZM676.897 86.5674C671.533 86.5674 666.574 88.0308 662.022 90.957C657.471 93.8832 653.812 98.2726 651.049 104.125C648.285 109.815 646.903 116.643 646.903 124.608C646.903 129.973 647.879 134.606 649.83 138.508C651.943 142.247 654.788 145.092 658.364 147.043C662.103 148.994 666.493 149.969 671.532 149.969C676.897 149.969 681.855 148.505 686.407 145.579C690.959 142.653 694.617 138.345 697.381 132.655C700.144 126.803 701.526 119.893 701.526 111.928C701.526 106.563 700.47 102.011 698.356 98.2725C696.406 94.3709 693.56 91.4449 689.821 89.4941C686.245 87.5434 681.937 86.5674 676.897 86.5674ZM583.373 0C590.038 1.38255e-05 595.24 1.70719 598.979 5.12109C602.718 8.37242 604.588 12.7618 604.588 18.2891C604.588 25.1167 602.393 30.725 598.004 35.1143C593.777 39.341 588.331 41.4551 581.666 41.4551C575.001 41.4551 569.799 39.8293 566.06 36.5781C562.321 33.1642 560.451 28.6932 560.451 23.166C560.451 16.3382 562.564 10.8107 566.791 6.58398C571.18 2.19467 576.708 0 583.373 0Z" fill="#00B0FF"/>
          </svg>
        </div>
        {/* Upload Button */}
        <button
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-300 cursor-pointer ${
            highlightUpload
              ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-md shadow-emerald-500/25'
              : 'text-[#0099FF] bg-[#E5F6FF] border-dashed border-[#00B0FF] hover:bg-[#D0EFFF]'
          }`}
        >
          {highlightUpload ? (
            <>
              <Check className="w-3.5 h-3.5 animate-pulse" />
              <span>Imported ✓</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue !== undefined ? searchValue : searchQuery}
            onChange={(e) => {
              if (onSearchChange) {
                onSearchChange(e.target.value)
              } else {
                setSearchQuery(e.target.value)
              }
            }}
            className="w-full pl-9 pr-4 py-2 bg-surface text-sm rounded-xl border-none outline-hidden focus:ring-1 focus:ring-brand/35 transition-all text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* 3. Main Navigation Tabs */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 bg-surface p-0.5 rounded-xl text-center text-xs font-semibold text-muted-foreground">
          {(['All', 'SFX', 'Starred'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-foreground shadow-sm'
                  : 'hover:text-foreground'
              }`}
            >
              {tab === 'Starred' ? '★' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Pack Selection Pills */}
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { name: 'Essentials', count: 10 },
          { name: 'Master SFX pack', count: 83 },
          { name: 'Soniq Starter', count: 94 },
        ].map((pack) => (
          <button
            key={pack.name}
            onClick={() => setActivePack(pack.name)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition-all shrink-0 cursor-pointer ${
              activePack === pack.name
                ? 'bg-[#E5F6FF] text-brand border-[#00B0FF]/25 shadow-xs'
                : 'bg-white text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <span>{pack.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              activePack === pack.name ? 'bg-brand/15 text-brand' : 'bg-surface text-muted-foreground/75'
            }`}>
              {pack.count}
            </span>
          </button>
        ))}
      </div>

      {/* 5. Tag Buttons */}
      <div className="px-4 pb-3.5 flex flex-wrap gap-1.5">
        {['camera', 'riser', 'clicks', 'shutter', 'cinematic', 'impact', 'ding', 'gear'].map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2.5 py-1 text-[10px] font-semibold border rounded-full transition-all cursor-pointer ${getTagColorClass(tag)}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 6. Sound List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 max-h-[290px] min-h-[260px] flex flex-col gap-2">
        {!revealed ? (
          // Extension хоосон — SFX багц оруулахаас өмнөх төлөв
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-brand/30 flex items-center justify-center mb-3">
              <CloudUpload className="w-5 h-5 text-brand/50" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Багц хоосон байна</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[180px] leading-relaxed">
              SFX багцаа оруулаад дуунуудаа нэмээрэй
            </p>
          </div>
        ) : filteredSounds.length > 0 ? (
          filteredSounds.map((sound, i) => {
            const isPlaying = playingId === sound.id
            const isStarred = starredSounds.has(sound.id)
            const isInserted = insertedId === sound.id

            return (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex items-center justify-between p-2.5 bg-white border border-[#F1F1EF] rounded-2xl hover:border-brand/20 hover:shadow-xs transition-colors duration-200"
              >
                {/* Left: Waveform Icon & Play trigger */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => togglePlay(sound.id, e)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative overflow-hidden group/play cursor-pointer ${
                      isPlaying
                        ? 'bg-brand text-white'
                        : 'bg-[#E5F6FF] text-brand hover:bg-[#D0EFFF]'
                    }`}
                  >
                    {isPlaying ? (
                      <div className="flex items-center gap-[2px] justify-center">
                        <span className="w-[3px] h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-[3px] h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        <span className="w-[3px] h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                      </div>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-brand text-brand group-hover/play:scale-110 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Sound Info */}
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-bold text-foreground leading-tight truncate">
                      {sound.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {sound.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {/* Star Toggle */}
                  <button
                    onClick={(e) => toggleStar(sound.id, e)}
                    className="p-1.5 text-muted-foreground/45 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isStarred ? 'fill-amber-400 text-amber-400' : 'text-border'
                      }`}
                    />
                  </button>

                  {/* Chevron Down (Mock details) */}
                  <button className="p-1 text-muted-foreground/35 hover:text-foreground transition-colors cursor-pointer md:block hidden">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Insert Button */}
                  <button
                    onClick={(e) => handleInsert(sound.id, sound.title, e)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                      isInserted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-brand text-white hover:opacity-95 shadow-xs'
                    }`}
                  >
                    {isInserted ? (
                      <span className="flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        <span>Insert</span>
                      </span>
                    ) : (
                      'Insert'
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <span className="text-2xl mb-1">🔍</span>
            <p className="text-xs font-semibold">Дуу олдсонгүй</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedTag(null)
                setActiveTab('All')
              }}
              className="text-[10px] text-brand font-bold mt-2 hover:underline cursor-pointer"
            >
              Шүүлтүүр цэвэрлэх
            </button>
          </div>
        )}
      </div>

      {/* 7. Footer */}
      <div className="bg-surface px-5 py-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground/80 font-medium">
        <span>{revealed ? filteredSounds.length : 0} дуу</span>
        <span className="text-[9px] font-semibold text-muted-foreground/60">
          ↑ ↓ сонгох · Space сонсох · Enter insert
        </span>
      </div>
    </div>
  )
}
