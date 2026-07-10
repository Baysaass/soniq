'use client'

import { createContext, useContext, type ReactNode } from 'react'

export const translations = {
  mn: {
    // Navbar
    nav_features: 'Боломжууд',
    nav_others: 'Бусад',
    nav_others_all: 'Бүх бүтээгдэхүүн үзэх',
    nav_get: 'Soniq авах',

    // Hero
    hero_headline: 'SFX хайхад биш, Edit хийхэд цагаа зарцуул.',
    hero_body:
      'Мянган SFX дундаас хайж цаг алдахгүй. Preview хийгээд нэг товшилтоор Timeline руугаа оруулаарай.',
    hero_note: 'Нэг удаагийн төлбөр · Насан туршийн хэрэглээ',

    // Packages
    pkg_starter_name: 'Starter',
    pkg_starter_price: '29,900₮',
    pkg_starter_sfx: '150+ SFX',
    pkg_starter_desc: 'Extension + Starter SFX багц',
    pkg_full_name: 'Full',
    pkg_full_price: '59,900₮',
    pkg_full_sfx: '500+ SFX',
    pkg_full_desc: 'Extension + Бүх SFX багц',
    pkg_full_badge: 'Хамгийн их авдаг',
    pkg_onetime: 'Нэг удаагийн төлбөр',

    // Shuttle features
    feat2_headline: 'Нэг SFX. Олон мэдрэмж.',
    feat2_body:
      'Нэг SFX-ийг өөр өөр хэв маягаар хувиргаж, видеоны хэмнэлд хамгийн сайн тохирох хувилбарыг сонгоорой.',
    feat2_note: 'Tight, Deep, Echo, Hall, Underwater... Modifier бүрээр нэг дуу хэдэн ч янзаар сонсогдоно.',
    feat3_headline: 'Өөрийн SFX багцуудыг үүсгэ.',

    // Timeline feature (Premiere Pro + After Effects)
    feat4_headline: 'Timeline руу шууд нэг товшилтоор',
    feat4_body:
      'Premiere Pro болон After Effects — аль алинд нь playhead-ийн байрлалд SFX шууд нэмэгдэнэ. Файл хайж, чирж оруулах хэрэггүй.',


    // Features (one-word headings, shuttle-style)
    f1_eyebrow: 'Синк',
    f1_body:
      'Дуугаа оруулахад л Soniq бит болон онсет бүрийг keyframe болгон автоматаар буулгана. Шөнө дөлөөр долгион гараар мөшгих хэрэггүй.',
    f2_eyebrow: 'Реакц',
    f2_body:
      'Scale, glow, position — дурын шинж чанарыг давтамжийн зурваст холбоорой. Басс камерыг, өндөр давтамж гялбааг удирдана.',
    f3_eyebrow: 'Рендер',
    f3_body:
      'Долгион, спектр, партикл — бүрэн өөрчилж болох 120 пресет. 60 fps-ээр шууд урьдчилан харна.',

    // Stats
    stat1_label: 'SFX бэлэн',
    stat2_label: 'Timeline Insert',
    stat3_label: 'Төрөлийн  SFX',
    stat4_label: 'FPS',

    // Others
    others_eyebrow: 'Дэлгүүрийн бусад',
    others_heading: 'Бусад бүтээгдэхүүн',
    others_subline:
      'Дууг Soniq хариуцна. Харин өнгө, ретуш, вектор, вирал эффект — эдгээрийг доорх хэрэгслүүд хариуцна.',

    // Product detail
    detail_back: 'Бусад бүтээгдэхүүн',
    detail_overview: 'Тухай',
    detail_highlights: 'Онцлог',
    detail_specs: 'Үзүүлэлт',
    detail_compat: 'Тохирох',
    detail_related: 'Бусад бүтээгдэхүүн',
    detail_reviews: 'сэтгэгдэл',
    detail_cta_note: 'Нэг удаагийн төлбөр · Үнэгүй шинэчлэлт · 14 хоногийн буцаалт',
    detail_not_found: 'Бүтээгдэхүүн олдсонгүй',
    detail_not_found_back: 'Бүх бүтээгдэхүүн рүү буцах',

    // Shared product UI
    badge_bestseller: 'Бестселлер',
    badge_new: 'Шинэ',
    badge_popular: 'Алдартай',
    badge_hot: 'Халуун',
    badge_featured: 'Онцлох',
    btn_add: 'Худалдаж авах',
    btn_added: 'Авагдсан',

    // Product descriptions
    prod_motion_blur_desc: 'Нэг товшилтоор синематик motion blur. 40+ тохиргоо орсон.',
    prod_color_suite_desc: 'AI өнгөний шийдэл. Дурын синематик өнгийг хурдан тааруул.',
    prod_smart_retouch_desc: 'AI-тэй арьс засвар. Байгалийн үр дүнтэй, устгахгүй арга.',
    prod_neon_fx_desc: '120 неон гэрлийн эффект. Бүрэн тохиргоотой.',
    prod_trending_desc: 'Трэнд бүтээгчдийн вирал шилжилт, эффектүүд.',
    prod_vector_desc: '200+ вектор хэрэгсэл ба хурдан зурах товчлолууд.',
    prod_morph_3d_desc: 'Физикийн симуляцтай органик 3D хэлбэрийн шилжилт.',
    prod_lut_desc: 'Бүх жанр, загварт зориулсан 500 мэргэжлийн LUT.',
    prod_glitch_desc: 'Datamosh, RGB split, VHS glitch — битэд анимацлагдсан.',
    prod_light_rays_desc: 'Дурын давхаргаас эзэлхүүнт туяа, линзний гэрэл.',
    prod_particle_desc: 'Оч, тоос, конфетти — бэлэн GPU партикл систем.',
    prod_transition_desc: 'Real-time рендерлэдэг чирч тавих 200 шилжилт.',
    prod_sound_fx_desc: 'Дурын cut-д зориулсан royalty-free 1,000 дуун эффект.',
    prod_sky_desc: 'Урд талыг авто гэрэлтүүлдэг AI тэнгэр солих.',
    prod_poster_desc: 'Типографи, duotone-той редакцийн зурагт хуудасны загвар.',
    prod_pattern_desc: 'Төгсгөлгүй давтагдах тасралтгүй вектор хээ үүсгэнэ.',
    prod_icon_desc: '500 засварлах дүрс, нэг товшилтоор SVG экспорт.',
    prod_caption_desc: 'Shorts, reels-д зориулсан үг үгээр кинетик хадмал.',
    prod_beat_cut_desc: 'Хөгжимд синклэдэг бит илрүүлсэн cut, shake.',
    prod_meme_desc: 'Impact хадмал, zoom punch, реакц стикер.',

    // Others catalogue page
    others_all_title: 'Бүх бүтээгдэхүүн',
    others_all_sub:
      'Дэлгүүрийн бүх нэмэлт, харьяалагдах програмаар нь ангилсан. Дууг Soniq — бусдыг эдгээр хариуцна.',
    cat_all: 'Бүгд',
    others_cat_count: 'бүтээгдэхүүн',

    // Footer
    footer_headline: 'SFX хайхад биш, Edit хийхэд цагаа зарцуул.',
    footer_sub: 'Freelancer, YouTuber, Motion Designer, Video Editor-уудын workflow-д зориулсан.',
    footer_cta: 'Soniq авах',
    footer_copyright: '© 2026 Soniq',

  },
} as const

export type TranslationKey = keyof (typeof translations)['mn']

// Зөвхөн монгол хэл. Хэлний сонголт байхгүй — t() шууд монголоор буцаана.
interface LangContextType {
  lang: 'mn'
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'mn',
  t: (key) => translations.mn[key],
})

export function LangProvider({ children }: { children: ReactNode }) {
  function t(key: TranslationKey) {
    return translations.mn[key]
  }

  return <LangContext.Provider value={{ lang: 'mn', t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
