'use client'

import React, { useState } from 'react'
import {
  FileText,
  Volume2,
  Film,
  Box,
  Sliders,
  Type,
  FolderArchive,
  Code2,
  FileCode,
  X,
  Plus,
  Check,
} from 'lucide-react'

export interface FileFormatMeta {
  id: string
  label: string
  ext: string
  name: string
  category: 'design' | 'doc' | 'adobe' | 'media' | 'other'
  bgClass: string
  borderClass: string
  textClass: string
}

export const FILE_FORMAT_PRESETS: FileFormatMeta[] = [
  {
    id: 'fig',
    label: 'FIGMA',
    ext: '.fig',
    name: 'Figma',
    category: 'design',
    bgClass: 'bg-purple-50 hover:bg-purple-100/80',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-900',
  },
  {
    id: 'docs',
    label: 'WORD',
    ext: '.docx',
    name: 'Word / Docs',
    category: 'doc',
    bgClass: 'bg-blue-50 hover:bg-blue-100/80',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-900',
  },
  {
    id: 'xlsx',
    label: 'EXCEL',
    ext: '.xlsx',
    name: 'Excel / Sheets',
    category: 'doc',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-900',
  },
  {
    id: 'pptx',
    label: 'POWERPOINT',
    ext: '.pptx',
    name: 'PowerPoint',
    category: 'doc',
    bgClass: 'bg-orange-50 hover:bg-orange-100/80',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-900',
  },
  {
    id: 'pdf',
    label: 'PDF',
    ext: '.pdf',
    name: 'PDF Баримт',
    category: 'doc',
    bgClass: 'bg-red-50 hover:bg-red-100/80',
    borderClass: 'border-red-200',
    textClass: 'text-red-900',
  },
  {
    id: 'psd',
    label: 'PHOTOSHOP',
    ext: '.psd',
    name: 'Photoshop',
    category: 'adobe',
    bgClass: 'bg-sky-50 hover:bg-sky-100/80',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-950',
  },
  {
    id: 'ai',
    label: 'ILLUSTRATOR',
    ext: '.ai',
    name: 'Illustrator',
    category: 'adobe',
    bgClass: 'bg-amber-50 hover:bg-amber-100/80',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-950',
  },
  {
    id: 'aep',
    label: 'AFTER EFFECTS',
    ext: '.aep',
    name: 'After Effects',
    category: 'adobe',
    bgClass: 'bg-indigo-50 hover:bg-indigo-100/80',
    borderClass: 'border-indigo-200',
    textClass: 'text-indigo-950',
  },
  {
    id: 'prproj',
    label: 'PREMIERE',
    ext: '.prproj',
    name: 'Premiere Pro',
    category: 'adobe',
    bgClass: 'bg-fuchsia-50 hover:bg-fuchsia-100/80',
    borderClass: 'border-fuchsia-200',
    textClass: 'text-fuchsia-950',
  },
  {
    id: 'blend',
    label: '3D / BLEND',
    ext: '.blend',
    name: '3D Blender',
    category: 'design',
    bgClass: 'bg-orange-50 hover:bg-orange-100/80',
    borderClass: 'border-orange-300',
    textClass: 'text-orange-950',
  },
  {
    id: 'wav',
    label: 'AUDIO WAV/MP3',
    ext: '.wav',
    name: 'Audio / SFX',
    category: 'media',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-900',
  },
  {
    id: 'mp4',
    label: 'VIDEO MP4',
    ext: '.mp4',
    name: 'Video Footage',
    category: 'media',
    bgClass: 'bg-rose-50 hover:bg-rose-100/80',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-900',
  },
  {
    id: 'cube',
    label: 'LUT CUBE',
    ext: '.cube',
    name: 'LUTs / Өнгө',
    category: 'media',
    bgClass: 'bg-violet-50 hover:bg-violet-100/80',
    borderClass: 'border-violet-200',
    textClass: 'text-violet-900',
  },
  {
    id: 'font',
    label: 'FONT TTF/OTF',
    ext: '.otf',
    name: 'Үсгийн фонд',
    category: 'design',
    bgClass: 'bg-zinc-100 hover:bg-zinc-200/80',
    borderClass: 'border-zinc-300',
    textClass: 'text-zinc-800',
  },
  {
    id: 'zip',
    label: 'ZIP ARCHIVE',
    ext: '.zip',
    name: 'Zip архив',
    category: 'other',
    bgClass: 'bg-amber-50 hover:bg-amber-100/80',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-900',
  },
  {
    id: 'code',
    label: 'CODE / WEB',
    ext: '.json',
    name: 'Code / HTML',
    category: 'other',
    bgClass: 'bg-slate-100 hover:bg-slate-200/80',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-800',
  },
]

