'use client'

import { useState } from 'react'
import InputScreen from '@/components/InputScreen'
import OutputScreen from '@/components/OutputScreen'

type ModelInteraction = {
  timestamp: string;
  modelName: string;
  systemPrompt: string;
  userPrompt: string;
  modelOutput: string;
}

type EventInfo = {
  isEvent: boolean;
  eventTiming?: string;
  eventName?: string;
  eventDate?: string;
  category: string;
  summary?: string;
  questions?: string[];
  imagePrompts?: string[];
  generatedImages?: string[];
}

type PodcastOutline = {
  title: string;
  sections: {
    title: string;
    content: string[];
  }[];
}

export default function Home() {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [podcastOutline, setPodcastOutline] = useState<PodcastOutline | null>(null)

  const handleSetEventInfo = (info: EventInfo | null) => {
    setEventInfo(info)
    if (info === null) {
      // Clear model interactions when starting a new analysis
      // setModelInteractions([])
    }
  }

  const handleSubmit = async (data: { topic: string; audience: string; country: string }) => {
    // Initialize eventInfo with basic data to trigger OutputScreen rendering
    setEventInfo({
      isEvent: false,
      category: '',
      eventName: data.topic,
      questions: [],
      imagePrompts: [],
      generatedImages: [],
    })

    try {
      // Analyze topic
      console.log('Analyzing topic...')
      const analyzeResponse = await fetch('/api/analyze-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const analyzeData = await analyzeResponse.json()
      console.log('Topic analysis complete:', analyzeData)
      setEventInfo(prevInfo => prevInfo ? { ...prevInfo, ...JSON.parse(analyzeData.claudeOutput) } : null)

      // Generate questions
      console.log('Generating questions...')
      const questionsResponse = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...JSON.parse(analyzeData.claudeOutput) }),
      })
      const questionsData = await questionsResponse.json()
      console.log('Questions generated:', questionsData)
      setEventInfo(prevInfo => prevInfo ? { ...prevInfo, questions: questionsData.questions } : null)

      // Generate image prompts
      console.log('Generating image prompts...')
      const imagePromptsResponse = await fetch('/api/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: data.topic, questions: questionsData.questions }),
      })
      const imagePromptsData = await imagePromptsResponse.json()
      console.log('Image prompts generated:', imagePromptsData)
      setEventInfo(prevInfo => prevInfo ? { ...prevInfo, imagePrompts: imagePromptsData.imagePrompts } : null)

      // Generate images
      console.log('Generating images...')
      const imagesResponse = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompts: imagePromptsData.imagePrompts }),
      })
      const imagesData = await imagesResponse.json()
      console.log('Images generated:', imagesData)
      setEventInfo(prevInfo => prevInfo ? { ...prevInfo, generatedImages: imagesData.generatedImages } : null)

      // After generating images, automatically generate the podcast outline
      console.log('Generating podcast outline...')
      const outlineResponse = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: data.topic, audience: data.audience }),
      })
      const outlineData = await outlineResponse.json()
      console.log('Podcast outline generated:', outlineData)
      setPodcastOutline(outlineData.podcastOutline)

    } catch (error) {
      console.error('Error processing request:', error)
      setEventInfo(null) // Reset eventInfo on error
    } finally {
      // setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-grow">
        <div className="p-24">
          <h1 className="text-4xl font-bold mb-2 text-center">
            Albert 🕵️‍♂️
          </h1>
          <div className="max-w-md mx-auto mb-8">
            <p className="text-m text-center text-gray-600">
              Your AI assistant for creating tailored content on any topic, for any audience. 
              Powered by up-to-date information and advanced language models.
            </p>
          </div>
          <div className="w-full">
            {!eventInfo ? (
              <InputScreen
                onSubmit={handleSubmit}
                loading={loading}
              />
            ) : (
              <OutputScreen
                eventInfo={eventInfo}
                setEventInfo={handleSetEventInfo}
                podcastOutline={podcastOutline}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}