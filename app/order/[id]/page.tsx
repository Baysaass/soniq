'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  FileArchive,
  Sparkles,
  Cloud,
  AlertCircle,
} from 'lucide-react'
import { InstagramIcon, TelegramIcon } from '@/components/icons/social'
import { STORE_SETTINGS } from '@/lib/store-data'
import { SoniqMark, SoniqWordmark } from '@/components/logo'

interface OrderItem {
  id: string
  title: string
  price: number
  priceUSD: number
  quantity: number
}

interface OrderData {
  id: string
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: OrderItem[]
  totalAmountMNT: number
  totalAmountUSD: number
  currency: 'MNT' | 'USD'
  status: 'PENDING' | 'APPROVED' | 'CANCELLED'
  paymentMethod: string
  transferReference: string
  weTransferLink?: string | null
  r2Key?: string | null
  approvedAt?: string | null
  adminNotes?: string
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [generatingR2, setGeneratingR2] = useState(false)
  const [r2DownloadUrl, setR2DownloadUrl] = useState<string | null>(null)
  const [r2Error, setR2Error] = useState<string | null>(null)
  const [copiedR2Link, setCopiedR2Link] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()

    // Poll every 3 seconds while pending
    const interval = setInterval(() => {
      fetchOrder()
    }, 3500)

