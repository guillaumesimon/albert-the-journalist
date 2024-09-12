'use client'

import { useState, FormEvent, useEffect } from 'react'

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
  imagePrompts?: string[];
  generatedImages?: string[];
}

type InputScreenProps = {
  setEventInfo: (eventInfo: EventInfo) => void
  onModelInteraction: (interaction: ModelInteraction) => void
}

export default function InputScreen({ setEventInfo, onModelInteraction }: InputScreenProps) {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('Primary school kids')
  const [country, setCountry] = useState('France')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonState, setButtonState] = useState('idle')
  const [loadingProgress, setLoadingProgress] = useState(0)

  const buttonLabels = {
    idle: 'Analyze Topic! 🔍✨',
    analyzing: 'Putting on detective hat 🕵️‍♂️',
    questioning: 'Brainstorming questions 🧠💭',
    imagining: 'Painting mental pictures 🎨🖼️',
    generating: 'Summoning AI artist 🤖🎭',
    finalizing: 'Wrapping it up with a bow 🎁'
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress((prevProgress) => {
          if (prevProgress >= 100) {
            if (interval) clearInterval(interval);
            return 100;
          }
          return prevProgress + 1;
        });
      }, 250); // 25000ms / 100 steps = 250ms per step
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setButtonState('analyzing')
    setLoadingProgress(0)

    try {
      // Call analyze-topic API
      const analyzeResponse = await fetch('/api/analyze-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, audience, country }),
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        throw new Error(errorData.error || 'Failed to analyze topic')
      }

      const analyzeData = await analyzeResponse.json()

      // Create and send Perplexity interaction
      const perplexityInteraction: ModelInteraction = {
        timestamp: new Date().toISOString(),
        modelName: 'Perplexity API',
        systemPrompt: 'You are an AI assistant that provides detailed information about topics.',
        userPrompt: `Provide detailed information about the following topic: "${topic}". Consider the audience (${audience}) and country (${country}) in your analysis. Include any relevant dates, historical context, and current significance.`,
        modelOutput: analyzeData.perplexityInfo
      }
      onModelInteraction(perplexityInteraction)

      // Create and send Claude interaction for analysis
      const claudeInteraction: ModelInteraction = {
        timestamp: new Date().toISOString(),
        modelName: 'Claude 3 Sonnet (Analysis)',
        systemPrompt: 'You are an AI assistant that analyzes topics and determines if they are related to events.',
        userPrompt: `Analyze the following topic: "${topic}". Consider the audience (${audience}) and country (${country}) in your analysis. Today's date is ${new Date().toISOString().split('T')[0]}. Based on the provided information, determine if the topic is related to an event, and if so, its timing and date.`,
        modelOutput: analyzeData.claudeOutput
      }
      onModelInteraction(claudeInteraction)

      // Parse the claudeOutput as JSON
      const parsedOutput = JSON.parse(analyzeData.claudeOutput)

      setButtonState('questioning')
      // Call generate-questions API
      const questionsResponse = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          audience,
          country,
          isEvent: parsedOutput.isEvent,
          eventTiming: parsedOutput.eventTiming
        }),
      })

      if (!questionsResponse.ok) {
        const errorData = await questionsResponse.json()
        throw new Error(errorData.error || 'Failed to generate questions')
      }

      const questionsData = await questionsResponse.json()

      // Create and send Claude interaction for questions
      const questionsInteraction: ModelInteraction = {
        timestamp: new Date().toISOString(),
        modelName: 'Claude 3 Sonnet (Questions)',
        systemPrompt: 'You are an AI assistant that generates questions about topics.',
        userPrompt: `Generate 6 questions about the following topic: "${topic}". 
          Consider that the audience is ${audience} from ${country}.
          The topic is ${parsedOutput.isEvent ? '' : 'not'} related to an event, and if it is, it's a ${parsedOutput.eventTiming} event.`,
        modelOutput: JSON.stringify(questionsData.questions, null, 2)
      }
      onModelInteraction(questionsInteraction)

      setButtonState('imagining')
      // Call generate-image-prompts API
      const imagePromptsResponse = await fetch('/api/generate-image-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          audience,
          country,
          isEvent: parsedOutput.isEvent,
          eventTiming: parsedOutput.eventTiming,
          category: parsedOutput.category
        }),
      })

      if (!imagePromptsResponse.ok) {
        const errorData = await imagePromptsResponse.json()
        throw new Error(errorData.error || 'Failed to generate image prompts')
      }

      const imagePromptsData = await imagePromptsResponse.json()

      setButtonState('generating')
      // Call generate-images API
      const generateImagesResponse = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagePrompts: imagePromptsData.imagePrompts
        }),
      })

      if (!generateImagesResponse.ok) {
        const errorData = await generateImagesResponse.json()
        throw new Error(errorData.error || 'Failed to generate images')
      }

      const generatedImagesData = await generateImagesResponse.json()

      const imagePromptsInteraction: ModelInteraction = {
        timestamp: new Date().toISOString(),
        modelName: 'Claude 3 Sonnet (Image Prompts)',
        systemPrompt: 'You are an AI assistant that generates image prompts for topics.',
        userPrompt: `Generate 4 detailed prompts for text-to-image AI models to illustrate the topic: "${topic}" for ${audience} audience in ${country}.`,
        modelOutput: JSON.stringify(imagePromptsData.imagePrompts, null, 2)
      }
      onModelInteraction(imagePromptsInteraction)

      setButtonState('finalizing')
      setEventInfo({
        isEvent: parsedOutput.isEvent,
        eventTiming: parsedOutput.eventTiming,
        eventName: topic,
        eventDate: parsedOutput.eventDate,
        category: parsedOutput.category,
        questions: questionsData.questions,
        imagePrompts: imagePromptsData.imagePrompts,
        generatedImages: generatedImagesData.generatedImages
      })
    } catch (error) {
      console.error('Error processing topic:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(`An error occurred while processing the topic: ${errorMessage}. Please try again.`)
    } finally {
      setIsLoading(false)
      setButtonState('idle')
      setLoadingProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label htmlFor="topic" className="block text-gray-700 text-sm font-bold mb-2">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={100}
            placeholder="Enter your podcast topic here"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="audience" className="block text-gray-700 text-sm font-bold mb-2">
            Audience 👥
          </label>
          <select
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>Primary school kids</option>
            <option>High school kids</option>
            <option>Adults</option>
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">
            Country 🌍
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>France</option>
            <option>USA</option>
            <option>United Kingdom</option>
          </select>
        </div>
        <div className="relative">
          <button
            type="submit"
            className={`relative w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out overflow-hidden ${
              isLoading ? 'animate-pulse' : ''
            }`}
            disabled={isLoading}
          >
            <span className="relative z-10">
              {buttonLabels[buttonState as keyof typeof buttonLabels]}
            </span>
            {isLoading && (
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300 ease-in-out"
                style={{ width: `${loadingProgress}%` }}
              />
            )}
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </form>
  )
}