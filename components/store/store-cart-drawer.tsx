'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import { useStore } from '@/lib/store-context'

export function StoreCartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    clearCart,
    cartTotalMNT,
    cartTotalUSD,
    formatPrice,
    setIsCheckoutOpen,
  } = useStore()

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const handleProceedToCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white border-l border-[#E6E6E3] shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[#E6E6E3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#00B0FF]" />
              <h3 className="font-bold text-sm text-[#141414]">Таны сагс</h3>
              <span className="text-[11px] bg-zinc-100 text-zinc-600 font-semibold px-2 py-0.2 rounded-full">
                {cart.length}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-2 text-zinc-300" />
                <p className="text-xs font-semibold text-zinc-600">Сагс одоогоор хоосон байна</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Дэлгүүрээс хүссэн багцаа сонгон сагсандаа нэмнэ үү.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
                >
                  Дэлгүүр үзэх
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3]"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 shrink-0 border border-zinc-200">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#141414] truncate">
                        {item.product.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 block">
                        WeTransfer таталт
                      </span>
                      <div className="font-mono text-xs font-bold text-[#141414] mt-0.5">
                        {formatPrice(item.product.priceMNT, item.product.priceUSD)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Хасах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer block ml-auto"
                >
                  Сагс цэвэрлэх
                </button>
              </>
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-[#E6E6E3] bg-[#FAFAFA] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Нийт дүн:</span>
                <span className="text-base font-extrabold text-[#141414]">
                  {formatPrice(cartTotalMNT, cartTotalUSD)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-white p-2 rounded-lg border border-[#E6E6E3]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Баталгаажмагц WeTransfer линк шууд олгогдоно.</span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-2.5 px-4 rounded-full bg-[#141414] hover:bg-black text-white font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Төлбөр төлөх (Checkout)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
