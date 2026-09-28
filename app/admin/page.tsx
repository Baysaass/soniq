'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  Lock,
  Settings,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Check,
  Package,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Volume2,
  X,
  AlertCircle,
  Save,
  Download,
  Building,
  Eye,
  Film,
  HardDrive,
  Cloud,
  Key,
  Database,
  KeyRound,
  ShieldCheck,
  LogOut,
  Mail,
  Send,
} from 'lucide-react'
import { STORE_SETTINGS, StoreProduct } from '@/lib/store-data'
import { SoniqMark, SoniqWordmark } from '@/components/logo'
import { R2FileUploader } from '@/components/admin/r2-file-uploader'
import type { Order } from '@/lib/orders-db'

interface StoreSettingsState {
  storeName: string
  subdomain: string
  currencyDefault: 'MNT' | 'USD'
  adminPasscode: string
  announcementText: string
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
    qpayShortcode: string
    supportInstagram: string
    supportTelegram: string
  }
  defaultBundleWeTransfer: string
  r2Config: {
    accountId: string
    accessKeyId: string
    secretAccessKey: string
    bucketName: string
    publicDomain: string
  }
}

export default function AdminPage() {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products')

  // Products State
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<StoreProduct> | null>(null)
  const [productModalError, setProductModalError] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [weTransferInput, setWeTransferInput] = useState('')
  const [orderR2KeyInput, setOrderR2KeyInput] = useState('')
  const [adminNotesInput, setAdminNotesInput] = useState('')
  const [approving, setApproving] = useState(false)
  const [orderFilterStatus, setOrderFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [sendEmailToggle, setSendEmailToggle] = useState(true)
  const [approvalSuccessInfo, setApprovalSuccessInfo] = useState<{
    orderId: string
    emailSent: boolean
    recipient: string
    previewUrl?: string
    error?: string
  } | null>(null)

  // Settings State
  const [settings, setSettings] = useState<StoreSettingsState>({
    ...STORE_SETTINGS,
    announcementText: 'Бүх багц 85% хямдралтай · WeTransfer шууд таталт',
    r2Config: {
      accountId: '',
      accessKeyId: '',
      secretAccessKey: '',
      bucketName: 'soniq-store',
      publicDomain: '',
    },
  })
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [testingR2, setTestingR2] = useState(false)
  const [r2TestResult, setR2TestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showR2Secret, setShowR2Secret] = useState(false)

  // Database status state
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [testingDB, setTestingDB] = useState(false)

  // Email service status state
  const [emailStatus, setEmailStatus] = useState<{
    hasKey: boolean
    keyPrefix: string
    emailFrom: string
    siteUrl: string
    isUsingDefaultOnboarding: boolean
  } | null>(null)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testEmailInput, setTestEmailInput] = useState('')
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)

  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ success: boolean; text: string } | null>(null)

  // Fetch Email Status
  const fetchEmailStatus = async (codeToUse?: string) => {
    const pc = codeToUse || passcode
    if (!pc) return
    try {
      const res = await fetch(`/api/admin/email-status?passcode=${encodeURIComponent(pc)}`)
      if (res.ok) {
        const data = await res.json()
        setEmailStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch email status:', err)
    }
  }

  // Fetch DB Status
  const fetchDBStatus = async () => {
    setTestingDB(true)
    try {
      const res = await fetch('/api/db/status')
      if (res.ok) {
        const data = await res.json()
        setDbStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch DB status:', err)
    } finally {
      setTestingDB(false)
    }
  }

  // Check persisted login
  useEffect(() => {
    const saved = sessionStorage.getItem('soniq_admin_passcode')
    if (saved) {
      // Validate saved passcode
      fetch(`/api/admin/password?passcode=${encodeURIComponent(saved)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setPasscode(saved)
            setIsAuthenticated(true)
            fetchProducts()
            fetchOrders(saved)
            fetchSettings()
            fetchDBStatus()
            fetchEmailStatus(saved)
          } else {
            sessionStorage.removeItem('soniq_admin_passcode')
          }
        })
        .catch(() => {
          setPasscode(saved)
          setIsAuthenticated(true)
          fetchProducts()
          fetchOrders(saved)
          fetchSettings()
          fetchDBStatus()
          fetchEmailStatus(saved)
        })
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    try {
      const res = await fetch(`/api/admin/password?passcode=${encodeURIComponent(passcode)}`)
      const data = await res.json()
      if (res.ok && data.valid) {
        setIsAuthenticated(true)
        sessionStorage.setItem('soniq_admin_passcode', passcode)
        setAuthError('')
        fetchProducts()
        fetchOrders(passcode)
        fetchSettings()
        fetchDBStatus()
        fetchEmailStatus(passcode)
      } else {
        setAuthError(data.error || 'Нууц үг буруу байна.')
      }
    } catch (err) {
      setAuthError('Холболтын алдаа гарлаа.')
    }
  }

  const handleTestSendEmail = async () => {
    if (!testEmailInput.trim() || !testEmailInput.includes('@')) {
      alert('Шалгах и-мэйл хаягаа зөв оруулна уу (Жишээ: yourname@gmail.com)')
      return
    }
    setTestingEmail(true)
    setEmailTestResult(null)
    try {
      const res = await fetch('/api/admin/email-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          testEmail: testEmailInput.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEmailTestResult({
          success: true,
          message: `✓ Амжилттай! ${testEmailInput} хаяг руу бодит и-мэйл илгээгдлээ. (Message ID: ${data.messageId})`,
        })
      } else {
        setEmailTestResult({
          success: false,
          error: data.error || (data.details ? JSON.stringify(data.details) : 'Resend алдаа буцаалаа'),
        })
      }
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        error: err.message || 'Сүлжээний алдаа гарлаа',
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('soniq_admin_passcode')
    setIsAuthenticated(false)
    setPasscode('')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChangeMessage(null)

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMessage({ success: false, text: 'Шинэ нууц үг баталгаажуулалттай таарахгүй байна.' })
      return
    }

    if (newPasswordInput.length < 6) {
      setPasswordChangeMessage({ success: false, text: 'Шинэ нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.' })
      return
    }

    setPasswordChangeLoading(true)
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
          confirmPassword: confirmPasswordInput,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setPasswordChangeMessage({ success: true, text: 'Админ нууц үг амжилттай шинэчлэгдлээ!' })
        setPasscode(newPasswordInput)
        sessionStorage.setItem('soniq_admin_passcode', newPasswordInput)
        setCurrentPasswordInput('')
        setNewPasswordInput('')
        setConfirmPasswordInput('')
        fetchSettings()
      } else {
        setPasswordChangeMessage({ success: false, text: data.error || 'Нууц үг солиход алдаа гарлаа.' })
      }
    } catch (err: any) {
      setPasswordChangeMessage({ success: false, text: err.message || 'Сүлжээний алдаа.' })
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  // Fetch Products
  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        if (data.products) {
          setProducts(data.products)
        }
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  // Fetch Orders
  const fetchOrders = async (code: string) => {
    setOrdersLoading(true)
    try {
      const res = await fetch(`/api/orders?passcode=${encodeURIComponent(code)}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            bankInfo: {
              ...prev.bankInfo,
              ...(data.settings.bankInfo || {}),
            },
            r2Config: {
              accountId: data.settings.r2Config?.accountId || '',
              accessKeyId: data.settings.r2Config?.accessKeyId || '',
              secretAccessKey: data.settings.r2Config?.secretAccessKey || '',
              bucketName: data.settings.r2Config?.bucketName || 'soniq-store',
              publicDomain: data.settings.r2Config?.publicDomain || '',
            },
          }))
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  // Test R2 Connection
  const handleTestR2 = async () => {
    setTestingR2(true)
    setR2TestResult(null)
    try {
      const res = await fetch('/api/r2/status')
      const data = await res.json()
      setR2TestResult({
        success: Boolean(data.success),
        message: data.message || data.error || (data.configured ? 'Амжилттай холбогдлоо.' : 'R2 тохируулаагүй байна.'),
      })
    } catch (err: unknown) {
      const error = err as Error
      setR2TestResult({
        success: false,
        message: error.message || 'R2 шалгахад алдаа гарлаа.',
      })
    } finally {
      setTestingR2(false)
    }
  }

  // Open Product Modal (New or Edit)
  const openNewProductModal = () => {
    setEditingProduct({
      id: '',
      title: '',
      slug: '',
      subtitle: '',
      description: '',
      category: 'sfx',
      badge: 'NEW',
      priceMNT: 29900,
      originalPriceMNT: 89000,
      priceUSD: 9.99,
      originalPriceUSD: 29.0,
      image: '/images/product-morph-3d.png',
      fileSize: '1.2 GB',
      format: 'WAV 24-bit / 96kHz Lossless',
      features: ['Өндөр чанарын аудио сан', '100% Royalty Free арилжааны лиценз', 'Timeline руу шууд чирч тавих'],
      compatibility: ['Premiere Pro', 'DaVinci Resolve', 'CapCut', 'After Effects'],
      defaultWeTransferLink: 'https://we.tl/t-soniq-pack',
      previewSoundType: 'whoosh',
      isBundle: false,
      sampleVideoUrl: '',
      r2Key: '',
    })
    setProductModalError('')
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (prod: StoreProduct) => {
    setEditingProduct({ ...prod })
    setProductModalError('')
    setIsProductModalOpen(true)
  }

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setProductModalError('')

    if (!editingProduct.title || !editingProduct.title.trim()) {
      setProductModalError('Бүтээгдэхүүний нэрийг оруулна уу.')
      return
    }

    setSavingProduct(true)

    try {
      const isEdit = Boolean(editingProduct.id)
      const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          passcode,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Бүтээгдэхүүн хадгалахад алдаа гарлаа.')
      }

      setIsProductModalOpen(false)
      fetchProducts()
    } catch (err: unknown) {
      const error = err as Error
      setProductModalError(error.message)
    } finally {
      setSavingProduct(false)
    }
  }

  // Delete Product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`"${title}" бүтээгдэхүүнийг дэлгүүрээс устгахдаа итгэлтэй байна уу?`)) {
      return
    }

    try {
      const res = await fetch(`/api/products/${id}?passcode=${encodeURIComponent(passcode)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchProducts()
      } else {
        alert(data.error || 'Устгахад алдаа гарлаа.')
      }
    } catch (err) {
      console.error(err)
      alert('Сүлжээний алдаа гарлаа.')
    }
  }

  // Toggle Bundle status
  const handleToggleBundle = async (product: StoreProduct) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBundle: !product.isBundle,
          passcode,
        }),
      })
      if (res.ok) {
        fetchProducts()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Approve Order
  const openApproveModal = (order: Order) => {
    setSelectedOrder(order)
    setWeTransferInput(order.weTransferLink || settings.defaultBundleWeTransfer)
    setOrderR2KeyInput(order.r2Key || (order.items && (order.items as any)[0]?.r2Key) || '')
    setAdminNotesInput(order.adminNotes || 'Хаан банк дээр гүйлгээ шалгагдаж баталгаажсан.')
    setSendEmailToggle(true)
  }

  const handleApproveOrder = async () => {
    if (!selectedOrder) return
    setApproving(true)

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          action: 'APPROVE',
          customWeTransferLink: weTransferInput.trim(),
          r2Key: orderR2KeyInput.trim(),
          adminNotes: adminNotesInput.trim(),
          sendEmail: sendEmailToggle,
          passcode,
        }),
      })

      const data = await res.json()
      if (data.success) {
        const isEmailSent = Boolean(data.emailResult?.success)
        setApprovalSuccessInfo({
          orderId: selectedOrder.id,
          emailSent: isEmailSent,
          recipient: selectedOrder.customerEmail,
          previewUrl: `/api/orders/${selectedOrder.id}/email-preview`,
          error: data.emailResult?.error,
        })
        if (!isEmailSent && sendEmailToggle) {
          alert(`Захиалга баталгаажлаа.\n\n⚠️ Анхааруулга: И-мэйл захиалагч руу илгээгдэж чадсангүй:\n${data.emailResult?.error || 'Resend тохиргоо дутуу'}`)
        }
        setSelectedOrder(null)
        fetchOrders(passcode)
      } else {
        alert(data.error || 'Баталгаажуулахад алдаа гарлаа.')
      }
    } catch (err) {
      console.error(err)
      alert('Сүлжээний алдаа гарлаа.')
    } finally {
      setApproving(false)
    }
  }

  const handleResendEmail = async (order: Order) => {
    if (!confirm(`${order.customerEmail} хаяг руу татах холбоосыг дахин и-мэйлээр илгээх үү?`)) return
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          action: 'RESEND_EMAIL',
          passcode,
        }),
      })
      const data = await res.json()
      if (data.success && data.emailResult?.success) {
        setApprovalSuccessInfo({
          orderId: order.id,
          emailSent: true,
          recipient: order.customerEmail,
          previewUrl: `/api/orders/${order.id}/email-preview`,
        })
        alert(data.message || `✓ И-мэйл амжилттай дахин илгээгдлээ: ${order.customerEmail}`)
      } else {
        alert(`⚠️ И-мэйл илгээхэд алдаа гарлаа:\n${data.error || data.emailResult?.error || 'Resend алдаа'}`)
      }
    } catch (e) {
      alert('Сүлжээний алдаа гарлаа.')
    }
  }

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          updates: settings,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 2500)
      } else {
        alert(data.error || 'Тохиргоо хадгалахад алдаа гарлаа.')
      }
    } catch (err) {
      console.error(err)
      alert('Сүлжээний алдаа гарлаа.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus !== 'ALL' && o.status !== orderFilterStatus) return false
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q))
      )
    }
    return true
  })

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length
  const totalRevenue = orders
    .filter((o) => o.status === 'APPROVED')
    .reduce((sum, o) => sum + (o.totalAmountMNT || 0), 0)

  // Passcode login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-[#E6E6E3] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#E5F6FF] text-[#00B0FF] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <SoniqMark className="w-5 h-auto text-[#00B0FF]" />
              <SoniqWordmark className="h-3 w-auto text-[#141414]" fill="currentColor" />
            </div>
            <h1 className="text-base font-bold text-[#141414]">Soniq Store Admin</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Бүтээгдэхүүн, захиалга ба дэлгүүрийн тохиргоог удирдах нууц үгээ оруулна уу.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="Админ нууц үг оруулна уу"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3] text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF]"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#141414] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Нэвтрэх
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E6E3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/shop" className="flex items-center gap-2 group">
              <SoniqMark className="w-5 h-auto text-[#00B0FF]" />
              <SoniqWordmark className="h-3 w-auto text-[#141414]" fill="currentColor" />
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#141414] text-white">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#F7F7F5] p-1 rounded-full border border-[#E6E6E3] text-xs">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#00B0FF]" />
              <span>Бүтээгдэхүүн ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Захиалга</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('settings')
                fetchDBStatus()
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-zinc-500" />
              <span>Дэлгүүрийн тохиргоо</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPasswordChangeMessage(null)
                setIsPasswordModalOpen(true)
              }}
              className="text-xs text-zinc-700 hover:text-black px-2.5 py-1 rounded-full hover:bg-zinc-100 flex items-center gap-1 border border-[#E6E6E3] cursor-pointer"
              title="Админ нууц үг солих"
            >
              <KeyRound className="w-3 h-3 text-amber-600" />
              <span className="hidden sm:inline">Нууц үг солих</span>
            </button>

            <Link
              href="/shop"
              target="_blank"
              className="text-xs text-zinc-600 hover:text-black px-2.5 py-1 rounded-full hover:bg-zinc-100 flex items-center gap-1"
            >
              <span>Дэлгүүр үзэх</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-red-600 p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Гарах"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ========================================================= */}
        {/* TAB 1: PRODUCTS MANAGER */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div>
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#141414] tracking-tight">
                  Бүтээгдэхүүний удирдлага
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Дэлгүүр дээр харагдаж буй бүх багцуудыг нэмэх, засах, устгах, үнэ ба WeTransfer линкийг тохируулах.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchProducts}
                  className="p-2 rounded-lg border border-[#E6E6E3] bg-white hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
                  title="Шинэчлэх"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={openNewProductModal}
                  className="py-2 px-3.5 rounded-full bg-[#141414] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Шинэ бүтээгдэхүүн нэмэх</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#E6E6E3] rounded-xl p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { key: 'all', label: 'Бүгд' },
                  { key: 'sfx', label: 'Sound FX' },
                  { key: 'luts', label: 'LUTs' },
                  { key: 'plugins', label: 'Plugins & Presets' },
                  { key: 'templates', label: 'Templates' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setProductCategoryFilter(cat.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      productCategoryFilter === cat.key
                        ? 'bg-[#141414] text-white'
                        : 'bg-[#F7F7F5] text-zinc-600 hover:bg-zinc-200/70'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Бүтээгдэхүүн хайх..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF]"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#E6E6E3] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    <tr>
                      <th className="py-2.5 px-3">Бүтээгдэхүүн</th>
                      <th className="py-2.5 px-3">Ангилал</th>
                      <th className="py-2.5 px-3">Үнэ (MNT / USD)</th>
                      <th className="py-2.5 px-3">Файл & Формат</th>
                      <th className="py-2.5 px-3">Sample Видео</th>
                      <th className="py-2.5 px-3">Файл хадгалалт (R2 / WeTransfer)</th>
                      <th className="py-2.5 px-3">Онцлох Bundle</th>
                      <th className="py-2.5 px-3 text-right">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E3]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <div className="max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                              <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 mb-1">
                              {productSearch.trim()
                                ? 'Хайлтын илэрц олдсонгүй'
                                : 'Бүтээгдэхүүний сан одоогоор хоосон байна'}
                            </h3>
                            <p className="text-xs text-zinc-500 mb-4">
                              {productSearch.trim()
                                ? `"${productSearch}" түлхүүр үгтэй тохирох бүтээгдэхүүн байхгүй байна.`
                                : 'Шинэ бүтээгдэхүүн нэмснээр дэлгүүрт автоматаар байрших болно.'}
                            </p>
                            {!productSearch.trim() && (
                              <button
                                onClick={openNewProductModal}
                                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#141414] hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Анхны бүтээгдэхүүн нэмэх</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-11 h-8 rounded bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                                <Image src={p.image} alt={p.title} fill className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-900 truncate max-w-[200px]">
                                  {p.title}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                                  /shop/product/{p.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F7F7F5] border border-[#E6E6E3] text-zinc-700">
                              {p.category}
                            </span>
                            {p.badge && (
                              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {p.badge}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            <div className="font-bold text-zinc-900">{p.priceMNT.toLocaleString()}₮</div>
                            <div className="text-[10px] text-zinc-400">${p.priceUSD.toFixed(2)}</div>
                          </td>

                          <td className="py-3 px-3 text-[11px] text-zinc-600">
                            <div>{p.fileSize}</div>
                            <div className="text-[10px] text-zinc-400">{p.format}</div>
                          </td>

                          <td className="py-3 px-3">
                            {p.sampleVideoUrl ? (
                              <a
                                href={p.sampleVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.8 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                                title={p.sampleVideoUrl}
                              >
                                <Film className="w-2.5 h-2.5" />
                                <span>Видеотой</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-zinc-400">Байхгүй</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {p.r2Key ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <Cloud className="w-2.5 h-2.5 text-[#0088CC]" />
                                  <span>R2 Cloud</span>
                                </span>
                                <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[130px]" title={p.r2Key}>
                                  {p.r2Key}
                                </div>
                              </div>
                            ) : p.defaultWeTransferLink ? (
                              <a
                                href={p.defaultWeTransferLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#0088CC] hover:underline flex items-center gap-1 font-mono truncate max-w-[130px]"
                                title={p.defaultWeTransferLink}
                              >
                                <span>WeTransfer</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-red-500 font-medium">Тохируулаагүй</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleBundle(p)}
                              className={`px-2 py-0.8 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                p.isBundle
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-zinc-100 text-zinc-400 hover:text-zinc-700'
                              }`}
                              title="Дэлгүүрийн нүүрний онцлох Ultimate Bundle болгох"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>{p.isBundle ? 'Онцлох Bundle' : 'Энгийн'}</span>
                            </button>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/shop/product/${p.slug}`}
                                target="_blank"
                                className="p-1 text-zinc-400 hover:text-black rounded hover:bg-zinc-100"
                                title="Хэрэглэгчийн хуудсыг үзэх"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1 text-[#0088CC] hover:text-[#006699] rounded hover:bg-blue-50 cursor-pointer"
                                title="Засах"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 cursor-pointer"
                                title="Устгах"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS MANAGER */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#141414] tracking-tight">
                  Захиалгын удирдлага
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Хаан банкны төлбөрийг шалгаад WeTransfer линкийг хэрэглэгчид баталгаажуулан илгээх.
                </p>
              </div>

              <button
                onClick={() => fetchOrders(passcode)}
                className="py-1.5 px-3 rounded-lg border border-[#E6E6E3] bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>Шинэчлэх</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-white border border-[#E6E6E3] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Нийт орлого (MNT)
                </span>
                <span className="text-xl font-black text-[#141414] mt-1 block">
                  {totalRevenue.toLocaleString()}₮
                </span>
              </div>

              <div className="bg-white border border-[#E6E6E3] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  Хүлээгдэж буй (Шалгах)
                </span>
                <span className="text-xl font-black text-amber-600 mt-1 block">
                  {pendingOrdersCount} захиалга
                </span>
              </div>

              <div className="bg-white border border-[#E6E6E3] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Баталгаажсан
                </span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">
                  {orders.filter((o) => o.status === 'APPROVED').length} захиалга
                </span>
              </div>
            </div>

            {approvalSuccessInfo && (
              <div
                className={`mb-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  approvalSuccessInfo.emailSent
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {approvalSuccessInfo.emailSent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div>
                      <span className="font-bold">{approvalSuccessInfo.orderId}</span> захиалга амжилттай баталгаажлаа!
                    </div>
                    {approvalSuccessInfo.emailSent ? (
                      <div className="text-emerald-800 font-medium mt-0.5">
                        ✓ Татах холбоос бүхий и-мэйл <strong>{approvalSuccessInfo.recipient}</strong> хаяг руу амжилттай илгээгдлээ.
                      </div>
                    ) : (
                      <div className="text-amber-800 font-medium mt-0.5">
                        ⚠️ Анхааруулга: Захиалагчийн и-мэйл рүү илгээгдсэнгүй: <strong>{approvalSuccessInfo.error || 'Resend тохиргоогоо шалгана уу'}</strong>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={approvalSuccessInfo.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-white border border-zinc-300 text-zinc-700 font-semibold text-[11px] hover:bg-zinc-50 flex items-center gap-1 shadow-2xs"
                  >
                    <Mail className="w-3 h-3 text-[#00B0FF]" />
                    <span>И-мэйл харах</span>
                  </a>
                  <button
                    onClick={() => setApprovalSuccessInfo(null)}
                    className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter Tabs & Search */}
            <div className="bg-white border border-[#E6E6E3] rounded-xl p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                {[
                  { key: 'ALL', label: 'Бүгд' },
                  { key: 'PENDING', label: `Хүлээгдэж буй (${pendingOrdersCount})` },
                  { key: 'APPROVED', label: 'Баталгаажсан' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setOrderFilterStatus(tab.key as any)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      orderFilterStatus === tab.key
                        ? 'bg-[#141414] text-white'
                        : 'bg-[#F7F7F5] text-zinc-600 hover:bg-zinc-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Нэр, утас, дугаараар хайх..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF]"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#E6E6E3] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    <tr>
                      <th className="py-2.5 px-3">Захиалгын ID</th>
                      <th className="py-2.5 px-3">Хэрэглэгч</th>
                      <th className="py-2.5 px-3">Авсан багц</th>
                      <th className="py-2.5 px-3">Төлөх дүн</th>
                      <th className="py-2.5 px-3">Гүйлгээний тэмдэглэл</th>
                      <th className="py-2.5 px-3">Төлөв</th>
                      <th className="py-2.5 px-3 text-right">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E3]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400">
                          Захиалга олдсонгүй.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                            {order.id}
                            <div className="text-[10px] text-zinc-400 font-normal">
                              {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-zinc-900">{order.customerName}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">{order.customerPhone || 'Утасгүй'}</div>
                            <div className="text-[10px] text-zinc-400">{order.customerEmail}</div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-zinc-800 max-w-xs truncate">
                              {order.items.map((i) => i.title).join(', ')}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {order.items.length} багц
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                            {order.totalAmountMNT.toLocaleString()}₮
                          </td>

                          <td className="py-3 px-3 text-[11px] text-zinc-600">
                            {order.receiptNote || '—'}
                          </td>

                          <td className="py-3 px-3">
                            {order.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Баталгаажсан</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>Хүлээгдэж буй</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {order.status === 'PENDING' ? (
                              <button
                                onClick={() => openApproveModal(order)}
                                className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Баталгаажуулах</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/order/${order.id}`}
                                  target="_blank"
                                  className="text-[11px] text-[#0088CC] hover:underline"
                                  title="Хэрэглэгчийн захиалгын баримт хуудас"
                                >
                                  Хуудас
                                </Link>
                                <a
                                  href={`/api/orders/${order.id}/email-preview`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-zinc-600 hover:text-black hover:underline flex items-center gap-0.5"
                                  title="Хэрэглэгчид илгээсэн и-мэйлийг бүтнээр нь харах"
                                >
                                  <Mail className="w-3 h-3 text-zinc-400" />
                                  <span>И-мэйл</span>
                                </a>
                                <button
                                  onClick={() => handleResendEmail(order)}
                                  className="text-[11px] text-zinc-600 hover:text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  title="И-мэйлийг хэрэглэгч рүү дахин илгээх"
                                >
                                  <Send className="w-3 h-3 text-zinc-400" />
                                  <span>Дахин илгээх</span>
                                </button>
                                <button
                                  onClick={() => openApproveModal(order)}
                                  className="text-[11px] text-zinc-400 hover:text-black underline cursor-pointer"
                                  title="Татах линкийг өөрчлөх"
                                >
                                  Линк солих
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STORE SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white border border-[#E6E6E3] rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="mb-6 pb-4 border-b border-[#E6E6E3]">
              <h2 className="text-lg font-bold text-[#141414]">
                Дэлгүүрийн мэдээлэл & Тохиргоо
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Банкны данс, холбоо барих сошиал болон зарын мэдээллүүдийг эндээс өөрчилнө.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Bank Details */}
              <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
                  <Building className="w-3.5 h-3.5 text-[#00B0FF]" />
                  <span>Хаан банкны дансны мэдээлэл</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Банкны нэр
                  </label>
                  <input
                    type="text"
                    value={settings.bankInfo.bankName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankInfo: { ...settings.bankInfo, bankName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Дансны дугаар
                    </label>
                    <input
                      type="text"
                      value={settings.bankInfo.accountNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankInfo: { ...settings.bankInfo, accountNumber: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      Хүлээн авагчийн нэр
                    </label>
                    <input
                      type="text"
                      value={settings.bankInfo.accountHolder}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankInfo: { ...settings.bankInfo, accountHolder: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Дээд зарын самбарын текст (Announcement text)
                </label>
                <input
                  type="text"
                  value={settings.announcementText || ''}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="Бүх багц 85% хямдралтай · WeTransfer шууд таталт"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                />
              </div>

              {/* Social Support Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Instagram холбоос
                  </label>
                  <input
                    type="text"
                    value={settings.bankInfo.supportInstagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankInfo: { ...settings.bankInfo, supportInstagram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Telegram холбоос
                  </label>
                  <input
                    type="text"
                    value={settings.bankInfo.supportTelegram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankInfo: { ...settings.bankInfo, supportTelegram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  />
                </div>
              </div>

              {/* Default WeTransfer link */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Анхдагч WeTransfer татах линк (Fallback link)
                </label>
                <input
                  type="url"
                  value={settings.defaultBundleWeTransfer}
                  onChange={(e) => setSettings({ ...settings, defaultBundleWeTransfer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                />
              </div>

              {/* Cloudflare R2 Storage Settings */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
                    <Cloud className="w-4 h-4 text-[#0088CC]" />
                    <span>Cloudflare R2 Storage (1GB+ файлуудын сан)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Zero Egress • S3 API
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  1GB – 10GB+ хэмжээтэй дуу, видео багцуудыг хэрэглэгчийн хөтчөөс шууд R2 сан руу хуулж, Vercel-ийн серверээр дамжуулахгүйгээр аюулгүй татуулах тохиргоо.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Cloudflare Account ID
                    </label>
                    <input
                      type="text"
                      value={settings.r2Config?.accountId || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          r2Config: { ...settings.r2Config, accountId: e.target.value },
                        })
                      }
                      placeholder="Жишээ: 1a2b3c4d5e6f7g8h9i0j..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      R2 Bucket Name
                    </label>
                    <input
                      type="text"
                      value={settings.r2Config?.bucketName || 'soniq-store'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          r2Config: { ...settings.r2Config, bucketName: e.target.value },
                        })
                      }
                      placeholder="soniq-store"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      R2 Access Key ID
                    </label>
                    <input
                      type="text"
                      value={settings.r2Config?.accessKeyId || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          r2Config: { ...settings.r2Config, accessKeyId: e.target.value },
                        })
                      }
                      placeholder="Access Key..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-zinc-700">
                        R2 Secret Access Key
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowR2Secret(!showR2Secret)}
                        className="text-[10px] text-[#0088CC] hover:underline cursor-pointer"
                      >
                        {showR2Secret ? 'Нуух' : 'Харах'}
                      </button>
                    </div>
                    <input
                      type={showR2Secret ? 'text' : 'password'}
                      value={settings.r2Config?.secretAccessKey || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          r2Config: { ...settings.r2Config, secretAccessKey: e.target.value },
                        })
                      }
                      placeholder="Secret Access Key..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Custom Domain эсвэл Public R2 URL (Сонголттой)
                  </label>
                  <input
                    type="text"
                    value={settings.r2Config?.publicDomain || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        r2Config: { ...settings.r2Config, publicDomain: e.target.value },
                      })
                    }
                    placeholder="https://files.soniq.click"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-200/80">
                  <button
                    type="button"
                    onClick={handleTestR2}
                    disabled={testingR2}
                    className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingR2 ? 'animate-spin' : ''}`} />
                    <span>{testingR2 ? 'Шалгаж байна...' : 'R2 Холболт шалгах'}</span>
                  </button>

                  {r2TestResult && (
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        r2TestResult.success ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {r2TestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span>{r2TestResult.message}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Database Status & Config */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
                    <Database className="w-4 h-4 text-[#0088CC]" />
                    <span>Өгөгдлийн сангийн төлөв (Database Connection)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        dbStatus?.provider === 'supabase'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : dbStatus?.provider === 'postgres'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span>{dbStatus?.provider === 'supabase' ? 'Supabase PostgreSQL' : dbStatus?.provider === 'postgres' ? 'PostgreSQL Direct' : 'Local Persistent DB'}</span>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {dbStatus?.message || 'Өгөгдлийн сангийн холболт бэлэн байна.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-[#E6E6E3]">
                    <span className="text-[10px] text-zinc-400 block font-mono">ТӨЛӨВ</span>
                    <span className={`font-bold ${dbStatus?.connected ? 'text-emerald-600' : 'text-red-500'}`}>
                      {dbStatus?.connected ? 'Идэвхтэй холбогдсон' : 'Салгагдсан'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E6E6E3]">
                    <span className="text-[10px] text-zinc-400 block font-mono">ХУРД (LATENCY)</span>
                    <span className="font-bold text-zinc-800 font-mono">
                      {dbStatus?.latencyMs !== undefined ? `${dbStatus.latencyMs} ms` : '-'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E6E6E3]">
                    <span className="text-[10px] text-zinc-400 block font-mono">БҮТЭЭГДЭХҮҮН</span>
                    <span className="font-bold text-zinc-800 font-mono">{dbStatus?.productsCount ?? products.length} ширхэг</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E6E6E3]">
                    <span className="text-[10px] text-zinc-400 block font-mono">ЗАХИАЛГА</span>
                    <span className="font-bold text-zinc-800 font-mono">{dbStatus?.ordersCount ?? orders.length} ширхэг</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-200/80">
                  <div className="text-[10px] text-zinc-400">
                    Production (Vercel) дээр <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">SUPABASE_URL</code> эсвэл <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">DATABASE_URL</code> оруулснаар cloud горимд автоматаар шилжинэ.
                  </div>
                  <button
                    type="button"
                    onClick={fetchDBStatus}
                    disabled={testingDB}
                    className="py-1 px-2.5 rounded-lg border border-[#E6E6E3] bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingDB ? 'animate-spin' : ''}`} />
                    <span>{testingDB ? 'Шалгаж байна...' : 'Шалгах'}</span>
                  </button>
                </div>
              </div>

              {/* Email Service (Resend) Diagnostics */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
                    <Mail className="w-4 h-4 text-[#0088CC]" />
                    <span>И-мэйл үйлчилгээний холболт (Resend Email Delivery)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        emailStatus?.hasKey
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${emailStatus?.hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span>{emailStatus?.hasKey ? 'Resend API Холбогдсон' : 'RESEND_API_KEY байхгүй'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E6E6E3]">
                    <span className="text-[10px] text-zinc-400 block font-mono">ИЛГЭЭХ ХАЯГ (EMAIL_FROM)</span>
                    <span className="font-bold text-zinc-800 font-mono text-[11px] block truncate">
                      {emailStatus?.emailFrom || 'Тодорхойгүй'}
                    </span>
                    {emailStatus?.isUsingDefaultOnboarding && (
                      <span className="text-[10px] text-amber-600 block mt-0.5">
                        ⚠️ Анхаар: onboarding@resend.dev хаягаар зөвхөн Resend-д бүртгэлтэй өөрийн и-мэйл рүү туршилт хийж болно. Хэрэглэгчид рүү илгээхийн тулд Vercel дээр EMAIL_FROM=SONIQ STORE &lt;order@soniq.click&gt; гэж тохируулна.
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E6E6E3]">
                    <span className="text-[10px] text-zinc-400 block font-mono">САЙТЫН ХОЛБООС (SITE_URL)</span>
                    <span className="font-bold text-zinc-800 font-mono text-[11px] block truncate">
                      {emailStatus?.siteUrl || 'https://shop.soniq.click'}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      И-мэйл доторх татах товчны үндсэн хаяг
                    </span>
                  </div>
                </div>

                {/* Live Test Email Tool */}
                <div className="pt-2 border-t border-zinc-200/80 space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-700 block">
                    И-мэйл илгээх холболт шууд шалгах (Live Test):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailInput}
                      onChange={(e) => setTestEmailInput(e.target.value)}
                      placeholder="Жишээ: yourname@gmail.com"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleTestSendEmail}
                      disabled={testingEmail}
                      className="py-1.5 px-3 rounded-lg bg-[#141414] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Send className={`w-3.5 h-3.5 ${testingEmail ? 'animate-spin' : ''}`} />
                      <span>{testingEmail ? 'Илгээж байна...' : 'Тест и-мэйл явуулах'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchEmailStatus()}
                      title="Төлөв шинэчлэх"
                      className="p-1.5 rounded-lg border border-[#E6E6E3] bg-white hover:bg-zinc-50 text-zinc-600 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {emailTestResult && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                        emailTestResult.success
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {emailTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        {emailTestResult.success ? (
                          <span>{emailTestResult.message}</span>
                        ) : (
                          <div>
                            <strong>И-мэйл илгээж чадсангүй:</strong>
                            <p className="mt-0.5 font-mono text-[11px] whitespace-pre-wrap">{emailTestResult.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Change Card */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Админ нэвтрэх нууц үг солих</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Одоогийн нууц үг
                    </label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Одоогийн нууц үг"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Шинэ нууц үг (дор хаяж 6 тэмдэгт)
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Шинэ нууц үг"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Шинэ нууц үг давтах
                    </label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Давтан оруулах"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                    />
                  </div>
                </div>

                {passwordChangeMessage && (
                  <div
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold ${
                      passwordChangeMessage.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}
                  >
                    {passwordChangeMessage.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span>{passwordChangeMessage.text}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={passwordChangeLoading || !currentPasswordInput || !newPasswordInput}
                    className="py-1.5 px-4 rounded-lg bg-[#141414] hover:bg-black disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>{passwordChangeLoading ? 'Шинэчилж байна...' : 'Нууц үг шинэчлэх'}</span>
                  </button>
                </div>
              </div>

              {settingsSaved && (
                <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Тохиргоо амжилттай шинэчлэгдлээ!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2.5 rounded-full bg-[#141414] hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? 'Хадгалж байна...' : 'ТОХИРГООГ ХАДГАЛАХ'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {/* ========================================================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          <div className="relative w-full max-w-2xl bg-white border border-[#E6E6E3] rounded-2xl p-6 shadow-xl z-10 my-8">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold text-[#0088CC] uppercase">
                {editingProduct.id ? 'БҮТЭЭГДЭХҮҮН ЗАСАХ' : 'ШИНЭ БҮТЭЭГДЭХҮҮН НЭМЭХ'}
              </span>
              <h3 className="text-base font-bold text-[#141414]">
                {editingProduct.id ? editingProduct.title : 'Шинэ дуу эсвэл өнгөний багц'}
              </h3>
            </div>

            {productModalError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{productModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Бүтээгдэхүүний нэр (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    placeholder="Жишээ: CYBERPUNK GLITCH SFX"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Slug (URL зам)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="Жишээ: cyberpunk-glitch-sfx"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Дэд гарчиг (Subtitle)
                </label>
                <input
                  type="text"
                  value={editingProduct.subtitle || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  placeholder="Товч тайлбар..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Ангилал</label>
                  <select
                    value={editingProduct.category || 'sfx'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  >
                    <option value="sfx">Sound FX</option>
                    <option value="luts">LUTs & Өнгө</option>
                    <option value="plugins">Plugins</option>
                    <option value="templates">Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Бейж (Badge)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="HOT / 85% OFF"
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Үнэ ₮ (MNT) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceMNT || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceMNT: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Хуучин үнэ ₮</label>
                  <input
                    type="number"
                    value={editingProduct.originalPriceMNT || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPriceMNT: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Үнэ $ (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.priceUSD || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceUSD: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Хуучин үнэ $</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.originalPriceUSD || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPriceUSD: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Файлын хэмжээ</label>
                  <input
                    type="text"
                    value={editingProduct.fileSize || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fileSize: e.target.value })}
                    placeholder="Жишээ: 1.2 GB"
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Сонсох төрөл</label>
                  <select
                    value={editingProduct.previewSoundType || 'whoosh'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, previewSoundType: e.target.value as any })}
                    className="w-full px-2.5 py-1.8 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                  >
                    <option value="whoosh">Whoosh (Шилжилт)</option>
                    <option value="braam">Braam (Гүн басс)</option>
                    <option value="impact">Impact (Цохилт)</option>
                    <option value="ui">UI Pop (Товшилт)</option>
                    <option value="glitch">Glitch (Глитч)</option>
                    <option value="anime">Anime (Хурд)</option>
                    <option value="riser">Riser (Өсөлт)</option>
                  </select>
                </div>
              </div>

              {/* Cloudflare R2 Direct Upload & Storage */}
              <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#0088CC]" />
                    <span>Cloudflare R2 Файл Байршуулалт (1GB - 10GB+ Шууд Upload)</span>
                  </label>
                  {editingProduct.r2Key ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>R2 Файл холбогдсон</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-mono">Шууд Browser → R2</span>
                  )}
                </div>

                <R2FileUploader
                  passcode={passcode}
                  category={editingProduct.category || 'sfx'}
                  currentKey={editingProduct.r2Key}
                  onUploadSuccess={(key, size) => {
                    setEditingProduct({
                      ...editingProduct,
                      r2Key: key,
                      fileSize: size || editingProduct.fileSize,
                      defaultWeTransferLink: editingProduct.defaultWeTransferLink || `https://r2.soniq.click/${key}`,
                    })
                  }}
                  onOpenSettings={() => {
                    setIsProductModalOpen(false)
                    setActiveTab('settings')
                  }}
                />

                <div className="pt-1">
                  <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                    Эсвэл R2 Object Key гараар тохируулах (Сонголттой):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingProduct.r2Key || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, r2Key: e.target.value })}
                      placeholder="Жишээ: sfx/cinematic-braams-risers.zip"
                      className="w-full px-3 py-1.8 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                    />
                    {editingProduct.r2Key && (
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, r2Key: '' })}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs cursor-pointer shrink-0"
                        title="R2 түлхүүр арилгах"
                      >
                        Арилгах
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-zinc-700">
                    WeTransfer татах линк (Нөөц / Альтернатив линк)
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    {editingProduct.r2Key ? 'Сонголттой (R2 байгаа)' : 'R2 тохируулаагүй бол заавал *'}
                  </span>
                </div>
                <input
                  type="url"
                  required={!editingProduct.r2Key}
                  value={editingProduct.defaultWeTransferLink || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, defaultWeTransferLink: e.target.value })}
                  placeholder="https://we.tl/t-xxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                />
              </div>

              {/* Sample Video Field */}
              <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E6E6E3] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-[#0088CC]" />
                    <span>Sample Video линк (Үзүүлэх бичлэг)</span>
                  </label>
                  {editingProduct.sampleVideoUrl ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Линк оруулсан
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Сонголттой (Заавал биш)</span>
                  )}
                </div>

                <input
                  type="url"
                  value={editingProduct.sampleVideoUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sampleVideoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... эсвэл https://youtu.be/... эсвэл шууд .mp4 линк"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                />

                <p className="text-[11px] text-zinc-500">
                  YouTube, Vimeo эсвэл шууд .mp4 бичлэгийн линк оруулбал бүтээгдэхүүний дэлгэрэнгүй хуудсанд бодит видео тоглуулагчаар автоматаар гарна.
                </p>

                {editingProduct.sampleVideoUrl && (
                  <div className="mt-1 p-2 bg-white rounded-lg border border-zinc-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-zinc-700">
                        {editingProduct.sampleVideoUrl.includes('youtube') || editingProduct.sampleVideoUrl.includes('youtu.be')
                          ? 'YouTube Видео (Embed)'
                          : editingProduct.sampleVideoUrl.includes('vimeo')
                          ? 'Vimeo Видео'
                          : 'Шууд видео (.mp4/веб)'}
                      </span>
                    </div>
                    <a
                      href={editingProduct.sampleVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0088CC] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Шалгах</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Зургийн холбоос (Image URL)
                </label>
                <input
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="/images/product-morph-3d.png"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Онцлогууд (Features - Мөр тус бүрт 1 онцлог бичнэ үү)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(editingProduct.features) ? editingProduct.features.join('\n') : ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  placeholder="500+ Lossless WAV дуунууд&#10;100% Royalty Free лиценз&#10;Premiere Pro нийцтэй"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                <input
                  type="checkbox"
                  id="isBundleToggle"
                  checked={Boolean(editingProduct.isBundle)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isBundle: e.target.checked })}
                  className="w-4 h-4 rounded text-[#00B0FF] cursor-pointer"
                />
                <label htmlFor="isBundleToggle" className="text-xs font-semibold text-zinc-800 cursor-pointer">
                  Энэ бүтээгдэхүүнийг дэлгүүрийн нүүрний <strong>Онцлох Ultimate Bundle</strong> болгох
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E6E6E3]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-2 px-4 rounded-full border border-[#E6E6E3] bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Болих
                </button>

                <button
                  type="submit"
                  disabled={savingProduct}
                  className="py-2 px-5 rounded-full bg-[#141414] hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {savingProduct ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: APPROVE ORDER WITH WETRANSFER */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          <div className="relative w-full max-w-lg bg-white border border-[#E6E6E3] rounded-2xl p-6 shadow-xl z-10">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">
                ЗАХИАЛГА БАТАЛГААЖУУЛАЛТ
              </span>
              <h3 className="text-base font-bold text-[#141414]">
                WeTransfer татах линк олгох
              </h3>
            </div>

            <div className="bg-[#F7F7F5] border border-[#E6E6E3] rounded-xl p-3 mb-4 text-xs space-y-1">
              <div>
                <span className="text-zinc-500">Захиалга: </span>
                <span className="font-mono font-bold text-zinc-900">{selectedOrder.id}</span>
              </div>
              <div>
                <span className="text-zinc-500">Захиалагч: </span>
                <span className="font-bold text-zinc-900">{selectedOrder.customerName}</span> ({selectedOrder.customerPhone || 'Утасгүй'})
              </div>
              <div>
                <span className="text-zinc-500">Багц: </span>
                <span className="font-semibold text-zinc-800">{selectedOrder.items.map((i) => i.title).join(', ')}</span>
              </div>
              <div>
                <span className="text-zinc-500">Төлсөн дүн: </span>
                <span className="font-mono font-bold text-emerald-700">{selectedOrder.totalAmountMNT.toLocaleString()}₮</span>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-[#0088CC]" />
                  <span>Cloudflare R2 Key (Өндөр хурдны шууд таталт)</span>
                </label>
                <input
                  type="text"
                  value={orderR2KeyInput}
                  onChange={(e) => setOrderR2KeyInput(e.target.value)}
                  placeholder="Жишээ: sfx/cinematic-braams-risers.zip"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                />
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  R2 түлхүүр оруулбал хэрэглэгч захиалгын хуудсаасаа шууд 1GB-10GB+ файлаа дээд хурдаар татна.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  WeTransfer татах линк (Хэрэглэгчид очих нөөц эсвэл үндсэн линк)
                </label>
                <input
                  type="url"
                  value={weTransferInput}
                  onChange={(e) => setWeTransferInput(e.target.value)}
                  placeholder="https://we.tl/t-xxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] font-mono text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Админы тэмдэглэл
                </label>
                <input
                  type="text"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E6E3] text-xs text-zinc-900"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 mb-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmailToggle}
                  onChange={(e) => setSendEmailToggle(e.target.checked)}
                  className="mt-0.5 rounded border-blue-300 text-[#0088CC] focus:ring-[#00B0FF]"
                />
                <div className="text-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0088CC]" />
                    <span>Татах холбоосыг хэрэглэгчийн и-мэйл рүү илгээх</span>
                  </div>
                  <div className="text-blue-700 text-[11px] mt-0.5">
                    Хүлээн авагч: <span className="font-mono font-semibold">{selectedOrder.customerEmail}</span>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#E6E6E3] pt-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2 px-4 rounded-full border border-[#E6E6E3] bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Болих
              </button>

              <button
                onClick={handleApproveOrder}
                disabled={approving || (!weTransferInput.trim() && !orderR2KeyInput.trim())}
                className="py-2 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approving ? 'Баталгаажуулж байна...' : 'Баталгаажуулж Линк Олгох'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CHANGE ADMIN PASSWORD MODAL */}
      {/* ========================================================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPasswordModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E6E6E3] p-5 sm:p-6 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E6E3] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Админ нууц үг солих</h3>
                  <p className="text-[11px] text-zinc-500">Системд нэвтрэх шинэ нууц үг тохируулах</p>
                </div>
              </div>

              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Одоогийн нууц үг
                </label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Одоогийн нууц үгээ оруулна уу"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3] text-xs text-zinc-900 focus:outline-none focus:border-[#00B0FF]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Шинэ нууц үг (дор хаяж 6 тэмдэгт)
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Шинэ хүчтэй нууц үг"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3] text-xs text-zinc-900 focus:outline-none focus:border-[#00B0FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Шинэ нууц үг баталгаажуулах
                </label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Шинэ нууц үгээ дахин оруулна уу"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3] text-xs text-zinc-900 focus:outline-none focus:border-[#00B0FF]"
                />
              </div>

              {passwordChangeMessage && (
                <div
                  className={`flex items-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold ${
                    passwordChangeMessage.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {passwordChangeMessage.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span>{passwordChangeMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="py-2 px-4 rounded-full border border-[#E6E6E3] bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Хаах
                </button>

                <button
                  type="submit"
                  disabled={passwordChangeLoading || !currentPasswordInput || !newPasswordInput}
                  className="py-2 px-5 rounded-full bg-[#141414] hover:bg-black disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{passwordChangeLoading ? 'Шинэчилж байна...' : 'Нууц үг хадгалах'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
