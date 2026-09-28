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
