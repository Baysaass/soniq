import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.getProducts()
    const ultimateBundle = await db.getUltimateBundle()
    return NextResponse.json({
      success: true,
      products,
      ultimateBundle,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { passcode, ...productData } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    if (!productData.title || !productData.title.trim()) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүний нэрийг оруулна уу.' }, { status: 400 })
    }

    const newProduct = await db.createProduct(productData)
    return NextResponse.json({
      success: true,
      product: newProduct,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let id = searchParams.get('id') || searchParams.get('slug') || ''
    let passcode = searchParams.get('passcode') || req.headers.get('x-admin-passcode') || ''

    try {
      const body = await req.json()
      if (body) {
        if (!id && (body.id || body.slug)) id = body.id || body.slug || ''
        if (!passcode && body.passcode) passcode = body.passcode
      }
    } catch {
      // Body may be empty in DELETE, ignore
    }

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    const success = await db.deleteProduct(id)
    return NextResponse.json({ success: true, message: 'Бүтээгдэхүүн амжилттай устгагдлаа.' })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
