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
} from 'lucide-react'
import { STORE_SETTINGS } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

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

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Бүх талбарыг (нэр, и-мэйл, утасны дугаар) бүрэн бөглөнө үү.')
      return
    }

    if (!email.includes('@')) {
      setErrorMsg('Зөв и-мэйл хаяг оруулна уу (Google Drive эрх энэ хаягт очно).')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          receiptNote,
          items: itemsToBuy,
          totalAmountMNT: totalMNT,
          totalAmountUSD: totalUSD,
          currency,
          paymentMethod: 'KHAN_BANK',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Захиалга үүсгэхэд алдаа гарлаа.')
      }

      clearCart()
      setIsCheckoutOpen(false)
      router.push(`/order/${data.orderId}`)
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
        onClick={() => setIsCheckoutOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer animate-in fade-in"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white border border-[#E6E6E3] rounded-2xl p-6 sm:p-7 shadow-xl z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsCheckoutOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

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
    </div>
  )
}