    return () => clearInterval(interval)
  }, [id])

  const handleCopyLink = () => {
    if (order?.weTransferLink) {
      navigator.clipboard.writeText(order.weTransferLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleCopyR2Link = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedR2Link(true)
    setTimeout(() => setCopiedR2Link(false), 2000)
  }

  const handleCopyId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleDownloadR2 = async () => {
    if (!order) return
    const key = order.r2Key || (order.items && (order.items as any)[0]?.r2Key)
    if (!key) return

    setGeneratingR2(true)
    setR2Error(null)

    try {
      const res = await fetch('/api/r2/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          orderId: order.id,
          filename: `${order.items[0]?.title || 'soniq-pack'}.zip`,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'R2 татах холбоос үүсгэхэд алдаа гарлаа.')
      }

      setR2DownloadUrl(data.downloadUrl)
      // Trigger download in browser
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = `${order.items[0]?.title || 'soniq-pack'}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: unknown) {
      const error = err as Error
      setR2Error(error.message)
    } finally {
      setGeneratingR2(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#141414] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-6 h-6 text-[#00B0FF] animate-spin mb-3" />
        <p className="text-xs font-semibold text-zinc-500">Захиалгын мэдээлэл уншиж байна...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#141414] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-[#141414] mb-2">Захиалга олдсонгүй</h2>
        <p className="text-xs text-zinc-500 max-w-sm mb-5">
          Таны оруулсан захиалгын код системд бүртгэгдээгүй байна.
        </p>
        <Link
          href="/shop"
          className="px-4 py-2 rounded-full bg-[#141414] text-white font-semibold text-xs"
        >
          Дэлгүүр рүү буцах
        </Link>
      </div>
    )
  }

  const isApproved = order.status === 'APPROVED'

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#141414] py-8 sm:py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E6E6E3]">
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Дэлгүүр</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Захиалгын код:</span>
            <span className="font-mono font-bold text-xs text-[#141414] bg-white border border-[#E6E6E3] px-2 py-0.5 rounded">
              {order.id}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 text-zinc-400 hover:text-black rounded bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
              title="Код хуулах"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Status Card */}
        {isApproved ? (
          /* APPROVED / DOWNLOAD UNLOCKED SCREEN */
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase mb-2 border border-emerald-200">
                <Sparkles className="w-3 h-3" />
                <span>ТӨЛБӨР БАТАЛГААЖСАН · ТАТАХ БОЛОМЖТОЙ</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#141414]">
                Баяр хүргэе, {order.customerName}!
              </h1>

              <p className="mt-1.5 text-xs text-zinc-600 max-w-md leading-relaxed">
                Таны төлбөр амжилттай баталгаажлаа. Доорх товч дээр даран өндөр хурдны серверээс файл багцаа шууд татаж авна уу.
              </p>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200/60 text-[#0088CC] text-[11px] font-semibold mt-2.5">
                <span>✉️ Татах холбоосыг таны <strong>{order.customerEmail}</strong> хаяг руу бас и-мэйлээр илгээсэн.</span>
              </div>

              {/* R2 Direct Download and/or WeTransfer */}
              <div className="w-full max-w-md mt-5 space-y-3">
                {order.r2Key && (
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadR2}
                      disabled={generatingR2}
                      className="w-full py-3.5 px-5 rounded-full bg-[#141414] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      {generatingR2 ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-[#00B0FF] animate-spin" />
                          <span>ТАТАХ ХОЛБООС ҮҮСГЭЖ БАЙНА...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-4 h-4 text-[#00B0FF]" />
                          <span>ШУУД ТАТАЖ АВАХ (R2 ӨНДӨР ХУРД)</span>
                          <Download className="w-4 h-4 text-[#00B0FF] ml-1" />
                        </>
                      )}
                    </button>

                    {r2Error && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{r2Error}</span>
                      </div>
                    )}

                    {r2DownloadUrl && (
                      <div className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-2 text-xs text-zinc-600 justify-between">
                        <span className="font-mono text-[10px] truncate max-w-[240px] text-zinc-500">
                          {r2DownloadUrl}
                        </span>
                        <button
                          onClick={() => handleCopyR2Link(r2DownloadUrl)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-[#E6E6E3] text-zinc-700 font-semibold text-[10px] hover:bg-zinc-50 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedR2Link ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Хуулагдлаа</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Линк хуулах</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {order.weTransferLink && (
                  <div className="space-y-2">
                    <a
                      href={order.weTransferLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                        order.r2Key
                          ? 'bg-white hover:bg-zinc-50 text-zinc-800 border border-[#E6E6E3]'
                          : 'bg-[#141414] hover:bg-black text-white'
                      }`}
                    >
                      <Download className="w-4 h-4 text-[#00B0FF]" />
                      <span>
                        {order.weTransferLink.includes('drive.google.com')
                          ? (order.r2Key ? 'GOOGLE DRIVE ТАТАХ (НӨӨЦ ХОЛБООС)' : 'GOOGLE DRIVE-ААР ТАТАЖ АВАХ')
                          : (order.r2Key ? 'WETRANSFER ТАТАХ (НӨӨЦ ХОЛБООС)' : 'WETRANSFER-ЭЭР ТАТАЖ АВАХ')}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>

                    {order.weTransferLink.includes('drive.google.com') && (
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-left text-xs text-blue-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-blue-900">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Google Drive хандах эрх нээгдсэн</span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          Таны захиалга өгсөн <span className="font-mono font-bold text-blue-950 bg-blue-100/60 px-1 py-0.5 rounded">{order.customerEmail}</span> Gmail хаягт Google Drive-аар хандах эрх олгогдсон тул дээрх товч дээр дарж шууд татах эсвэл өөрийн Google Drive-даа хадгалж авна уу.
                        </p>
                      </div>
                    )}

                    {!order.r2Key && (
                      <div className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-2 text-xs text-zinc-600 justify-between">
                        <span className="font-mono text-[11px] truncate max-w-[240px]">
                          {order.weTransferLink}
                        </span>
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E6E6E3] text-zinc-700 font-semibold text-[11px] hover:bg-zinc-50 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Хуулагдлаа</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Линк хуулах</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!order.r2Key && !order.weTransferLink && (
                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-100 text-xs text-zinc-500">
                    Линк бэлтгэгдэж байна, түр хүлээгээд хуудсаа дахин ачааллана уу.
                  </div>
                )}
              </div>

              {/* Quick instructions */}
              <div className="mt-5 pt-4 border-t border-[#E6E6E3] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left w-full text-xs text-zinc-600">
                <div className="bg-[#F7F7F5] p-2.5 rounded-lg border border-[#E6E6E3]">
                  <span className="font-bold text-zinc-800 block mb-0.5">1. Татах</span>
                  Google Drive / Cloud дээр &apos;Download&apos; дарж татна.
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-lg border border-[#E6E6E3]">
                  <span className="font-bold text-zinc-800 block mb-0.5">2. Задлах</span>
                  ZIP архивыг задлаад Timeline руугаа чирнэ.
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-lg border border-[#E6E6E3]">
                  <span className="font-bold text-zinc-800 block mb-0.5">3. Лиценз</span>
                  YouTube болон арилжааны видеонд 100% чөлөөтэй.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PENDING APPROVAL SCREEN */
          <div className="bg-white border border-[#E6E6E3] rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase mb-2 border border-amber-200">
                <span>ТӨЛБӨР ШАЛГАГДАЖ БАЙНА</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#141414]">
                Төлбөр шалгагдаж байна
              </h1>

              <p className="mt-1.5 text-xs text-zinc-600 max-w-md leading-relaxed">
                Таны шилжүүлсэн төлбөрийг манай админ шалгаж байна. Баталгаажмагц таны{' '}
                <span className="font-semibold text-zinc-900">{order.customerEmail}</span> хаяг руу болон энэ хуудсанд WeTransfer линк шууд нээгдэнэ.
              </p>

              {/* Auto polling notice */}
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin text-[#00B0FF]" />
                <span>Хуудас төлөвийг автоматаар шалгаж байна</span>
              </div>

              {/* Support shortcuts */}
              <div className="mt-5 p-3 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3] w-full max-w-sm text-center">
                <span className="text-[11px] text-zinc-600 block mb-2 font-medium">
                  Хурдан баталгаажуулахыг хүсвэл баримтаа илгээнэ үү:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={STORE_SETTINGS.bankInfo.supportInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E6E6E3] text-[11px] font-semibold text-zinc-700 hover:text-black transition-colors"
                  >
                    <InstagramIcon className="w-3 h-3 text-pink-500" />
                    <span>Instagram DM</span>
                  </a>
                  <a
                    href={STORE_SETTINGS.bankInfo.supportTelegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E6E6E3] text-[11px] font-semibold text-zinc-700 hover:text-black transition-colors"
                  >
                    <TelegramIcon className="w-3 h-3 text-blue-500" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Breakdown */}
        <div className="bg-white border border-[#E6E6E3] rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
            Захиалгын задаргаа
          </h3>

          <div className="divide-y divide-[#E6E6E3]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-zinc-400" />
                  <div>
                    <span className="font-semibold text-zinc-800 block">{item.title}</span>
                    <span className="text-[10px] text-zinc-400">Тоо ширхэг: {item.quantity}</span>
                  </div>
                </div>
                <div className="font-mono font-semibold text-zinc-800">
                  {order.currency === 'USD'
                    ? `$${(item.priceUSD * item.quantity).toFixed(2)}`
                    : `${(item.price * item.quantity).toLocaleString()}₮`}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Нийт төлсөн дүн:</span>
            <span className="text-base font-extrabold text-[#141414]">
              {order.currency === 'USD'
                ? `$${order.totalAmountUSD.toFixed(2)}`
                : `${order.totalAmountMNT.toLocaleString()}₮`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] bg-[#F7F7F5] p-3 rounded-xl border border-[#E6E6E3]">
            <div>
              <span className="text-zinc-400 block">Захиалагч:</span>
              <span className="font-semibold text-zinc-800">{order.customerName}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">И-мэйл:</span>
              <span className="font-semibold text-zinc-800">{order.customerEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
