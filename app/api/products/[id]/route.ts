import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = (await db.getProductById(id)) || (await db.getProductBySlug(id))
    if (!product) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн олдсонгүй.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, product })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { passcode, ...updates } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    const updated = await db.updateProduct(id, updates)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн олдсонгүй.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const passcode = searchParams.get('passcode')

    const isAuthorized = await db.verifyAdminPasscode(passcode || '')
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    const success = await db.deleteProduct(id)
    if (!success) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн устгахад алдаа гарлаа.' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
