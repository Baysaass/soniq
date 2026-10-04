'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Copy,
  Check,
  Building,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Send,
  Gift,
  Download,
  ExternalLink,
  Cloud,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { STORE_SETTINGS } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'
import { SafeProductImage } from '@/components/store/safe-image'

export function StoreCheckoutModal() {
  const router = useRouter()
  const {
    settings,
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutTargetProduct,
    cart,
    cartTotalMNT,
    cartTotalUSD,
    currency,
    formatPrice,
    clearCart,
  } = useStore()

  const bankInfo = settings?.bankInfo || STORE_SETTINGS.bankInfo

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [receiptNote, setReceiptNote] = useState('')
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // State for Instant Free Download Claim
  const [claimedOrder, setClaimedOrder] = useState<{
    id: string
    weTransferLink?: string | null
    r2Key?: string | null
    customerEmail?: string
  } | null>(null)
  const [copiedDownloadLink, setCopiedDownloadLink] = useState(false)
  const [generatingR2, setGeneratingR2] = useState(false)
  const [r2DownloadUrl, setR2DownloadUrl] = useState<string | null>(null)
  const [r2Error, setR2Error] = useState<string | null>(null)

  if (!isCheckoutOpen) return null

  const itemsToBuy = checkoutTargetProduct
    ? [
        {
          id: checkoutTargetProduct.id,
          title: checkoutTargetProduct.title,
          price: checkoutTargetProduct.priceMNT,
          priceUSD: checkoutTargetProduct.priceUSD,
          image: checkoutTargetProduct.image,
          quantity: 1,
          weTransferLink: checkoutTargetProduct.defaultWeTransferLink,
          r2Key: checkoutTargetProduct.r2Key,
        },
      ]
    : cart.map((item) => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.priceMNT,
        priceUSD: item.product.priceUSD,
        image: item.product.image,
        quantity: item.quantity,
        weTransferLink: item.product.defaultWeTransferLink,
        r2Key: item.product.r2Key,
      }))

  const totalMNT = checkoutTargetProduct
    ? checkoutTargetProduct.priceMNT
    : cartTotalMNT
  const totalUSD = checkoutTargetProduct
    ? checkoutTargetProduct.priceUSD
    : cartTotalUSD

  const isFree = (Number(totalMNT) === 0 && Number(totalUSD) === 0) || (checkoutTargetProduct?.isFree === true)

  const handleClose = () => {
    setIsCheckoutOpen(false)
    setClaimedOrder(null)
    setR2DownloadUrl(null)
    setR2Error(null)
    setErrorMsg('')
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedDownloadLink(true)
    setTimeout(() => setCopiedDownloadLink(false), 2000)
  }

  const handleDownloadR2 = async () => {
    if (!claimedOrder) return
    const key = claimedOrder.r2Key || (itemsToBuy[0]?.r2Key)
    if (!key) return

    setGeneratingR2(true)
    setR2Error(null)

    try {
      const res = await fetch('/api/r2/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          orderId: claimedOrder.id,
          filename: `${itemsToBuy[0]?.title || 'soniq-free-pack'}.zip`,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'R2 татах холбоос үүсгэхэд алдаа гарлаа.')
      }

      setR2DownloadUrl(data.downloadUrl)
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = `${itemsToBuy[0]?.title || 'soniq-free-pack'}.zip`
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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Зөв и-мэйл хаяг (Gmail) оруулна уу.')
      return
    }

    if (!isFree) {
      if (!name.trim() || !phone.trim()) {
        setErrorMsg('Бүх талбарыг (нэр, и-мэйл, утасны дугаар) бүрэн бөглөнө үү.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const customerFinalName = name.trim() || email.split('@')[0] || 'Зочин'
      const customerFinalPhone = phone.trim() || (isFree ? 'Үнэгүй таталт' : '')

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerFinalName,
          customerEmail: email.trim(),
          customerPhone: customerFinalPhone,
          receiptNote: isFree ? 'Үнэгүй таталт' : receiptNote,
          items: itemsToBuy,
          totalAmountMNT: isFree ? 0 : totalMNT,
          totalAmountUSD: isFree ? 0 : totalUSD,
          currency,
          paymentMethod: isFree ? 'FREE_DOWNLOAD' : 'KHAN_BANK',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Захиалга үүсгэхэд алдаа гарлаа.')
      }

      clearCart()

      // For free downloads: show instant download screen directly in the modal!
      if (isFree) {
        const resolvedDrive = (data.weTransferLink ?? data.order?.weTransferLink ?? '')?.trim()
        const resolvedR2 = (data.r2Key ?? data.order?.r2Key ?? '')?.trim()

        setClaimedOrder({
          id: data.orderId,
          weTransferLink: resolvedDrive || undefined,
          r2Key: resolvedR2 || undefined,
          customerEmail: email.trim(),
        })
        setIsSubmitting(false)
      } else {
        setIsCheckoutOpen(false)
        router.push(`/order/${data.orderId}`)
      }
    } catch (err: unknown) {
      const error = err as Error
      setErrorMsg(error.message || 'Сүлжээний алдаа гарлаа.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center font-sans">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer animate-in fade-in"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white border border-[#E6E6E3] rounded-2xl p-6 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ------------------------------------------------------------- */}
        {/* CASE A: FREE PRODUCT CLAIMED SUCCESSFULLY -> INSTANT DOWNLOAD */}
        {/* ------------------------------------------------------------- */}
        {isFree && claimedOrder ? (
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs animate-in zoom-in-75">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase mb-2 border border-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>БАТАЛГААЖЛАА · ТАТАХ ЭРХ НЭЭГДЛЭЭ</span>
              </div>
              <h3 className="text-xl font-black text-[#141414]">
                Татах холбоос бэлэн боллоо!
              </h3>
              <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto leading-relaxed">
                Таны үнэгүй бүтээгдэхүүнийг амжилттай баталгаажууллаа. Та доорх товч дээр дарж шууд татаж авна уу.
              </p>
            </div>

            {/* Product summary pill */}
            <div className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-3 flex items-center gap-3 text-left">
              {itemsToBuy[0]?.image && (
                <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-200 border border-zinc-200">
                  <SafeProductImage
                    src={itemsToBuy[0].image}
                    alt={itemsToBuy[0].title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-zinc-900 truncate">
                  {itemsToBuy.map((i) => i.title).join(', ')}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <Gift className="w-3 h-3" />
                  <span>100% ҮНЭГҮЙ (0₮)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-zinc-500">
                  #{claimedOrder.id}
                </span>
              </div>
            </div>

            {/* Action Buttons: Instant Downloads */}
            <div className="space-y-2.5 pt-2">
              {/* Option 1: Google Drive / Direct Link */}
              {claimedOrder.weTransferLink && (
                <div className="space-y-1.5">
                  <a
                    href={claimedOrder.weTransferLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-full bg-[#141414] hover:bg-black text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <Download className="w-4 h-4 text-[#00B0FF] group-hover:translate-y-0.5 transition-transform" />
                    <span>
                      {claimedOrder.weTransferLink.includes('drive.google.com')
                        ? 'Google Drive-аар шууд татах'
                        : 'Шууд холбоосоор татаж авах'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(claimedOrder.weTransferLink!)}
                    className="text-[11px] text-zinc-500 hover:text-black font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    {copiedDownloadLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Татах холбоос хуулагдлаа!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Татах линкийг хуулах</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Option 2: Cloudflare R2 */}
              {claimedOrder.r2Key && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadR2}
                    disabled={generatingR2}
                    className={`w-full py-3.5 px-5 rounded-full font-bold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                      claimedOrder.weTransferLink
                        ? 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700'
                        : 'bg-[#141414] hover:bg-black text-white'
                    }`}
                  >
                    {generatingR2 ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#00B0FF]" />
                        <span>R2 холбоос үүсгэж байна...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 text-[#00B0FF]" />
                        <span>Cloudflare R2-оор шууд татах (Өндөр хурд)</span>
                        <Download className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>

                  {r2DownloadUrl && (
                    <div className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-2 text-xs text-zinc-600 justify-between">
                      <span className="font-mono text-[10px] truncate max-w-[240px] text-zinc-500">
                        {r2DownloadUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(r2DownloadUrl)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-[#E6E6E3] text-zinc-700 font-semibold text-[10px] hover:bg-zinc-50 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedDownloadLink ? (
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

                  {r2Error && (
                    <p className="text-[11px] text-red-600 mt-1">{r2Error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Email note */}
            {claimedOrder.customerEmail && (
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900 leading-snug">
                ✉️ Татах холбоосыг мөн таны <strong>{claimedOrder.customerEmail}</strong> хаяг руу и-мэйлээр илгээлээ.
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/order/${claimedOrder.id}`)}
                className="text-xs text-zinc-600 hover:text-black font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <span>Захиалгын хуудас нээх</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-zinc-300">·</span>
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-zinc-600 hover:text-black font-semibold cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        ) : isFree ? (
          /* ------------------------------------------------------------- */
          /* CASE B: FREE PRODUCT CLAIM FORM -> ONLY EMAIL NEEDED!        */
          /* ------------------------------------------------------------- */
          <div>
            {/* Modal Header */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase mb-1.5 border border-emerald-200">
                <Gift className="w-3 h-3 text-emerald-600" />
                <span>100% ҮНЭГҮЙ БҮТЭЭГДЭХҮҮН</span>
              </div>
              <h3 className="text-lg font-bold text-[#141414]">
                Шууд үнэгүй татах
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Банкны шилжүүлэг, нэмэлт form бөглөх шаардлагагүй. Та зөвхөн и-мэйл хаягаа оруулснаар татах холбоос шууд дэлгэц дээр гарч ирнэ.
              </p>
            </div>

            {/* Order Summary Strip */}
            <div className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {itemsToBuy[0]?.image && (
                  <div className="relative w-10 h-8 rounded bg-zinc-200 overflow-hidden shrink-0 border border-zinc-200">
                    <SafeProductImage
                      src={itemsToBuy[0].image}
                      alt={itemsToBuy[0].title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 font-medium block">Бүтээгдэхүүн:</span>
                  <span className="font-bold text-zinc-900 line-clamp-1 block">
                    {itemsToBuy.map((i) => i.title).join(', ')}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-black text-emerald-600">
                  ҮНЭГҮЙ (0₮)
                </span>
              </div>
            </div>

            {/* Ultra-Simple Free Claim Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-3.5">
              {errorMsg && (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Gmail / И-мэйл хаяг <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="editor@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  💡 Google Drive эрх нээгдэж, татах холбоос шууд дэлгэц дээр болон энэ хаягт очно.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Таны нэр <span className="text-zinc-400 font-normal">(Сонголттой)</span>
                </label>
                <input
                  type="text"
                  placeholder="Жишээ: Бат"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Татах холбоос бэлтгэж байна...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>⚡ ШУУД ТАТАХ ХОЛБООС АВАХ (ҮНЭГҮЙ)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Спам явуулахгүй, шууд татах холбоос олгоно.</span>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* CASE C: PAID ORDER CHECKOUT (KHAN BANK ETC.)                  */
          /* ------------------------------------------------------------- */
          <div>
            {/* Modal Header */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0088CC] uppercase mb-1">
                <span>ЗАХИАЛГА БАТАЛГААЖУУЛАЛТ</span>
              </div>
              <h3 className="text-lg font-bold text-[#141414]">
                Төлбөр шилжүүлэх заавар
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Та шилжүүлэг хийснээр админ шалгаж, Google Drive татах эрх болон холбоос шууд олгоно.
              </p>
            </div>

            {/* Order Summary Strip */}
            <div className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-3 mb-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 font-medium">Сонгосон багц:</span>
                <span className="font-bold text-zinc-800 line-clamp-1 block">
                  {itemsToBuy.map((i) => i.title).join(', ')}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-[#141414]">
                  {formatPrice(totalMNT, totalUSD)}
                </span>
              </div>
            </div>

            {/* Bank Details Box */}
            <div className="bg-[#FAFAFA] border border-[#E6E6E3] rounded-xl p-3.5 mb-4 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2">
                <div className="flex items-center gap-1.5 font-bold text-[#141414]">
                  <Building className="w-3.5 h-3.5 text-[#00B0FF]" />
                  <span>{bankInfo.bankName}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Төгрөг (MNT)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Дансны дугаар:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#141414] text-sm">
                    {bankInfo.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1 text-zinc-500 hover:text-black rounded bg-zinc-200/60 hover:bg-zinc-200 cursor-pointer"
                    title="Данс хуулах"
                  >
                    {copiedAccount ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Хүлээн авагч:</span>
                <span className="font-semibold text-zinc-800">
                  {bankInfo.accountHolder}
                </span>
              </div>

              <div className="flex items-center justify-between bg-zinc-100 p-2 rounded-lg">
                <span className="text-zinc-600 font-medium">Гүйлгээний утга:</span>
                <span className="font-bold text-[#0088CC]">
                  Таны утасны дугаар эсвэл нэр
                </span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-3">
              {errorMsg && (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Бүтэн нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Жишээ: Батсүх"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    И-мэйл (Google Drive эрх олгох Gmail) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="editor@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF] transition-colors"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Энэ хаягт Google Drive-аар хандах эрх нээгдэж, татах холбоос очно.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Утасны дугаар <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9911-XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Гүйлгээний дугаар / Тэмдэглэл (Сонголтоор)
                </label>
                <input
                  type="text"
                  placeholder="Гүйлгээний дугаар эсвэл цаг"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF] transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-full bg-[#141414] hover:bg-black disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Илгээж байна...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>ТӨЛБӨР ШИЛЖҮҮЛСЭН, БАТАЛГААЖУУЛАХ</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-zinc-400 text-center">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Мэдээлэл нууцлалтай хадгалагдана.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
