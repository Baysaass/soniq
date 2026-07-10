'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { SoniqFeatures } from '@/components/soniq-features'
import { Stats } from '@/components/stats'
import { Footer } from '@/components/footer'
import { PurchaseModal, type PlanType } from '@/components/purchase-modal'

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('full')

  const openModal = (plan: PlanType, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setSelectedPlan(plan)
    setModalOpen(true)
  }

  return (
    <main>
      <Navbar onGetClick={(e) => openModal('full', e)} />
      <Hero onGetClick={openModal} />
      <SoniqFeatures />
      <Stats />
      <Footer onGetClick={openModal} />
      <PurchaseModal isOpen={modalOpen} selectedPlan={selectedPlan} onClose={() => setModalOpen(false)} />
    </main>
  )
}
