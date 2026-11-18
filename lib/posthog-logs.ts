import { SeverityNumber } from '@opentelemetry/api-logs'
import { after } from 'next/server'
import { posthogLogProvider } from '@/instrumentation'

const posthogLogger = posthogLogProvider?.getLogger('soniq.posthog.logs')

function flushAfterResponse() {
  after(async () => {
    await posthogLogProvider?.forceFlush().catch(() => {})
  })
}

export function logOrderCreated({
  isFree,
  itemCount,
  paymentMethod,
}: {
  isFree: boolean
  itemCount: number
  paymentMethod: string
}) {
  posthogLogger?.emit({
    body: 'order_created',
    severityNumber: SeverityNumber.INFO,
    attributes: {
      is_free: isFree,
      item_count: itemCount,
      payment_method: paymentMethod,
    },
  })
  flushAfterResponse()
}

export function logPaymentApproved({ paymentMethod }: { paymentMethod: string }) {
  posthogLogger?.emit({
    body: 'payment_approved',
    severityNumber: SeverityNumber.INFO,
    attributes: { payment_method: paymentMethod },
  })
  flushAfterResponse()
}
