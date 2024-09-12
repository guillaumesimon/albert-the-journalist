'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'

export default function ImagePage({ params, searchParams }: { params: { id: string }, searchParams: { src: string, topic: string } }) {
  const router = useRouter()
  const { id } = params
  const { src, topic } = searchParams
  const [currentImage, setCurrentImage] = useState(src)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoBack = () => {
    // Navigate back to the input form
    router.push('/')
  }

  const handleRemoveBackground = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: src }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove background')
      }

      const data = await response.json()
      setCurrentImage(data.imageWithoutBackground)
    } catch (error) {
      console.error('Error removing background:', error)
      alert('Failed to remove background. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto relative p-6">
      <button
        onClick={handleGoBack}
        className="absolute -left-16 top-0 p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
        aria-label="Go back to input form"
      >
        <ArrowLeftIcon className="h-6 w-6 text-indigo-600" />
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          Image {id} for Topic: {topic}
        </h2>

        <div className="mb-8">
          <Image
            src={currentImage}
            alt={`Generated image ${id}`}
            width={1024}
            height={576}
            layout="responsive"
            className="rounded-lg"
          />
        </div>

        <div className="flex justify-center">
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            onClick={handleRemoveBackground}
            disabled={isLoading}
          >
            {isLoading ? 'Removing Background...' : 'Remove Background'}
          </button>
        </div>
      </div>
    </div>
  )
}