/**
 * Returns icon element for a given format
 */
export function renderFormatIcon(formatKey: string, sizeClass = 'w-3.5 h-3.5') {
  const key = formatKey.toLowerCase().replace(/^\./, '').trim()

  // 1. Figma Logo (Official 5-color vector)
  if (key === 'fig' || key === 'figma') {
    return (
      <svg className={`${sizeClass} shrink-0`} viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
        <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
        <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
        <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
        <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
      </svg>
    )
  }

  // 2. Microsoft Word Logo
  if (key === 'doc' || key === 'docx' || key === 'docs' || key === 'word') {
    return (
      <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#185ABD" />
        <path d="M6 7.5L8.2 16.5H10.1L12 9.5L13.9 16.5H15.8L18 7.5H16.1L14.7 13.8L12.9 7.5H11.1L9.3 13.8L7.9 7.5H6Z" fill="white" />
      </svg>
    )
  }

  // 3. Microsoft Excel Logo
  if (key === 'xls' || key === 'xlsx' || key === 'excel' || key === 'csv' || key === 'sheets') {
    return (
      <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#107C41" />
        <path d="M7 7.5L10.5 12L7 16.5H9.2L11.5 13.4L13.8 16.5H16L12.5 12L16 7.5H13.8L11.5 10.6L9.2 7.5H7Z" fill="white" />
      </svg>
    )
  }

  // 4. Microsoft PowerPoint Logo
  if (key === 'ppt' || key === 'pptx' || key === 'powerpoint' || key === 'slides') {
    return (
      <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#C43E1C" />
        <path d="M8 7.5H12C13.7 7.5 15 8.6 15 10.2C15 11.9 13.7 13 12 13H10V16.5H8V7.5ZM10 9.2V11.3H11.8C12.6 11.3 13.1 10.8 13.1 10.2C13.1 9.6 12.6 9.2 11.8 9.2H10Z" fill="white" />
      </svg>
    )
  }

  // 5. Adobe PDF Logo
  if (key === 'pdf') {
    return (
      <svg className={`${sizeClass} shrink-0`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#E5252A" />
        <path d="M5.5 13.5V16.5H4.2V7.5H7C8.4 7.5 9.4 8.5 9.4 9.8C9.4 11.2 8.4 12.1 7 12.1H5.5V13.5ZM5.5 8.7V10.9H6.9C7.6 10.9 8.1 10.5 8.1 9.8C8.1 9.1 7.6 8.7 6.9 8.7H5.5ZM10.5 16.5V7.5H13.2C15.5 7.5 16.8 9.1 16.8 12C16.8 14.9 15.5 16.5 13.2 16.5H10.5ZM11.8 8.7V15.3H13.1C14.6 15.3 15.5 14.1 15.5 12C15.5 9.9 14.6 8.7 13.1 8.7H11.8Z" fill="white" />
      </svg>
    )
  }

  // 6. Adobe Photoshop
  if (key === 'psd' || key === 'ps' || key === 'photoshop') {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#001E36] text-[#31A8FF] font-black text-[8px] flex items-center justify-center font-mono leading-none border border-[#31A8FF]/50 shrink-0">
        Ps
      </span>
    )
  }

  // 7. Adobe Illustrator
  if (key === 'ai' || key === 'illustrator' || key === 'eps' || key === 'svg') {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#331C00] text-[#FF9A00] font-black text-[8px] flex items-center justify-center font-mono leading-none border border-[#FF9A00]/50 shrink-0">
        Ai
      </span>
    )
  }

  // 8. Adobe After Effects
  if (key === 'aep' || key === 'ae' || key === 'after effects' || key === 'aftereffects' || key === 'mogrt') {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#1A1A2E] text-[#9999FF] font-black text-[8px] flex items-center justify-center font-mono leading-none border border-[#9999FF]/50 shrink-0">
        Ae
      </span>
    )
  }

  // 9. Adobe Premiere Pro
  if (key === 'prproj' || key === 'pr' || key === 'premiere' || key === 'premiere pro') {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#1A1A2E] text-[#EA99FF] font-black text-[8px] flex items-center justify-center font-mono leading-none border border-[#EA99FF]/50 shrink-0">
        Pr
      </span>
    )
  }

  // 10. 3D / Blender
  if (key === 'blend' || key === 'fbx' || key === 'obj' || key === '3d' || key === 'c4d') {
    return <Box className={`${sizeClass} text-[#E87D0D] shrink-0`} />
  }

  // 11. Audio / SFX
  if (key === 'wav' || key === 'mp3' || key === 'audio' || key === 'sfx' || key === 'flac') {
    return <Volume2 className={`${sizeClass} text-emerald-600 shrink-0`} />
  }

  // 12. Video / Footage
  if (key === 'mp4' || key === 'mov' || key === 'video' || key === 'footage') {
    return <Film className={`${sizeClass} text-rose-600 shrink-0`} />
  }

  // 13. LUTs / Cube
  if (key === 'cube' || key === 'lut' || key === '3dl' || key === 'luts') {
    return <Sliders className={`${sizeClass} text-violet-600 shrink-0`} />
  }

  // 14. Font
  if (key === 'font' || key === 'ttf' || key === 'otf' || key === 'woff' || key === 'woff2') {
    return <Type className={`${sizeClass} text-zinc-700 shrink-0`} />
  }

  // 15. Zip Archive
  if (key === 'zip' || key === 'rar' || key === '7z' || key === 'archive') {
    return <FolderArchive className={`${sizeClass} text-amber-600 shrink-0`} />
  }

  // 16. Code / Web
  if (key === 'code' || key === 'html' || key === 'css' || key === 'json' || key === 'tsx' || key === 'ts' || key === 'js') {
    return <Code2 className={`${sizeClass} text-slate-700 shrink-0`} />
  }

  // Fallback / Unknown custom format
  return <FileCode className={`${sizeClass} text-zinc-600 shrink-0`} />
}

