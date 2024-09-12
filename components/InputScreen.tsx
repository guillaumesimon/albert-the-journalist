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

interface InputScreenProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const ideaPills = ["JO 2024", "Iphone 16 Launch", "Kamala Harris Trump Debate", "Euro Cup 2024"];

export default function InputScreen({ onSubmit, loading }: InputScreenProps) {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('Primary school kids')
  const [country, setCountry] = useState('France')
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
    if (loading) {
      interval = setInterval(() => {
        setLoadingProgress((prevProgress) => {
          if (prevProgress >= 100) {
            if (interval) clearInterval(interval);
            return 100;
          }
          return prevProgress + 1;
        });
      }, 250); // 25000ms / 100 steps = 250ms per step
    } else {
      setLoadingProgress(0);
      setButtonState('idle');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setButtonState('analyzing')
    try {
      await onSubmit({ topic, audience, country })
    } catch (error) {
      setError('An error occurred while processing your request. Please try again.')
      setButtonState('idle')
    }
  }

  // Function to handle pill click
  const handlePillClick = (idea: string) => {
    console.log(`Pill clicked: ${idea}`); // User-friendly console log
    setTopic(idea);
  };

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

        {/* Idea pills */}
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {ideaPills.map((idea, index) => (
            <button
              key={index}
              type="button" // Add this to prevent form submission
              onClick={() => handlePillClick(idea)}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {idea}
            </button>
          ))}
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
              loading ? 'cursor-not-allowed opacity-75' : ''
            }`}
            disabled={loading}
          >
            <span className="relative z-10">
              {buttonLabels[buttonState as keyof typeof buttonLabels]}
            </span>
            {loading && (
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