import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const OutputPageContent = dynamic(() => import('@/components/OutputPageContent'), {
  ssr: false,
})

export default function OutputPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OutputPageContent />
    </Suspense>
  )
}