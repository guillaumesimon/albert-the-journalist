'use client'

import { useEffect, useRef, useState } from 'react'

type ModelInteraction = {
  timestamp: string;
  modelName: string;
  systemPrompt: string;
  userPrompt: string;
  modelOutput: string;
}

type AdvancedModeProps = {
  modelInteractions: ModelInteraction[] | null;
  isOpen: boolean;
}

export default function AdvancedMode({ modelInteractions, isOpen }: AdvancedModeProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [modelInteractions])

  const toggleSection = (interactionId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${interactionId}-${section}`]: !prev[`${interactionId}-${section}`]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div
      className={`fixed top-0 right-0 w-1/3 h-full bg-gray-100 p-4 overflow-y-auto transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      ref={feedRef}
    >
      {(!modelInteractions || modelInteractions.length === 0) ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-600 text-sm text-center px-4">
            🧠 Welcome to Albert's Brain! 🚀<br/>
            This is where the magic happens.<br/>
            Start a topic analysis to see the gears turning!
          </p>
        </div>
      ) : (
        <div className="space-y-8 mt-16">
          {modelInteractions.map((interaction, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">{interaction.timestamp}</p>
              <p className="font-bold">Model: {interaction.modelName}</p>

              <div className="mt-2">
                <button
                  onClick={() => toggleSection(index.toString(), 'system')}
                  className="text-blue-600 hover:underline"
                >
                  {expandedSections[`${index}-system`] ? '[-]' : '[+]'} System Prompt
                </button>
                <div className={`mt-2 bg-gray-100 p-2 rounded ${expandedSections[`${index}-system`] ? '' : 'hidden'}`}>
                  <pre className="whitespace-pre-wrap break-words">{interaction.systemPrompt}</pre>
                  <button
                    onClick={() => copyToClipboard(interaction.systemPrompt)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <button
                  onClick={() => toggleSection(index.toString(), 'user')}
                  className="text-blue-600 hover:underline"
                >
                  {expandedSections[`${index}-user`] ? '[-]' : '[+]'} User Prompt
                </button>
                <div className={`mt-2 bg-gray-100 p-2 rounded ${expandedSections[`${index}-user`] ? '' : 'hidden'}`}>
                  <pre className="whitespace-pre-wrap break-words">{interaction.userPrompt}</pre>
                  <button
                    onClick={() => copyToClipboard(interaction.userPrompt)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <button
                  onClick={() => toggleSection(index.toString(), 'output')}
                  className="text-blue-600 hover:underline"
                >
                  {expandedSections[`${index}-output`] ? '[-]' : '[+]'} Model Output
                </button>
                <div className={`mt-2 bg-gray-100 p-2 rounded ${expandedSections[`${index}-output`] ? '' : 'hidden'}`}>
                  <pre className="whitespace-pre-wrap break-words">{interaction.modelOutput}</pre>
                  <button
                    onClick={() => copyToClipboard(interaction.modelOutput)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}