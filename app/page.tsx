'use client'

import { useState } from 'react'
import InputScreen from '@/components/InputScreen'
import OutputScreen from '@/components/OutputScreen'
import AdvancedMode from '@/components/AdvancedMode'
import Link from 'next/link'

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
  questions?: string[];
}

export default function Home() {
  const [showAdvancedMode, setShowAdvancedMode] = useState(false)
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [modelInteractions, setModelInteractions] = useState<ModelInteraction[]>([])

  const toggleAdvancedMode = () => {
    setShowAdvancedMode(!showAdvancedMode)
  }

  const handleModelInteraction = (interaction: ModelInteraction) => {
    setModelInteractions(prevInteractions => [...prevInteractions, interaction])
  }

  const handleSetEventInfo = (info: EventInfo | null) => {
    setEventInfo(info)
    if (info === null) {
      // Clear model interactions when starting a new analysis
      setModelInteractions([])
    }
  }

  return (
    <div className="flex min-h-screen">
      <main className={`flex-grow transition-all duration-300 ${showAdvancedMode ? 'mr-1/3' : ''}`}>
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
              <InputScreen setEventInfo={handleSetEventInfo} onModelInteraction={handleModelInteraction} />
            ) : (
              <OutputScreen eventInfo={eventInfo} setEventInfo={handleSetEventInfo} />
            )}
          </div>
        </div>
      </main>
      <AdvancedMode modelInteractions={modelInteractions} isOpen={showAdvancedMode} />
      <button
        onClick={toggleAdvancedMode}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Toggle Advanced Mode"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${showAdvancedMode ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {showAdvancedMode ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>
  )
}