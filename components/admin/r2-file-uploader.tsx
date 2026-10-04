'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  X,
  Loader2,
  ExternalLink,
  HardDrive,
  RefreshCw,
} from 'lucide-react'

interface R2FileUploaderProps {
  passcode: string
  category?: string
  currentKey?: string
  r2Config?: any
  onUploadSuccess: (key: string, fileSize: string) => void
  onOpenSettings?: () => void
}

const CORS_CONFIG_JSON = JSON.stringify(
  [
    {
      AllowedOrigins: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
  null,
  2
)

export function R2FileUploader({
  passcode,
  category = 'sfx',
  currentKey,
  r2Config,
  onUploadSuccess,
  onOpenSettings,
}: R2FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedBytes, setUploadedBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState('')
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [copiedCors, setCopiedCors] = useState(false)
  const [successKey, setSuccessKey] = useState(currentKey || '')
  const [isDragging, setIsDragging] = useState(false)

  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const lastTimeRef = useRef<number>(0)
  const lastLoadedRef = useRef<number>(0)

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const handleFileSelect = (file: File) => {
    setError('')
    setSelectedFile(file)
    setTotalBytes(file.size)
    setProgress(0)
    setUploadedBytes(0)
  }

  const startUpload = async () => {
    if (!selectedFile) return
    setError('')
    setIsUploading(true)
    setProgress(0)
    setUploadedBytes(0)
    lastTimeRef.current = Date.now()
    lastLoadedRef.current = 0

    try {
      // Step 1: Request Presigned URL from Next.js server
      const res = await fetch('/api/r2/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
          category,
          passcode,
          r2Config: r2Config || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        if (data.needsConfig) {
          throw new Error('Cloudflare R2 тохируулаагүй байна. "Тохиргоо" цэснээс R2 түлхүүрүүдээ оруулна уу.')
        }
        throw new Error(data.error || 'Upload холболт үүсгэхэд алдаа гарлаа.')
      }

      const { presignedUrl, key } = data

      // Step 2: Direct Browser-to-R2 Upload via XHR
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.open('PUT', presignedUrl, true)
        if (selectedFile.type) {
          xhr.setRequestHeader('Content-Type', selectedFile.type)
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const now = Date.now()
            const timeDiff = (now - lastTimeRef.current) / 1000 // seconds
            if (timeDiff > 0.4) {
              const loadedDiff = e.loaded - lastLoadedRef.current
              const speedBytesPerSec = loadedDiff / timeDiff
              setUploadSpeed(`${formatBytes(speedBytesPerSec)}/s`)

              const remainingBytes = e.total - e.loaded
              const remainingSec = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0
              setEtaSeconds(remainingSec)

              lastTimeRef.current = now
              lastLoadedRef.current = e.loaded
            }

            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
            setUploadedBytes(e.loaded)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`R2 upload амжилтгүй боллоо (Код: ${xhr.status}). CORS тохиргоо эсвэл эрхийг шалгана уу.`))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Сүлжээний алдаа эсвэл R2 CORS зөвшөөрөл шаардлагатай. (Direct upload failed)'))
        }

        xhr.onabort = () => {
          reject(new Error('Upload цуцлагдлаа.'))
        }

        xhr.send(selectedFile)
      })

      // Success
      const sizeStr = formatBytes(selectedFile.size)
      setSuccessKey(key)
      setIsUploading(false)
      setProgress(100)
      onUploadSuccess(key, sizeStr)
    } catch (err: unknown) {
      const e = err as Error
      setIsUploading(false)
      setError(e.message || 'Файл оруулахад алдаа гарлаа.')
    }
  }

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    setIsUploading(false)
    setProgress(0)
  }

  return (
    <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
          <HardDrive className="w-3.5 h-3.5 text-[#0088CC]" />
          <span>Cloudflare R2 Шууд Байршуулагч (1GB – 10GB+)</span>
        </div>

        {successKey ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>R2 Санд бэлэн</span>
          </span>
        ) : (
          <span className="text-[10px] text-zinc-400 font-mono">Zero Egress • High Speed</span>
        )}
      </div>

      {/* Current File Key Display if already attached */}
      {successKey && !isUploading && (
        <div className="p-2.5 bg-white border border-emerald-200 rounded-lg flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileArchive className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block font-mono">R2 OBJECT KEY</span>
              <span className="font-mono text-xs font-semibold text-zinc-800 truncate block">
                {successKey}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessKey('')}
            className="text-[11px] text-zinc-400 hover:text-red-600 underline cursor-pointer shrink-0"
          >
            Солих
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {!successKey && !isUploading && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0])
            }
          }}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            isDragging
              ? 'border-[#00B0FF] bg-[#E5F6FF]/50'
              : 'border-zinc-300 hover:border-zinc-400 bg-white'
          }`}
        >
          <input
            type="file"
            id="r2FileInput"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0])
              }
            }}
          />

          <label
            htmlFor="r2FileInput"
            className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
              <UploadCloud className="w-5 h-5 text-[#0088CC]" />
            </div>
            <div className="text-xs font-bold text-zinc-800">
              {selectedFile ? selectedFile.name : 'Файлаа энд чирч тавих эсвэл сонгох'}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {selectedFile
                ? `Хэмжээ: ${formatBytes(selectedFile.size)}`
                : '.zip, .rar, .7z, .wav (Хэмжээний хязгааргүй)'}
            </div>
          </label>

          {selectedFile && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="py-1 px-2.5 rounded-md border border-zinc-200 text-zinc-500 hover:text-black text-xs cursor-pointer"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={startUpload}
                className="py-1 px-4 rounded-md bg-[#00B0FF] hover:bg-[#009FE6] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>R2 руу шууд хуулах</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Live Upload Progress */}
      {isUploading && (
        <div className="p-3 bg-white border border-[#E6E6E3] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-[#00B0FF] animate-spin shrink-0" />
              <span className="font-semibold text-zinc-800 truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-[#0088CC]">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00B0FF] to-blue-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>
              {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
            </span>
            <div className="flex items-center gap-2">
              {uploadSpeed && <span>{uploadSpeed}</span>}
              {etaSeconds !== null && etaSeconds > 0 && <span>• {etaSeconds} сек үлдсэн</span>}
              <button
                type="button"
                onClick={cancelUpload}
                className="text-red-500 hover:underline cursor-pointer ml-1"
              >
                Цуцлах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="space-y-2">
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.includes('Тохиргоо') && onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="underline text-[11px] font-semibold text-red-800 hover:text-black shrink-0"
              >
                Тохируулах →
              </button>
            )}
          </div>

          {(error.includes('CORS') || error.includes('Direct upload failed')) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center justify-between">
                <span>🔧 Cloudflare R2 дээр CORS тохируулах (1 минут):</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(CORS_CONFIG_JSON)
                    setCopiedCors(true)
                    setTimeout(() => setCopiedCors(false), 2000)
                  }}
                  className="px-2 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {copiedCors ? '✓ Хуулагдлаа!' : '📋 JSON Хуулах'}
                </button>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-800">
                <li>
                  <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-black">dash.cloudflare.com</a> → <b>R2</b> → <b>soniq-store</b> bucket руугаа орно.
                </li>
                <li>Дээд талын <b>Settings</b> таб руу очно.</li>
                <li>Доош гүйлгээд <b>CORS Policy</b> хэсэгт <b>Add CORS Policy</b> дарна.</li>
                <li>Дээрх <b>[JSON Хуулах]</b> товчийг дарж хуулсан тохиргоогоо тавиад <b>Save</b> дарна.</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
