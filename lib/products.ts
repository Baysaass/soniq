import type { TranslationKey } from '@/lib/i18n'

export const APP_COLORS: Record<string, { bg: string; text: string; abbr: string }> = {
  'After Effects': { bg: '#9999FF', text: '#1A1A2E', abbr: 'Ae' },
  'Premiere Pro': { bg: '#9999FF', text: '#1A1A2E', abbr: 'Pr' },
  Photoshop: { bg: '#31A8FF', text: '#001E36', abbr: 'Ps' },
  Illustrator: { bg: '#FF9A00', text: '#331C00', abbr: 'Ai' },
  CapCut: { bg: '#141414', text: '#FFFFFF', abbr: 'CC' },
}

/** Host-app categories in display order, each with a URL-anchor slug. */
export const CATEGORIES: { app: string; slug: string }[] = [
  { app: 'After Effects', slug: 'after-effects' },
  { app: 'Premiere Pro', slug: 'premiere-pro' },
  { app: 'Photoshop', slug: 'photoshop' },
  { app: 'Illustrator', slug: 'illustrator' },
  { app: 'CapCut', slug: 'capcut' },
]

export interface Localized {
  en: string
  mn: string
}

export interface Highlight {
  title: Localized
  body: Localized
}

export interface ProductDetail {
  tagline: Localized
  overview: Localized
  highlights: Highlight[]
  specs: { label: Localized; value: string }[]
  compat: string
}

export interface OtherProduct {
  id: number
  slug: string
  name: string
  descKey: TranslationKey
  app: string
  price: number
  originalPrice: number | null
  rating: number
  reviews: number
  badgeKey: TranslationKey | null
  image: string
  /** Shown on the main Soniq homepage. Non-featured live only on /others. */
  featured: boolean
  detail: ProductDetail
}

