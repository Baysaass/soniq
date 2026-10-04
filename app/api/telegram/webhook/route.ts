import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import {
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  sendTelegramMessage,
  formatOrderApprovedNotificationText,
} from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const update = await req.json().catch(() => null)
    if (!update) {
      return NextResponse.json({ ok: false, error: 'Empty payload' }, { status: 400 })
    }

    const settings = await db.getSettings().catch(() => null)
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN ||
      settings?.bankInfo?.telegramBotToken ||
      settings?.telegramBotToken ||
      ''

    const adminChatId =
      process.env.TELEGRAM_CHAT_ID ||
      settings?.bankInfo?.telegramChatId ||
      settings?.telegramChatId ||
      ''

    const siteUrl = new URL(req.url).origin

    // 1. Handle Inline Keyboard Callback Queries (e.g. callback_data = "approve:SQ-XXXXX")
    if (update.callback_query) {
      const cb = update.callback_query
      const data: string = cb.data || ''
      const fromChatId = cb.message?.chat?.id
      const messageId = cb.message?.message_id

      if (data.startsWith('approve:')) {
        const orderId = data.replace('approve:', '').trim()
        const order = await db.getOrderById(orderId)

        if (!order) {
          if (botToken) {
            await answerTelegramCallbackQuery({
              botToken,
              callbackQueryId: cb.id,
              text: `❌ Захиалга (${orderId}) олдсонгүй!`,
              showAlert: true,
            })
          }
          return NextResponse.json({ ok: true })
        }

        if (order.status === 'APPROVED') {
          if (botToken) {
            await answerTelegramCallbackQuery({
              botToken,
              callbackQueryId: cb.id,
              text: `ℹ️ Энэ захиалга өмнө нь баталгаажсан байна.`,
              showAlert: false,
            })
          }
          return NextResponse.json({ ok: true })
        }

        // Approve order
        const updated = await db.approveOrder(orderId)
        if (updated) {
          let emailResult = null
          try {
            emailResult = await sendOrderApprovedEmail({
              order: updated,
              siteUrl,
            })
          } catch {}

          const emailSuccess = Boolean(emailResult?.success)

          if (botToken) {
            await answerTelegramCallbackQuery({
              botToken,
              callbackQueryId: cb.id,
              text: `✅ ${orderId} амжилттай баталгаажлаа!`,
              showAlert: false,
            })

            // Edit message to reflect approval
            if (fromChatId && messageId) {
              const updatedText = formatOrderApprovedNotificationText(updated, emailSuccess, siteUrl)
              await editTelegramMessageText({
                botToken,
                chatId: fromChatId,
                messageId,
                text: updatedText,
                replyMarkup: {
                  inline_keyboard: [
                    [
                      {
                        text: '👁 Захиалга харах',
                        url: `${siteUrl}/order/${encodeURIComponent(updated.id)}`,
                      },
                      {
                        text: '⚙️ Админ самбар',
                        url: `${siteUrl}/admin`,
                      },
                    ],
                  ],
                },
              })
            }
          }
        }
        return NextResponse.json({ ok: true })
      }
    }

    // 2. Handle Text Commands (e.g. /approve SQ-12345 or /status SQ-12345)
    if (update.message && update.message.text && botToken) {
      const text: string = update.message.text.trim()
      const chatId = update.message.chat?.id

      // Only respond if chat matches adminChatId or no adminChatId is locked
      const isAuthorized = !adminChatId || String(chatId) === String(adminChatId)

      if (text.startsWith('/approve ') || text.startsWith('/confirm ')) {
        if (!isAuthorized) {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: '⛔ Та энэ ботыг удирдах эрхгүй байна.',
          })
          return NextResponse.json({ ok: true })
        }

        const orderId = text.split(' ')[1]?.trim().toUpperCase()
        if (!orderId) {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: '⚠️ Захиалгын дугаараа бичнэ үү.\nЖишээ: <code>/approve SQ-12345</code>',
          })
          return NextResponse.json({ ok: true })
        }

        const order = await db.getOrderById(orderId)
        if (!order) {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: `❌ <code>${orderId}</code> дугаартай захиалга олдсонгүй.`,
          })
          return NextResponse.json({ ok: true })
        }

        if (order.status === 'APPROVED') {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: `ℹ️ <code>${orderId}</code> захиалга өмнө нь баталгаажсан байна.`,
          })
          return NextResponse.json({ ok: true })
        }

        const updated = await db.approveOrder(orderId)
        if (updated) {
          let emailResult = null
          try {
            emailResult = await sendOrderApprovedEmail({
              order: updated,
              siteUrl,
            })
          } catch {}

          const emailSuccess = Boolean(emailResult?.success)
          const approvedText = formatOrderApprovedNotificationText(updated, emailSuccess, siteUrl)

          await sendTelegramMessage({
            botToken,
            chatId,
            text: approvedText,
          })
        }
        return NextResponse.json({ ok: true })
      }

      if (text.startsWith('/status ')) {
        const orderId = text.split(' ')[1]?.trim().toUpperCase()
        if (!orderId) {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: '⚠️ Захиалгын дугаараа бичнэ үү.\nЖишээ: <code>/status SQ-12345</code>',
          })
          return NextResponse.json({ ok: true })
        }

        const order = await db.getOrderById(orderId)
        if (!order) {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: `❌ <code>${orderId}</code> захиалга олдсонгүй.`,
          })
          return NextResponse.json({ ok: true })
        }

        const statusBadge =
          order.status === 'APPROVED' ? '✅ БАТАЛГААЖСАН' : order.status === 'CANCELLED' ? '❌ ЦУЦЛАГДСАН' : '⏳ ХҮЛЭЭГДЭЖ БУЙ'

        await sendTelegramMessage({
          botToken,
          chatId,
          text: `📦 <b>Захиалга:</b> <code>${order.id}</code>\n📊 <b>Төлөв:</b> ${statusBadge}\n👤 <b>Захиалагч:</b> ${order.customerName}\n📧 <b>Gmail:</b> ${order.customerEmail}\n💰 <b>Дүн:</b> ${order.totalAmountMNT?.toLocaleString()}₮`,
        })
        return NextResponse.json({ ok: true })
      }

      if (text === '/start' || text === '/help') {
        await sendTelegramMessage({
          botToken,
          chatId,
          text: `🤖 <b>SONIQ STORE Бот</b>\n\nБоломжтой үйлдлүүд:\n• <code>/approve SQ-XXXXX</code> — Захиалга шууд баталгаажуулах\n• <code>/status SQ-XXXXX</code> — Захиалгын төлөв шалгах\n\nШинэ захиалга ирэх бүрд танд шууд мэдэгдэл болон <b>[⚡ Шууд баталгаажуулах]</b> товч очих болно.`,
        })
        return NextResponse.json({ ok: true })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}
