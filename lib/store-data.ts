export interface StoreProduct {
  id: string
  slug: string
  title: string
  subtitle: string
  category: 'sfx' | 'plugins' | 'luts' | 'templates'
  badge?: string
  rating: number
  reviewCount: number
  priceMNT: number
  originalPriceMNT: number
  priceUSD: number
  originalPriceUSD: number
  image: string
  images?: string[]
  features: string[]
  compatibility: string[]
  format: string
  fileSize: string
  downloadCount: string
  defaultWeTransferLink: string
  previewSoundType?: 'whoosh' | 'impact' | 'braam' | 'ui' | 'glitch' | 'anime' | 'riser' | 'none' | ''
  fileFormats?: string[]
  isBundle?: boolean
  description: string
  sampleVideoUrl?: string
  r2Key?: string
}

export const STORE_SETTINGS = {
  storeName: 'SONIQ STORE',
  subdomain: 'shop.soniq.click',
  currencyDefault: 'MNT' as const,
  adminPasscode: 'Amirda700+',
  bankInfo: {
    bankName: 'Хаан Банк (Khan Bank)',
    accountNumber: '5608120471',
    accountHolder: 'Өсөхбаяр',
    qpayShortcode: 'QPAY-SONIQ',
    supportInstagram: 'https://www.instagram.com/_baysaa_notfound/',
    supportTelegram: 'https://t.me/baysaa_vfx',
  },
  defaultBundleWeTransfer: '',
}

export const ULTIMATE_BUNDLE: StoreProduct | null = null

export const STORE_PRODUCTS: StoreProduct[] = []

export const VALUE_MATRIX = [
  { item: 'SONIQ Ultimate 2026 Core SFX Pack (5,000+ SFX)', separate: '149,000₮', bundle: 'Орсон' },
  { item: 'Cinematic Risers & Heavy Braams Pack', separate: '89,000₮', bundle: 'Орсон' },
  { item: 'Creator YouTube & TikTok Viral Pop Pack', separate: '49,000₮', bundle: 'Орсон' },
  { item: '500+ Platinum Cinematic 3D LUTs Collection', separate: '79,000₮', bundle: 'Орсон' },
  { item: 'Anime & Cyberpunk Action Energy FX', separate: '49,000₮', bundle: 'Орсон' },
  { item: 'Studio Foley & Real World Audio Pack', separate: '59,000₮', bundle: 'Орсон' },
  { item: 'Retro 8-Bit & Modern Glitch Distortion Pack', separate: '49,000₮', bundle: 'Орсон' },
  { item: 'Soniq Fast Workflow Audio Chains & Presets', separate: '69,000₮', bundle: 'Орсон' },
  { item: 'Насан туршийн үнэгүй шинэчлэлт (Lifetime Free Updates)', separate: 'Үнэлшгүй', bundle: 'Орсон' },
  { item: 'Арилжааны зориулалттай лиценз (100% Commercial / Monetized)', separate: 'Үнэлшгүй', bundle: 'Орсон' },
]

export const REVIEWS = [
  {
    id: 1,
    name: 'Тэмүүлэн Б.',
    role: 'Commercial Video Editor & Colorist',
    rating: 5,
    date: '2 өдрийн өмнө',
    verified: true,
    text: 'Энэ багцыг авснаас хойш видео эвлүүлэгт зарцуулах цаг дор хаяж 2 дахин багассан. Ялангуяа Braams болон Whooshes-ийн чанар үнэхээр дээд түвшнийх байна. Google Drive холбоосоор маш хурдан татаж авсан, баярлалаа!',
  },
  {
    id: 2,
    name: 'Ариунболд Д.',
    role: 'YouTube Creator (120k subs)',
    rating: 5,
    date: '4 өдрийн өмнө',
    verified: true,
    text: 'Creator Pop болон 8-Bit Glitch дуунууд яг миний хайж байсан зүйл байсан. Өмнө нь YouTube-ээс энд тэндээс чанаргүй юм татаж цуглуулах гэж маш их цаг алддаг байсан бол одоо бүгд нэг дор цэгцтэй байна.',
  },
  {
    id: 3,
    name: 'Номин-Эрдэнэ Э.',
    role: 'Shorts & Reels Specialist',
    rating: 5,
    date: '1 долоо хоногийн өмнө',
    verified: true,
    text: 'Нэг удаагийн 59,900₮-өөр ийм их хэмжээний мэргэжлийн сантай болно гэдэг үнэхээр том хэмнэлт. Төлбөр шилжүүлсний дараа админ нь маш хурдан шалгаж Google Drive татах холбоос өгсөн.',
  },
  {
    id: 4,
    name: 'Мөнх-Оргил С.',
    role: 'Filmmaker / Director',
    rating: 5,
    date: '2 долоо хоногийн өмнө',
    verified: true,
    text: 'LUT-ууд нь Sony S-log3 болон iPhone дээр төгс суудаг. Харин Cinematic Riser-үүд киноны трэйлер дээр шууд дуугаралт сайтай суусан. Маш сэтгэл хангалуун байна.',
  },
]

export const FAQS = [
  {
    q: 'Төлбөр төлсний дараа татаж авах холбоос хэрхэн ирэх вэ?',
    a: 'Та захиалгаа өгч төлбөрөө шилжүүлснээр системд захиалга бүртгэгдэнэ. Манай админ шалгаж таны оруулсан Gmail хаягт Google Drive-аар хандах эрх нээж, энэхүү захиалгын хуудсаар болон и-мэйлээр татах холбоосыг шууд олгоно.',
  },
  {
    q: 'Би ямар нэгэн хязгааргүйгээр ашиглаж болох уу? Зохиогчийн эрх үүсэх үү?',
    a: 'Бүх дууны эффект, LUT, пресетүүд 100% Royalty-Free лицензтэй. Та YouTube монетизаци, сошиал медиа реклам, ТВ нэвтрүүлэг болон кино уран бүтээлдээ ямар ч зохиогчийн эрхийн асуудалгүйгээр насан туршдаа ашиглах эрхтэй.',
  },
  {
    q: 'Ямар ямар эвлүүлгийн програмуудад ажиллах вэ?',
    a: 'Манай файлууд бүх нийтлэг аудио, видео програмд тохирно: Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut Pro, CapCut (PC болон Mobile), Audition, Logic Pro зэрэг дурын программ дээр шууд чирч тавин ашиглана.',
  },
  {
    q: 'Шинэчлэлтүүд үнэгүй ирэх үү?',
    a: 'Тийм. Soniq дижитал багцыг авсан хэрэглэгчид цаашид гарах бүх шинэ дуу авиа, нэмэлт багцуудыг насан туршдаа үнэгүй татаж авах эрхтэй байдаг.',
  },
  {
    q: 'Хэрвээ надад татахад тусламж хэрэгтэй болвол хаана хандах вэ?',
    a: 'Та манай Instagram (@_baysaa_notfound) эсвэл Telegram хаяг руу өөрийн захиалгын кодоо (SQ-XXXXX) илгээснээр түргэн шуурхай тусламж авах боломжтой.',
  },
]
