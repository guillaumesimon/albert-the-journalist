'use client'

import { useState } from 'react'
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'

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

type OutputScreenProps = {
  eventInfo: EventInfo;
  setEventInfo: (eventInfo: null) => void;
}

export default function OutputScreen({ eventInfo, setEventInfo }: OutputScreenProps) {
  const [showTopicDetails, setShowTopicDetails] = useState(false)
  const [showQuestions, setShowQuestions] = useState(true)
  const [showContentOutline, setShowContentOutline] = useState(false)
  const [showImagePrompts, setShowImagePrompts] = useState(false)
  const [showIllustrations, setShowIllustrations] = useState(true)

  return (
    <div className="space-y-6 max-w-2xl mx-auto relative">
      <button
        onClick={() => setEventInfo(null)}
        className="absolute -left-16 top-0 p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="h-6 w-6 text-indigo-600" />
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          {eventInfo.eventName || 'Topic Analysis'}
        </h2>

        {/* Topic Details Block */}
        <div className="mb-4">
          <button
            onClick={() => setShowTopicDetails(!showTopicDetails)}
            className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="font-semibold">Topic Details</span>
            {showTopicDetails ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {showTopicDetails && (
            <div className="mt-2 pl-4 space-y-2">
              <p>Category: {eventInfo.category}</p>
              <p>Topic related to an Event: {eventInfo.isEvent ? 'Yes' : 'No'}</p>
              {eventInfo.isEvent && eventInfo.eventTiming && (
                <p>Event timing: {eventInfo.eventTiming}</p>
              )}
              {eventInfo.eventDate && (
                <p>Event date: {eventInfo.eventDate}</p>
              )}
            </div>
          )}
        </div>

        {/* Key Questions Block */}
        <div className="mb-4">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="font-semibold">🎙️ Key Questions to Explore in the Podcast</span>
            {showQuestions ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {showQuestions && eventInfo.questions && eventInfo.questions.length > 0 && (
            <div className="mt-2 pl-4">
              <ol className="list-decimal list-inside space-y-2">
                {eventInfo.questions.map((question, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{question}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Content Outlines Block (Empty for now) */}
        <div className="mb-4">
          <button
            onClick={() => setShowContentOutline(!showContentOutline)}
            className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="font-semibold">📝 Content Outlines</span>
            {showContentOutline ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {showContentOutline && (
            <div className="mt-2 pl-4">
              <p className="text-gray-700 italic">Content outlines will be available soon.</p>
            </div>
          )}
        </div>

        {/* Illustrations Block */}
        <div className="mb-4">
          <button
            onClick={() => setShowIllustrations(!showIllustrations)}
            className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="font-semibold">🖼️ Illustrations</span>
            {showIllustrations ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {showIllustrations && eventInfo.generatedImages && eventInfo.generatedImages.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              {eventInfo.generatedImages.map((imageUrl, index) => (
                <Link 
                  href={`/image/${index + 1}?src=${encodeURIComponent(imageUrl)}&topic=${encodeURIComponent(eventInfo.eventName || '')}`} 
                  key={index}
                >
                  <div className="relative aspect-video cursor-pointer">
                    <Image
                      src={imageUrl}
                      alt={`Generated illustration ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Image Prompts Block */}
        <div className="mb-4">
          <button
            onClick={() => setShowImagePrompts(!showImagePrompts)}
            className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="font-semibold">🎨 Image Prompts for Illustration</span>
            {showImagePrompts ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {showImagePrompts && eventInfo.imagePrompts && eventInfo.imagePrompts.length > 0 && (
            <div className="mt-2 pl-4">
              <ol className="list-decimal list-inside space-y-2">
                {eventInfo.imagePrompts.map((prompt, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{prompt}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}