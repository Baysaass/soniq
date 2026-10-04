import { NextResponse } from 'next/server'
import { db, invalidateProductsCache } from '@/lib/db'

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

    const adminPasscode = passcode || req.headers.get('x-admin-passcode') || ''
    const isAuthorized = await db.verifyAdminPasscode(adminPasscode)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    let updated = await db.updateProduct(id, updates)
    if (!updated && updates.slug) {
      updated = await db.updateProduct(updates.slug, updates)
    }
    if (!updated) {
      updated = await db.createProduct({ ...updates, id })
    }
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн хадгалахад алдаа гарлаа.' }, { status: 400 })
    }

    invalidateProductsCache()
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
    const queryPasscode = searchParams.get('passcode')
    const headerPasscode = req.headers.get('x-admin-passcode')

    let bodyPasscode = ''
    try {
      const body = await req.json()
      if (body?.passcode) bodyPasscode = body.passcode
    } catch {
      // Body may be empty in DELETE
    }

    const passcode = queryPasscode || headerPasscode || bodyPasscode || ''

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    const targetId = decodeURIComponent(id || '').trim()
    const success = await db.deleteProduct(targetId)
    if (!success) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн олдсонгүй эсвэл устгахад алдаа гарлаа.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Бүтээгдэхүүн амжилттай устгагдлаа.' })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