export const OTHER_PRODUCTS: OtherProduct[] = [
  {
    id: 1,
    slug: 'motion-blur-pro',
    name: 'Motion Blur Pro',
    descKey: 'prod_motion_blur_desc',
    app: 'After Effects',
    price: 29,
    originalPrice: 49,
    rating: 4.9,
    reviews: 312,
    badgeKey: 'badge_bestseller',
    image: '/images/product-motion-blur.png',
    featured: true,
    detail: {
      tagline: {
        en: 'Cinematic motion blur in one click.',
        mn: 'Нэг товшилтоор синематик motion blur.',
      },
      overview: {
        en: 'Motion Blur Pro adds true, camera-accurate blur to any layer or comp — no pre-rendering, no manual shutter tweaking. Forty presets cover everything from subtle handheld drift to full speed-ramp streaks.',
        mn: 'Motion Blur Pro нь дурын давхарга, комп дээр камерын нарийвчлалтай жинхэнэ blur нэмнэ — урьдчилан рендер, shutter-г гараар тохируулах шаардлагагүй. 40 пресет нь зөөлөн чичиргээнээс бүрэн speed-ramp хүртэл бүгдийг хамарна.',
      },
      highlights: [
        {
          title: { en: 'Real shutter model', mn: 'Жинхэнэ shutter загвар' },
          body: {
            en: 'Physically-based sampling that matches how a real camera exposes fast motion.',
            mn: 'Жинхэнэ камер хурдан хөдөлгөөнийг хэрхэн буулгадгийг дуурайсан физик суурьтай sampling.',
          },
        },
        {
          title: { en: '40+ presets', mn: '40+ бэлэн пресет' },
          body: {
            en: 'Drag-and-drop looks for handheld, whip pans, speed ramps and title reveals.',
            mn: 'Handheld, whip pan, speed ramp, гарчгийн илрэлд зориулсан чирч тавих харагдацууд.',
          },
        },
        {
          title: { en: 'GPU accelerated', mn: 'GPU хурдасгуур' },
          body: {
            en: 'Renders on the graphics card so previews stay smooth even on heavy comps.',
            mn: 'График картан дээр рендер хийдэг тул хүнд комп дээр ч preview жигд байна.',
          },
        },
      ],
      specs: [
        { label: { en: 'Presets', mn: 'Пресет' }, value: '40+' },
        { label: { en: 'Render', mn: 'Рендер' }, value: 'GPU / CPU' },
        { label: { en: 'Color depth', mn: 'Өнгөний гүн' }, value: '8 / 16 / 32-bit' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'After Effects 2021+',
    },
  },
  {
    id: 2,
    slug: 'auto-color-suite',
    name: 'Auto Color Suite',
    descKey: 'prod_color_suite_desc',
    app: 'Premiere Pro',
    price: 19,
    originalPrice: null,
    rating: 4.8,
    reviews: 189,
    badgeKey: 'badge_new',
    image: '/images/product-color-suite.png',
    featured: true,
    detail: {
      tagline: {
        en: 'AI color grading that matches any look.',
        mn: 'Дурын өнгийг тааруулдаг AI өнгөний шийдэл.',
      },
      overview: {
        en: 'Auto Color Suite analyses your footage and balances exposure, white point and skin tones in seconds. Drop a reference frame and it matches the grade across every clip on your timeline.',
        mn: 'Auto Color Suite таны бичлэгийг задлан шинжилж, экспозиц, цагаан цэг, арьсны өнгийг хэдхэн секундэд тэнцвэржүүлнэ. Лавлагаа кадр тавихад timeline дээрх бүх клипийн өнгийг тааруулна.',
      },
      highlights: [
        {
          title: { en: 'One-frame match', mn: 'Нэг кадраар тааруулах' },
          body: {
            en: 'Pick a reference still and every clip inherits the same balance and mood.',
            mn: 'Лавлагаа зураг сонгоход бүх клип адил тэнцвэр, уур амьсгалыг авна.',
          },
        },
        {
          title: { en: 'Skin-tone aware', mn: 'Арьсны өнгө мэдрэх' },
          body: {
            en: 'Protects faces while it corrects the rest of the frame automatically.',
            mn: 'Кадрын бусад хэсгийг засах явцад царайг хамгаална.',
          },
        },
        {
          title: { en: '60 built-in looks', mn: '60 бэлэн харагдац' },
          body: {
            en: 'Cinematic, documentary and social-ready grades you can dial in to taste.',
            mn: 'Синематик, баримтат, сошиалд бэлэн — өөрийн амтаар тохируулах өнгөнүүд.',
          },
        },
      ],
      specs: [
        { label: { en: 'Looks', mn: 'Харагдац' }, value: '60' },
        { label: { en: 'Engine', mn: 'Хөдөлгүүр' }, value: 'AI auto-match' },
        { label: { en: 'Output', mn: 'Гаралт' }, value: 'Rec.709 / Log' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Premiere Pro 2022+',
    },
  },
  {
    id: 3,
    slug: 'smart-retouch',
    name: 'Smart Retouch',
    descKey: 'prod_smart_retouch_desc',
    app: 'Photoshop',
    price: 24,
    originalPrice: 39,
    rating: 4.9,
    reviews: 427,
    badgeKey: null,
    image: '/images/product-smart-retouch.png',
    featured: true,
    detail: {
      tagline: {
        en: 'Natural skin retouching, fully non-destructive.',
        mn: 'Байгалийн арьс засвар, бүрэн устгалгүй.',
      },
      overview: {
        en: 'Smart Retouch separates texture from tone so you can smooth blemishes without the plastic look. Every edit lands on its own layer, so nothing is baked in and everything stays reversible.',
        mn: 'Smart Retouch нь бүтэц ба өнгийг тусгаарладаг тул хуванцар мэт харагдалгүйгээр арьсыг цэвэрлэнэ. Засвар бүр өөрийн давхарга дээр орох тул юу ч шатаагдахгүй, бүгд буцаах боломжтой.',
      },
      highlights: [
        {
          title: { en: 'Frequency separation', mn: 'Давтамжийн салгалт' },
          body: {
            en: 'Keeps pores and detail intact while it evens out skin tone.',
            mn: 'Арьсны өнгийг жигдлэх зуур нүх, нарийн ширийнийг хадгална.',
          },
        },
        {
          title: { en: 'Non-destructive', mn: 'Устгалгүй' },
          body: {
            en: 'Layer-based edits you can dial back or remove at any time.',
            mn: 'Хэдийд ч сулруулж, устгаж болох давхарга суурьтай засвар.',
          },
        },
        {
          title: { en: 'One-click actions', mn: 'Нэг товшилтын үйлдэл' },
          body: {
            en: 'Dodge, burn and clean-up steps mapped to a single panel button.',
            mn: 'Dodge, burn, цэвэрлэгээг нэг панелийн товч болгож холбосон.',
          },
        },
      ],
      specs: [
        { label: { en: 'Actions', mn: 'Үйлдэл' }, value: '35+' },
        { label: { en: 'Workflow', mn: 'Ажлын урсгал' }, value: 'Non-destructive' },
        { label: { en: 'Document', mn: 'Файл' }, value: 'RGB 8 / 16-bit' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Photoshop 2021+',
    },
  },
  {
    id: 4,
    slug: 'neon-fx-pack',
    name: 'Neon FX Pack',
    descKey: 'prod_neon_fx_desc',
    app: 'After Effects',
    price: 35,
    originalPrice: null,
    rating: 4.7,
    reviews: 98,
    badgeKey: 'badge_popular',
    image: '/images/product-neon-fx.png',
    featured: true,
    detail: {
      tagline: {
        en: '120 neon glows, ready to drop in.',
        mn: 'Шууд тавихад бэлэн 120 неон гэрэл.',
      },
      overview: {
        en: 'Neon FX Pack ships 120 fully editable light effects — tubes, glows, flickers and sign animations. Every element is shape-based, so it scales cleanly and recolors to any palette in a click.',
        mn: 'Neon FX Pack нь бүрэн засварлах боломжтой 120 гэрлийн эффект авчирна — гуурс, гэрэлтэлт, анивчилт, самбарын анимац. Элемент бүр shape суурьтай тул цэвэр томорч, нэг товшилтоор дурын өнгө болно.',
      },
      highlights: [
        {
          title: { en: 'Shape-based', mn: 'Shape суурьтай' },
          body: {
            en: 'Vector elements that stay razor-sharp at any resolution.',
            mn: 'Дурын нягтралд хурц хэвээр үлддэг вектор элементүүд.',
          },
        },
        {
          title: { en: 'Recolor in a click', mn: 'Нэг товшилтоор өнгө солих' },
          body: {
            en: 'Global color control drives the whole rig from one swatch.',
            mn: 'Нэг өнгөний хяналт бүх системийг удирдана.',
          },
        },
        {
          title: { en: 'Flicker rigs', mn: 'Анивчих систем' },
          body: {
            en: 'Pre-built flicker and buzz animations for that real-sign feel.',
            mn: 'Жинхэнэ самбарын мэдрэмж өгөх бэлэн анивчилт, чимээ.',
          },
        },
      ],
      specs: [
        { label: { en: 'Effects', mn: 'Эффект' }, value: '120' },
        { label: { en: 'Type', mn: 'Төрөл' }, value: 'Shape layers' },
        { label: { en: 'Resolution', mn: 'Нягтрал' }, value: 'Up to 8K' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'After Effects 2020+',
    },
  },
  {
    id: 5,
    slug: 'trending-effects',
    name: 'Trending Effects',
    descKey: 'prod_trending_desc',
    app: 'CapCut',
    price: 12,
    originalPrice: null,
    rating: 4.7,
    reviews: 641,
    badgeKey: 'badge_hot',
    image: '/images/product-trending.png',
    featured: true,
    detail: {
      tagline: {
        en: 'Viral transitions, updated every week.',
        mn: 'Долоо хоног бүр шинэчлэгддэг вирал шилжилт.',
      },
      overview: {
        en: 'Trending Effects is a living pack of the transitions and text animations creators are using right now. New drops land weekly, so your edits never look a season behind.',
        mn: 'Trending Effects нь бүтээгчдийн яг одоо ашиглаж буй шилжилт, текст анимацийн амьд багц. Шинэ багц долоо хоног бүр нэмэгддэг тул таны эвлүүлэг хэзээ ч хоцрогдож харагдахгүй.',
      },
      highlights: [
        {
          title: { en: 'Weekly drops', mn: 'Долоо хоног тутмын шинэчлэл' },
          body: {
            en: 'Fresh transitions added every week, free for the lifetime of the pack.',
            mn: 'Долоо хоног бүр шинэ шилжилт — багцын насан туршид үнэгүй.',
          },
        },
        {
          title: { en: 'Beat-ready', mn: 'Битэд бэлэн' },
          body: {
            en: 'Cuts and shakes pre-timed to drop cleanly on the beat.',
            mn: 'Битэн дээр цэвэрхэн буухаар урьдчилан цаг тохируулсан cut, shake.',
          },
        },
        {
          title: { en: 'One-tap apply', mn: 'Нэг товшилтоор хэрэглэх' },
          body: {
            en: 'Built for mobile CapCut — tap once and the effect is on your clip.',
            mn: 'Мобайл CapCut-д зориулсан — нэг товшихад эффект клип дээр орно.',
          },
        },
      ],
      specs: [
        { label: { en: 'Effects', mn: 'Эффект' }, value: '200+ growing' },
        { label: { en: 'Updates', mn: 'Шинэчлэл' }, value: 'Weekly' },
        { label: { en: 'Platform', mn: 'Платформ' }, value: 'Mobile / Desktop' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Creator' },
      ],
      compat: 'CapCut 12+',
    },
  },
  {
    id: 6,
    slug: 'vector-toolkit',
    name: 'Vector Toolkit',
    descKey: 'prod_vector_desc',
    app: 'Illustrator',
    price: 22,
    originalPrice: 34,
    rating: 4.8,
    reviews: 154,
    badgeKey: null,
    image: '/images/product-vector.png',
    featured: true,
    detail: {
      tagline: {
        en: '200+ shortcuts for faster illustration.',
        mn: 'Хурдан зурахад 200+ товчлол.',
      },
      overview: {
        en: 'Vector Toolkit packs the operations illustrators repeat all day into one panel — distribute, align, randomize, retro-shade and more. Fewer menu dives, more drawing.',
        mn: 'Vector Toolkit нь зураачдын өдөржин давтдаг үйлдлүүдийг нэг панел болгон цуглуулна — distribute, align, санамсаргүйжүүлэх, retro-shade гэх мэт. Цэс уудлах нь бага, зурах нь их.',
      },
      highlights: [
        {
          title: { en: 'One-panel workflow', mn: 'Нэг панелийн ажил' },
          body: {
            en: 'The tools you use most, grouped where your cursor already is.',
            mn: 'Хамгийн их хэрэглэдэг хэрэгслүүд заагч байгаа газарт цугларсан.',
          },
        },
        {
          title: { en: 'Smart randomize', mn: 'Ухаалаг санамсаргүйжүүлэлт' },
          body: {
            en: 'Scatter size, rotation and color for organic, hand-made variety.',
            mn: 'Хэмжээ, эргэлт, өнгийг тараан органик, гар хийцийн олон янз байдал өгнө.',
          },
        },
        {
          title: { en: 'Retro shading', mn: 'Retro сүүдэрлэлт' },
          body: {
            en: 'One-click halftones and grain for that print-poster texture.',
            mn: 'Хэвлэлийн зурагт хуудасны бүтэц өгөх нэг товшилтын halftone, grain.',
          },
        },
      ],
      specs: [
        { label: { en: 'Tools', mn: 'Хэрэгсэл' }, value: '200+' },
        { label: { en: 'Type', mn: 'Төрөл' }, value: 'Scripts + panel' },
        { label: { en: 'Output', mn: 'Гаралт' }, value: 'Vector' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Illustrator 2021+',
    },
  },
  {
    id: 7,
    slug: 'morph-3d',
    name: 'Morph 3D',
    descKey: 'prod_morph_3d_desc',
    app: 'After Effects',
    price: 39,
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    badgeKey: 'badge_featured',
    image: '/images/product-morph-3d.png',
    featured: true,
    detail: {
      tagline: {
        en: 'Organic 3D morphs with real physics.',
        mn: 'Жинхэнэ физиктэй органик 3D morph.',
      },
      overview: {
        en: 'Morph 3D turns flat shapes into liquid, metaball-style transitions driven by a simulation engine. Blend logos, titles and objects with weight and follow-through that keyframes alone can’t fake.',
        mn: 'Morph 3D нь хавтгай хэлбэрийг симуляцийн хөдөлгүүрээр удирдуулж шингэн, metaball маягийн шилжилт болгоно. Лого, гарчиг, объектыг keyframe-ээр дуурайж чадахгүй жин, дагаврын хөдөлгөөнтэй холино.',
      },
      highlights: [
        {
          title: { en: 'Simulation engine', mn: 'Симуляцийн хөдөлгүүр' },
          body: {
            en: 'Physically-driven blends with natural weight and settle.',
            mn: 'Байгалийн жин, тогтолттой физик суурьтай холилт.',
          },
        },
        {
          title: { en: 'Metaball blends', mn: 'Metaball холилт' },
          body: {
            en: 'Shapes merge and split like liquid metal, fully controllable.',
            mn: 'Хэлбэрүүд шингэн металл шиг нийлж, салдаг — бүрэн хяналттай.',
          },
        },
        {
          title: { en: 'Depth + light', mn: 'Гүн + гэрэл' },
          body: {
            en: 'Real 3D normals so your morphs catch scene lighting.',
            mn: 'Жинхэнэ 3D normal тул morph нь тайзны гэрлийг тусгана.',
          },
        },
      ],
      specs: [
        { label: { en: 'Engine', mn: 'Хөдөлгүүр' }, value: 'Physics sim' },
        { label: { en: 'Render', mn: 'Рендер' }, value: 'GPU' },
        { label: { en: 'Dimension', mn: 'Хэмжээс' }, value: 'True 3D' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'After Effects 2022+',
    },
  },
  {
    id: 8,
    slug: 'lut-master-pack',
    name: 'LUT Master Pack',
    descKey: 'prod_lut_desc',
    app: 'Premiere Pro',
    price: 18,
    originalPrice: 29,
    rating: 4.6,
    reviews: 512,
    badgeKey: null,
    image: '/images/product-lut.png',
    featured: true,
    detail: {
      tagline: {
        en: '500 pro LUTs for every genre.',
        mn: 'Бүх жанрт 500 мэргэжлийн LUT.',
      },
      overview: {
        en: 'LUT Master Pack is 500 hand-built looks organised by mood and genre — film emulations, teal-and-orange blockbusters, muted documentary and clean commercial. Works in Premiere, Resolve and any NLE that reads .cube.',
        mn: 'LUT Master Pack нь уур амьсгал, жанраар ангилсан гараар хийсэн 500 харагдац — кино эмуляц, teal-and-orange блокбастер, намуухан баримтат, цэвэр арилжааны. Premiere, Resolve, .cube уншдаг дурын NLE дээр ажиллана.',
      },
      highlights: [
        {
          title: { en: 'Organised by mood', mn: 'Уур амьсгалаар ангилсан' },
          body: {
            en: 'Sorted into genre folders so you find the right look fast.',
            mn: 'Жанрын хавтсаар ангилсан тул зөв харагдацыг хурдан олно.',
          },
        },
        {
          title: { en: 'Log + Rec.709', mn: 'Log + Rec.709' },
          body: {
            en: 'Two versions of every LUT for graded and ungraded footage.',
            mn: 'LUT бүрийн хоёр хувилбар — өнгө засагдсан ба засагдаагүй бичлэгт.',
          },
        },
        {
          title: { en: 'Universal .cube', mn: 'Бүх нийтийн .cube' },
          body: {
            en: 'Standard format that loads in Premiere, Resolve, FCP and more.',
            mn: 'Premiere, Resolve, FCP зэрэгт ачаалагддаг стандарт формат.',
          },
        },
      ],
      specs: [
        { label: { en: 'LUTs', mn: 'LUT тоо' }, value: '500' },
        { label: { en: 'Format', mn: 'Формат' }, value: '.cube 33³' },
        { label: { en: 'Variants', mn: 'Хувилбар' }, value: 'Log + Rec.709' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Premiere · Resolve · FCP',
    },
  },

  /* ---------- Non-featured — live on the /others catalogue page ---------- */

  {
    id: 9,
    slug: 'glitch-studio',
    name: 'Glitch Studio',
    descKey: 'prod_glitch_desc',
    app: 'After Effects',
    price: 27,
    originalPrice: null,
    rating: 4.7,
    reviews: 176,
    badgeKey: null,
    image: '/images/product-neon-fx.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Retro and cyberpunk glitch, animated.',
        mn: 'Ретро, киберпанк glitch — анимацтай.',
      },
      overview: {
        en: 'Glitch Studio brings datamosh, RGB split, VHS and scanline looks to After Effects with animated controls you can key to the beat.',
        mn: 'Glitch Studio нь datamosh, RGB split, VHS, scanline харагдацыг After Effects-д битэд түлхүүрлэх боломжтой анимацтай хяналтаар авчирна.',
      },
      highlights: [
        {
          title: { en: 'Datamosh looks', mn: 'Datamosh харагдац' },
          body: {
            en: 'Believable compression-artifact glitches without corrupting footage.',
            mn: 'Бичлэгээ эвдэлгүйгээр итгэмээр компресс-artifact glitch.',
          },
        },
        {
          title: { en: 'RGB split rig', mn: 'RGB split систем' },
          body: {
            en: 'Chromatic-aberration control tied to a single slider.',
            mn: 'Нэг slider-т холбогдсон хроматик аберрацийн хяналт.',
          },
        },
        {
          title: { en: 'Beat-syncable', mn: 'Битэд синклэх' },
          body: {
            en: 'Drive glitch intensity from audio for music-video energy.',
            mn: 'Glitch эрчмийг аудиогаар удирдаж хөгжмийн клипийн эрч өг.',
          },
        },
      ],
      specs: [
        { label: { en: 'Effects', mn: 'Эффект' }, value: '60+' },
        { label: { en: 'Render', mn: 'Рендер' }, value: 'GPU' },
        { label: { en: 'Color depth', mn: 'Өнгөний гүн' }, value: '8 / 16-bit' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'After Effects 2021+',
    },
  },
  {
    id: 10,
    slug: 'light-rays-kit',
    name: 'Light Rays Kit',
    descKey: 'prod_light_rays_desc',
    app: 'After Effects',
    price: 24,
    originalPrice: null,
    rating: 4.8,
    reviews: 141,
    badgeKey: null,
    image: '/images/product-morph-3d.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Volumetric light rays in seconds.',
        mn: 'Хэдхэн секундэд эзэлхүүнт гэрлийн туяа.',
      },
      overview: {
        en: 'Cast god rays, lens streaks and atmospheric glow from any layer, with physically soft falloff and full color control.',
        mn: 'Дурын давхаргаас бурханы туяа, линзний гэрэл, уур амьсгалын гэрэлтэлт үүсгэ — зөөлөн бууралт, бүрэн өнгөний хяналттай.',
      },
      highlights: [
        {
          title: { en: 'God rays', mn: 'Бурханы туяа' },
          body: {
            en: 'Volumetric shafts that read as real light through the scene.',
            mn: 'Тайзаар дамжсан жинхэнэ гэрэл мэт эзэлхүүнт багана.',
          },
        },
        {
          title: { en: 'Lens streaks', mn: 'Линзний гэрэл' },
          body: {
            en: 'Anamorphic flares and streaks with adjustable bloom.',
            mn: 'Тохируулах bloom-той анаморфик flare, streak.',
          },
        },
        {
          title: { en: 'Soft falloff', mn: 'Зөөлөн бууралт' },
          body: {
            en: 'Physically-based decay so light never looks pasted on.',
            mn: 'Физик суурьтай бууралт тул гэрэл наасан мэт харагдахгүй.',
          },
        },
      ],
      specs: [
        { label: { en: 'Presets', mn: 'Пресет' }, value: '45' },
        { label: { en: 'Render', mn: 'Рендер' }, value: 'GPU' },
        { label: { en: 'Color depth', mn: 'Өнгөний гүн' }, value: '8 / 16 / 32-bit' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'After Effects 2020+',
    },
  },
  {
    id: 11,
    slug: 'particle-forge',
    name: 'Particle Forge',
    descKey: 'prod_particle_desc',
    app: 'After Effects',
    price: 32,
    originalPrice: 45,
    rating: 4.8,
    reviews: 118,
    badgeKey: 'badge_new',
    image: '/images/product-motion-blur.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Particle systems without the setup.',
        mn: 'Тохиргоогүй партикл систем.',
      },
      overview: {
        en: 'Sparks, dust, confetti and trails as ready-made rigs — emit from masks or motion, all GPU-accelerated.',
        mn: 'Оч, тоос, конфетти, мөр — бэлэн rig. Mask эсвэл хөдөлгөөнөөс ялгаруулна, бүгд GPU хурдасгууртай.',
      },
      highlights: [
        {
          title: { en: 'Ready emitters', mn: 'Бэлэн эмиттер' },
          body: {
            en: 'Dozens of tuned systems you can drop in and restyle.',
            mn: 'Тавьж, дахин загварчлах хэдэн арван тохируулсан систем.',
          },
        },
        {
          title: { en: 'Emit from motion', mn: 'Хөдөлгөөнөөс ялгаруулах' },
          body: {
            en: 'Particles born from a layer’s movement or a mask edge.',
            mn: 'Давхаргын хөдөлгөөн, mask ирмэгээс төрөх партикл.',
          },
        },
        {
          title: { en: 'GPU sim', mn: 'GPU симуляц' },
          body: {
            en: 'Thousands of particles that still preview in real time.',
            mn: 'Мянга мянган партикл ч real-time preview-тэй.',
          },
        },
      ],
      specs: [
        { label: { en: 'Systems', mn: 'Систем' }, value: '70' },
        { label: { en: 'Render', mn: 'Рендер' }, value: 'GPU' },
        { label: { en: 'Dimension', mn: 'Хэмжээс' }, value: '2.5D' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'After Effects 2022+',
    },
  },
  {
    id: 12,
    slug: 'transition-deck',
    name: 'Transition Deck',
    descKey: 'prod_transition_desc',
    app: 'Premiere Pro',
    price: 21,
    originalPrice: null,
    rating: 4.7,
    reviews: 264,
    badgeKey: 'badge_popular',
    image: '/images/product-lut.png',
    featured: false,
    detail: {
      tagline: {
        en: '200 drag-and-drop transitions.',
        mn: 'Чирч тавих 200 шилжилт.',
      },
      overview: {
        en: 'Zooms, spins, glitches and luma wipes that drop straight onto your Premiere timeline and render in real time.',
        mn: 'Zoom, эргэлт, glitch, luma wipe — Premiere timeline дээр шууд тавьж, real-time рендерлэнэ.',
      },
      highlights: [
        {
          title: { en: '200 transitions', mn: '200 шилжилт' },
          body: {
            en: 'A category for every cut — motion, glitch, light and clean.',
            mn: 'Cut бүрд ангилал — хөдөлгөөн, glitch, гэрэл, цэвэр.',
          },
        },
        {
          title: { en: 'Real-time', mn: 'Real-time' },
          body: {
            en: 'Preview and scrub without pre-rendering the timeline.',
            mn: 'Timeline-ыг урьдчилан рендерлэлгүйгээр preview, scrub.',
          },
        },
        {
          title: { en: 'Sound-linked', mn: 'Дуутай холбоотой' },
          body: {
            en: 'Optional whoosh SFX that follow each transition automatically.',
            mn: 'Шилжилт бүрийг дагадаг сонголтот whoosh дуун эффект.',
          },
        },
      ],
      specs: [
        { label: { en: 'Transitions', mn: 'Шилжилт' }, value: '200' },
        { label: { en: 'Render', mn: 'Рендер' }, value: 'Real-time' },
        { label: { en: 'Sound', mn: 'Дуу' }, value: 'Optional SFX' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Premiere Pro 2022+',
    },
  },
  {
    id: 13,
    slug: 'sound-fx-library',
    name: 'Sound FX Library',
    descKey: 'prod_sound_fx_desc',
    app: 'Premiere Pro',
    price: 16,
    originalPrice: null,
    rating: 4.6,
    reviews: 388,
    badgeKey: null,
    image: '/images/product-color-suite.png',
    featured: false,
    detail: {
      tagline: {
        en: '1,000 mixed-ready sound effects.',
        mn: 'Микст бэлэн 1,000 дуун эффект.',
      },
      overview: {
        en: 'Whooshes, impacts, risers and UI clicks — royalty-free and tagged, ready to drop under any cut.',
        mn: 'Whoosh, цохилт, riser, UI click — royalty-free, шошготой, дурын cut дор тавихад бэлэн.',
      },
      highlights: [
        {
          title: { en: '1,000 clips', mn: '1,000 клип' },
          body: {
            en: 'A deep, consistent library that covers most edits end to end.',
            mn: 'Ихэнх эвлүүлгийг бүрэн хамарсан гүн, нэгдмэл сан.',
          },
        },
        {
          title: { en: 'Royalty-free', mn: 'Royalty-free' },
          body: {
            en: 'Cleared for commercial and monetised content, no attribution.',
            mn: 'Арилжаа, орлоготой контентод зөвшөөрөгдсөн — эх сурвалж заах шаардлагагүй.',
          },
        },
        {
          title: { en: 'Tagged search', mn: 'Шошготой хайлт' },
          body: {
            en: 'Everything labelled by type and mood so you find sounds fast.',
            mn: 'Бүгд төрөл, уур амьсгалаар шошголсон тул дууг хурдан олно.',
          },
        },
      ],
      specs: [
        { label: { en: 'Clips', mn: 'Клип' }, value: '1,000' },
        { label: { en: 'Format', mn: 'Формат' }, value: 'WAV' },
        { label: { en: 'Sample rate', mn: 'Sample rate' }, value: '48 kHz' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Royalty-free' },
      ],
      compat: 'Premiere · any NLE',
    },
  },
  {
    id: 14,
    slug: 'sky-replacer',
    name: 'Sky Replacer',
    descKey: 'prod_sky_desc',
    app: 'Photoshop',
    price: 26,
    originalPrice: 39,
    rating: 4.8,
    reviews: 231,
    badgeKey: 'badge_new',
    image: '/images/product-smart-retouch.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Swap skies in one click.',
        mn: 'Нэг товшилтоор тэнгэр солих.',
      },
      overview: {
        en: 'AI selects the horizon and relights your foreground to match the new sky — sunsets, storms and clear blue included.',
        mn: 'AI тэнгэрийн хаяаг сонгож, урд талыг шинэ тэнгэрт тааруулан гэрэлтүүлнэ — нар жаргах, шуурга, цэлмэг цэнхэр орсон.',
      },
      highlights: [
        {
          title: { en: 'AI horizon', mn: 'AI хаяа' },
          body: {
            en: 'Detects the sky edge cleanly, even through trees and buildings.',
            mn: 'Мод, барилгаар ч тэнгэрийн ирмэгийг цэвэр илрүүлнэ.',
          },
        },
        {
          title: { en: 'Auto relight', mn: 'Авто гэрэлтүүлэг' },
          body: {
            en: 'Foreground color and light shift to sell the new sky.',
            mn: 'Урд талын өнгө, гэрэл шинэ тэнгэрт тохируулан өөрчлөгдөнө.',
          },
        },
        {
          title: { en: '80 skies', mn: '80 тэнгэр' },
          body: {
            en: 'A curated library from golden hour to dramatic storm.',
            mn: 'Алтан цагаас драмын шуурга хүртэл шилдэг сан.',
          },
        },
      ],
      specs: [
        { label: { en: 'Skies', mn: 'Тэнгэр' }, value: '80' },
        { label: { en: 'Engine', mn: 'Хөдөлгүүр' }, value: 'AI select' },
        { label: { en: 'Document', mn: 'Файл' }, value: 'RGB 8 / 16-bit' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Photoshop 2022+',
    },
  },
  {
    id: 15,
    slug: 'poster-builder',
    name: 'Poster Builder',
    descKey: 'prod_poster_desc',
    app: 'Photoshop',
    price: 20,
    originalPrice: null,
    rating: 4.6,
    reviews: 97,
    badgeKey: null,
    image: '/images/product-smart-retouch.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Editorial poster layouts, instantly.',
        mn: 'Редакцийн зурагт хуудас — шуурхай.',
      },
      overview: {
        en: 'Grids, type systems and duotone treatments as smart templates you fill with your own art.',
        mn: 'Сүлжээ, типографи систем, duotone — өөрийн бүтээлээ дүүргэх ухаалаг template.',
      },
      highlights: [
        {
          title: { en: 'Smart templates', mn: 'Ухаалаг template' },
          body: {
            en: 'Swap the image and the whole layout re-flows around it.',
            mn: 'Зургийг солиход бүх layout түүнийг тойрон дахин байрлана.',
          },
        },
        {
          title: { en: 'Type systems', mn: 'Типографи систем' },
          body: {
            en: 'Pre-set headline, kicker and caption styles that stay in scale.',
            mn: 'Хэмжээгээ хадгалдаг гарчиг, kicker, тайлбарын бэлэн загвар.',
          },
        },
        {
          title: { en: 'Duotone', mn: 'Duotone' },
          body: {
            en: 'One-click two-color treatments for a print-editorial feel.',
            mn: 'Хэвлэлийн мэдрэмж өгөх нэг товшилтын хоёр өнгийн боловсруулалт.',
          },
        },
      ],
      specs: [
        { label: { en: 'Templates', mn: 'Template' }, value: '40' },
        { label: { en: 'Type', mn: 'Текст' }, value: 'Editable' },
        { label: { en: 'Document', mn: 'Файл' }, value: 'RGB / CMYK' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Photoshop 2021+',
    },
  },
  {
    id: 16,
    slug: 'pattern-forge',
    name: 'Pattern Forge',
    descKey: 'prod_pattern_desc',
    app: 'Illustrator',
    price: 18,
    originalPrice: null,
    rating: 4.7,
    reviews: 122,
    badgeKey: null,
    image: '/images/product-vector.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Seamless patterns, generated.',
        mn: 'Тасралтгүй хээ — үүсгэсэн.',
      },
      overview: {
        en: 'Build endlessly tiling patterns from any object with live spacing, rotation and color randomization.',
        mn: 'Дурын объектоос амьд зай, эргэлт, өнгөний санамсаргүйжүүлэлттэйгээр төгсгөлгүй давтагдах хээ бүтээ.',
      },
      highlights: [
        {
          title: { en: 'Live tiling', mn: 'Амьд давталт' },
          body: {
            en: 'Preview the seamless repeat as you tweak the source.',
            mn: 'Эх сурвалжийг тохируулах зуур тасралтгүй давталтыг харна.',
          },
        },
        {
          title: { en: 'Randomize', mn: 'Санамсаргүйжүүлэх' },
          body: {
            en: 'Scatter rotation, scale and color for hand-made variety.',
            mn: 'Эргэлт, хэмжээ, өнгийг тараан гар хийцийн олон янз байдал.',
          },
        },
        {
          title: { en: 'Export swatch', mn: 'Swatch экспорт' },
          body: {
            en: 'Save as a reusable Illustrator pattern swatch in a click.',
            mn: 'Нэг товшилтоор дахин ашиглах Illustrator pattern swatch болгож хадгална.',
          },
        },
      ],
      specs: [
        { label: { en: 'Type', mn: 'Төрөл' }, value: 'Generative' },
        { label: { en: 'Output', mn: 'Гаралт' }, value: 'Vector' },
        { label: { en: 'Tiling', mn: 'Давталт' }, value: 'Seamless' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Illustrator 2021+',
    },
  },
  {
    id: 17,
    slug: 'icon-factory',
    name: 'Icon Factory',
    descKey: 'prod_icon_desc',
    app: 'Illustrator',
    price: 23,
    originalPrice: 32,
    rating: 4.8,
    reviews: 208,
    badgeKey: 'badge_bestseller',
    image: '/images/product-vector.png',
    featured: false,
    detail: {
      tagline: {
        en: '500 editable line and solid icons.',
        mn: '500 засварлах line, solid дүрс.',
      },
      overview: {
        en: 'A consistent icon set with adjustable stroke, corner radius and grid — export SVG in a click.',
        mn: 'Тохируулах stroke, булангийн радиус, сүлжээтэй нэгдмэл дүрсний багц — нэг товшилтоор SVG.',
      },
      highlights: [
        {
          title: { en: '500 icons', mn: '500 дүрс' },
          body: {
            en: 'One coherent family drawn on a shared 24px grid.',
            mn: 'Нийтлэг 24px сүлжээн дээр зурсан нэгдмэл гэр бүл.',
          },
        },
        {
          title: { en: 'Adjustable stroke', mn: 'Тохируулах stroke' },
          body: {
            en: 'Change weight and corners across the whole set at once.',
            mn: 'Бүх багцын зузаан, буланг нэг дор өөрчил.',
          },
        },
        {
          title: { en: 'SVG export', mn: 'SVG экспорт' },
          body: {
            en: 'Clean, optimised SVGs ready for web and product.',
            mn: 'Вэб, бүтээгдэхүүнд бэлэн цэвэр, оновчлосон SVG.',
          },
        },
      ],
      specs: [
        { label: { en: 'Icons', mn: 'Дүрс' }, value: '500' },
        { label: { en: 'Style', mn: 'Хэв маяг' }, value: 'Line / Solid' },
        { label: { en: 'Output', mn: 'Гаралт' }, value: 'SVG' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Commercial' },
      ],
      compat: 'Illustrator 2020+',
    },
  },
  {
    id: 18,
    slug: 'caption-pop',
    name: 'Caption Pop',
    descKey: 'prod_caption_desc',
    app: 'CapCut',
    price: 10,
    originalPrice: null,
    rating: 4.7,
    reviews: 452,
    badgeKey: null,
    image: '/images/product-trending.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Animated captions that keep attention.',
        mn: 'Анхаарал татсан анимацтай хадмал.',
      },
      overview: {
        en: 'Auto-styled kinetic captions with word-by-word pop, ready for shorts and reels.',
        mn: 'Үг үгээр pop хийдэг авто загварчилсан кинетик хадмал — shorts, reels-д бэлэн.',
      },
      highlights: [
        {
          title: { en: 'Word-by-word', mn: 'Үг үгээр' },
          body: {
            en: 'Each word pops on cue to hold the viewer’s eye.',
            mn: 'Үг бүр цагтаа pop хийж үзэгчийн нүдийг барина.',
          },
        },
        {
          title: { en: 'Auto style', mn: 'Авто загвар' },
          body: {
            en: 'Consistent look applied to your whole caption track at once.',
            mn: 'Бүх хадмалын track-д нэг дор нэгдмэл харагдац.',
          },
        },
        {
          title: { en: 'Reel-ready', mn: 'Reel-д бэлэн' },
          body: {
            en: 'Sized and safe-margined for shorts, reels and TikTok.',
            mn: 'Shorts, reels, TikTok-д тохирсон хэмжээ, аюулгүй захтай.',
          },
        },
      ],
      specs: [
        { label: { en: 'Styles', mn: 'Загвар' }, value: '50' },
        { label: { en: 'Platform', mn: 'Платформ' }, value: 'Mobile / Desktop' },
        { label: { en: 'Sync', mn: 'Синк' }, value: 'Auto' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Creator' },
      ],
      compat: 'CapCut 12+',
    },
  },
  {
    id: 19,
    slug: 'beat-cut-pack',
    name: 'Beat Cut Pack',
    descKey: 'prod_beat_cut_desc',
    app: 'CapCut',
    price: 13,
    originalPrice: null,
    rating: 4.8,
    reviews: 305,
    badgeKey: 'badge_hot',
    image: '/images/product-trending.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Cuts that land on every beat.',
        mn: 'Бит бүрт буудаг cut.',
      },
      overview: {
        en: 'Beat-detected cut templates and shake presets that sync your edit to the music automatically.',
        mn: 'Битийг илрүүлдэг cut template, shake пресет — эвлүүлгийг хөгжимд авто синклэнэ.',
      },
      highlights: [
        {
          title: { en: 'Beat detection', mn: 'Бит илрүүлэлт' },
          body: {
            en: 'Finds the tempo and marks cut points for you.',
            mn: 'Хэмнэлийг олж cut цэгүүдийг тэмдэглэнэ.',
          },
        },
        {
          title: { en: 'Shake presets', mn: 'Shake пресет' },
          body: {
            en: 'Impact shakes that hit exactly on the drop.',
            mn: 'Drop дээр яг таарч буудаг impact shake.',
          },
        },
        {
          title: { en: 'One-tap', mn: 'Нэг товшилт' },
          body: {
            en: 'Apply the whole rhythm template to a clip instantly.',
            mn: 'Бүтэн хэмнэлийн template-ийг клипт шууд хэрэглэ.',
          },
        },
      ],
      specs: [
        { label: { en: 'Presets', mn: 'Пресет' }, value: '40' },
        { label: { en: 'Platform', mn: 'Платформ' }, value: 'Mobile' },
        { label: { en: 'Sync', mn: 'Синк' }, value: 'Beat' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Creator' },
      ],
      compat: 'CapCut 12+',
    },
  },
  {
    id: 20,
    slug: 'meme-kit',
    name: 'Meme Kit',
    descKey: 'prod_meme_desc',
    app: 'CapCut',
    price: 9,
    originalPrice: 15,
    rating: 4.6,
    reviews: 519,
    badgeKey: null,
    image: '/images/product-trending.png',
    featured: false,
    detail: {
      tagline: {
        en: 'Meme text, stickers and SFX.',
        mn: 'Meme текст, стикер, дуун эффект.',
      },
      overview: {
        en: 'The classic meme toolkit — impact captions, zoom punches, censor bleeps and reaction stickers.',
        mn: 'Сонгодог meme хэрэгсэл — impact хадмал, zoom punch, цензур bleep, реакц стикер.',
      },
      highlights: [
        {
          title: { en: 'Impact captions', mn: 'Impact хадмал' },
          body: {
            en: 'The classic top-and-bottom meme text, one tap away.',
            mn: 'Сонгодог дээд-доод meme текст — нэг товшилтын зайд.',
          },
        },
        {
          title: { en: 'Zoom punch', mn: 'Zoom punch' },
          body: {
            en: 'Snap zooms and freeze frames for comedic timing.',
            mn: 'Хошин цагийн тулд snap zoom, freeze frame.',
          },
        },
        {
          title: { en: 'Reaction pack', mn: 'Реакц багц' },
          body: {
            en: 'Stickers and bleeps for punchlines and censoring.',
            mn: 'Punchline, цензурт зориулсан стикер, bleep.',
          },
        },
      ],
      specs: [
        { label: { en: 'Assets', mn: 'Материал' }, value: '120' },
        { label: { en: 'Platform', mn: 'Платформ' }, value: 'Mobile / Desktop' },
        { label: { en: 'Type', mn: 'Төрөл' }, value: 'Text + SFX' },
        { label: { en: 'License', mn: 'Лиценз' }, value: 'Creator' },
      ],
      compat: 'CapCut 12+',
    },
  },
]

export function getProduct(slug: string): OtherProduct | undefined {
  return OTHER_PRODUCTS.find((p) => p.slug === slug)
}

export function getFeatured(): OtherProduct[] {
  return OTHER_PRODUCTS.filter((p) => p.featured)
}

export function getByApp(app: string): OtherProduct[] {
  return OTHER_PRODUCTS.filter((p) => p.app === app)
}
