'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import OutputScreen from '@/components/OutputScreen'

type EventInfo = {
  isEvent: boolean;
  eventTiming?: string;
  eventName?: string;
  eventDate?: string;
  category: string;
  questions?: string[];
  generatedImages?: string[];
}

export default function OutputPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const topic = searchParams?.get('topic') ?? ''
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('Current topic:', topic)

  useEffect(() => {
    if (topic) {
      fetchEventInfo(topic)
        .then(setEventInfo)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false))
    } else {
      setError('No topic provided')
      setIsLoading(false)
    }
  }, [topic])

  const handleSetEventInfo = () => {
    router.push('/')
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!eventInfo) {
    return <div>No event information available</div>
  }

  return <OutputScreen eventInfo={eventInfo} setEventInfo={handleSetEventInfo} />
}

async function fetchEventInfo(topic: string): Promise<EventInfo> {
  // In a real application, you would fetch this data from your backend or API
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    isEvent: true,
    eventTiming: 'Past',
    eventName: topic,
    eventDate: '2024-01-01',
    category: 'Technology',
    questions: ['What is the significance of this event?', 'Who were the key figures involved?'],
    generatedImages: [
      'https://replicate.delivery/pbxt/QzwqXFfRXQKOD8P5Ue7nITYTHCzNMPAcESvoNzhKZxzYHhbE/out-0.png',
      'https://replicate.delivery/pbxt/QzwqXFfRXQKOD8P5Ue7nITYTHCzNMPAcESvoNzhKZxzYHhbE/out-1.png',
      'https://replicate.delivery/pbxt/QzwqXFfRXQKOD8P5Ue7nITYTHCzNMPAcESvoNzhKZxzYHhbE/out-2.png',
      'https://replicate.delivery/pbxt/QzwqXFfRXQKOD8P5Ue7nITYTHCzNMPAcESvoNzhKZxzYHhbE/out-3.png'
    ]
  }
}