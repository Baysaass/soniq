import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Subdomain detection: shop.soniq.click or shop.localhost
  const isShopSubdomain =
    hostname.startsWith('shop.') ||
    hostname === 'shop.soniq.click' ||
    hostname.includes('shop.localhost')

  if (isShopSubdomain) {
    // If on shop subdomain and accessing root `/`, rewrite to `/shop`
    if (url.pathname === '/') {
      url.pathname = '/shop'
      return NextResponse.rewrite(url)
    }

    // If accessing /product/[slug] on shop subdomain, rewrite to /shop/product/[slug]
    if (url.pathname.startsWith('/product/')) {
      url.pathname = `/shop${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Admin subdomain detection: admin.soniq.click or admin.localhost
  const isAdminSubdomain =
    hostname.startsWith('admin.') ||
    hostname === 'admin.soniq.click' ||
    hostname.includes('admin.localhost')

  if (isAdminSubdomain) {
    // If on admin subdomain and accessing root `/`, rewrite to `/admin`
    if (url.pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
}