/**
 * Get readable label and styles for any format string
 */
export function getFormatPresentation(formatString: string) {
  const clean = formatString.trim()
  const key = clean.toLowerCase().replace(/^\./, '')

  // Check presets first
  const preset = FILE_FORMAT_PRESETS.find(
    (p) => p.id === key || p.ext.toLowerCase().replace(/^\./, '') === key || p.name.toLowerCase() === key
  )

  if (preset) {
    return {
      key: preset.id,
      label: preset.label,
      name: preset.name,
      ext: preset.ext,
      bgClass: preset.bgClass,
      borderClass: preset.borderClass,
      textClass: preset.textClass,
    }
  }

  // Check known aliases
  if (key === 'doc' || key === 'docs' || key === 'word') {
    return {
      key: 'docs',
      label: 'WORD',
      name: 'Word / Docs',
      ext: '.docx',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-900',
    }
  }
  if (key === 'fig' || key === 'figma') {
    return {
      key: 'fig',
      label: 'FIGMA',
      name: 'Figma',
      ext: '.fig',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
      textClass: 'text-purple-900',
    }
  }
  if (key === 'pdf') {
    return {
      key: 'pdf',
      label: 'PDF',
      name: 'PDF',
      ext: '.pdf',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
      textClass: 'text-red-900',
    }
  }

  // Custom generic format (e.g. "notion", "sketch", "cdr")
  const displayLabel = clean.length > 0
    ? (clean.startsWith('.') ? clean.toUpperCase() : `.${clean.toUpperCase()}`)
    : 'FILE'

  return {
    key,
    label: displayLabel,
    name: clean.toUpperCase(),
    ext: clean.startsWith('.') ? clean : `.${clean}`,
    bgClass: 'bg-zinc-100',
    borderClass: 'border-zinc-300',
    textClass: 'text-zinc-800',
  }
}

/**
 * Single File Format Badge Component
 */
