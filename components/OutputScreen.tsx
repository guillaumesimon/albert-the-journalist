'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'

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

type OutputScreenProps = {
  eventInfo: EventInfo;
  setEventInfo: (eventInfo: null) => void;
  podcastOutline: PodcastOutline | null;
}

export default function OutputScreen({ eventInfo, setEventInfo, podcastOutline }: OutputScreenProps) {
  const [showTopicDetails, setShowTopicDetails] = useState(false)
  const [showQuestions, setShowQuestions] = useState(true)
  const [showIllustrations, setShowIllustrations] = useState(true)
  const [showPodcastOutline, setShowPodcastOutline] = useState(true)

  useEffect(() => {
    console.log('EventInfo in OutputScreen:', eventInfo)
  }, [eventInfo])

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
              {eventInfo.summary && (
                <p><strong>Summary:</strong> {eventInfo.summary}</p>
              )}
              <p><strong>Category:</strong> {eventInfo.category || 'Loading...'}</p>
              <p><strong>Topic related to an Event:</strong> {eventInfo.isEvent ? 'Yes' : 'No'}</p>
              {eventInfo.isEvent && eventInfo.eventTiming && (
                <p><strong>Event timing:</strong> {eventInfo.eventTiming}</p>
              )}
              {eventInfo.eventDate && (
                <p><strong>Event date:</strong> {eventInfo.eventDate}</p>
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
          {showQuestions && (
            <div className="mt-2 pl-4">
              {eventInfo.questions && eventInfo.questions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {eventInfo.questions.map((question, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-medium">{question}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-700 italic">Generating questions...</p>
              )}
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
          {showIllustrations && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              {eventInfo.generatedImages && eventInfo.generatedImages.length > 0 ? (
                eventInfo.generatedImages.map((imageUrl, index) => (
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
                ))
              ) : (
                <p className="text-gray-700 italic col-span-2">Generating illustrations...</p>
              )}
            </div>
          )}
        </div>

        {/* Podcast Outline Block */}
        <div className="mb-4">
          <button
            onClick={() => setShowPodcastOutline(!showPodcastOutline)}
            className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="font-semibold">📝 Podcast Outline</span>
            {showPodcastOutline ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {showPodcastOutline && (
            <div className="mt-2 pl-4">
              {podcastOutline ? (
                <>
                  <h4 className="text-lg font-semibold mb-2">{podcastOutline.title}</h4>
                  {podcastOutline.sections.map((section, index) => (
                    <div key={index} className="mb-4">
                      <h5 className="font-medium">{section.title}</h5>
                      <ul className="list-disc list-inside">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-gray-700 italic">Generating podcast outline...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}