export function FileFormatBadge({
  format,
  size = 'sm',
  onRemove,
  showLabel = true,
  className = '',
}: {
  format: string
  size?: 'xs' | 'sm' | 'md'
  onRemove?: () => void
  showLabel?: boolean
  className?: string
}) {
  const meta = getFormatPresentation(format)

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-semibold',
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-tight transition-all shadow-2xs select-none ${meta.bgClass} ${meta.borderClass} ${meta.textClass} ${sizeClasses[size]} ${className}`}
      title={`${meta.name} (${meta.ext})`}
    >
      {renderFormatIcon(meta.key || format, iconSizes[size])}
      {showLabel && <span>{meta.label}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 p-0.5 hover:bg-black/10 rounded text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
          title="Хасах"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

/**
 * List of Format Badges
 */
export function FileFormatBadgeList({
  formats = [],
  size = 'sm',
  max,
  className = '',
}: {
  formats?: string[]
  size?: 'xs' | 'sm' | 'md'
  max?: number
  className?: string
}) {
  if (!Array.isArray(formats) || formats.length === 0) return null

  const items = max ? formats.slice(0, max) : formats
  const extra = max && formats.length > max ? formats.length - max : 0

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {items.map((fmt, idx) => (
        <FileFormatBadge key={`${fmt}-${idx}`} format={fmt} size={size} />
      ))}
      {extra > 0 && (
        <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-100 border border-zinc-200 px-1.5 py-0.2 rounded">
          +{extra}
        </span>
      )}
    </div>
  )
}

/**
 * Interactive File Format Selector for Admin Form
 */
export function FileFormatSelector({
  selectedFormats = [],
  onChange,
}: {
  selectedFormats: string[]
  onChange: (formats: string[]) => void
}) {
  const [customInput, setCustomInput] = useState('')

  const normalizedSelected = Array.isArray(selectedFormats) ? selectedFormats : []

  const handleTogglePreset = (presetKey: string) => {
    const isSelected = normalizedSelected.some(
      (f) => f.toLowerCase() === presetKey.toLowerCase()
    )

    if (isSelected) {
      onChange(normalizedSelected.filter((f) => f.toLowerCase() !== presetKey.toLowerCase()))
    } else {
      onChange([...normalizedSelected, presetKey])
    }
  }

  const handleAddCustom = () => {
    const trimmed = customInput.trim().replace(/^[\s,.]+/, '')
    if (!trimmed) return

    const exists = normalizedSelected.some((f) => f.toLowerCase() === trimmed.toLowerCase())
    if (!exists) {
      onChange([...normalizedSelected, trimmed])
    }
    setCustomInput('')
  }

  const handleRemove = (index: number) => {
    const updated = normalizedSelected.filter((_, idx) => idx !== index)
    onChange(updated)
  }

  return (
    <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-[11px] font-bold text-zinc-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0088CC]" />
            <span>Бүтээгдэхүүнд багтсан файлын өргөтгөл, төрлүүд (Formats) *</span>
          </label>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Хэрэглэгчдэд ямар өргөтгөлтэй файлууд очихыг доорх жагсаалтаас сонгох эсвэл гараар бичиж оруулна уу.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold shrink-0">
          {normalizedSelected.length} төрөл сонгогдсон
        </span>
      </div>

      {/* Currently Selected Badges */}
      <div className="p-2.5 bg-white rounded-lg border border-zinc-200 min-h-[42px] flex items-center gap-1.5 flex-wrap">
        {normalizedSelected.length === 0 ? (
          <span className="text-xs text-zinc-400 italic">
            Одоогоор файл сонгогдоогүй байна. Доорх бэлэн товчлуурууд дээр дарж сонгоно уу.
          </span>
        ) : (
          normalizedSelected.map((fmt, idx) => (
            <FileFormatBadge
              key={`${fmt}-${idx}`}
              format={fmt}
              size="sm"
              onRemove={() => handleRemove(idx)}
            />
          ))
        )}
      </div>

      {/* Quick Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider block">
          Түгээмэл бэлэн форматууд (Нэг товшилтоор сонгох):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
          {FILE_FORMAT_PRESETS.map((preset) => {
            const isSelected = normalizedSelected.some(
              (f) => f.toLowerCase() === preset.id.toLowerCase()
            )

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleTogglePreset(preset.id)}
                className={`py-1.5 px-2 rounded-lg text-left border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                <div className="shrink-0">
                  {renderFormatIcon(preset.id, 'w-3.5 h-3.5')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                    {preset.name}
                  </div>
                  <div className={`text-[9px] font-mono truncate ${isSelected ? 'text-blue-100' : 'text-zinc-400'}`}>
                    {preset.ext}
                  </div>
                </div>
                {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom write-in for any unknown format */}
      <div className="pt-2 border-t border-zinc-200">
        <label className="block text-[10px] font-semibold text-zinc-700 mb-1">
          Дээрх сонголтод байхгүй өөр өргөтгөл гараар нэмэх (Жишээ: notion, sketch, apk, mind, cdr...):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustom()
              }
            }}
            placeholder="Жишээ: notion эсвэл .sketch эсвэл cdr"
            className="w-full px-3 py-1.8 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900 focus:outline-none focus:border-[#0088CC]"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            className="px-3 py-1.8 bg-[#141414] hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Нэмэх</span>
          </button>
        </div>
      </div>
    </div>
  )
}
