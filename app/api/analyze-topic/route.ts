import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import axios from 'axios'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { topic, audience, country } = await request.json()
  const currentDate = new Date().toISOString().split('T')[0] // Get current date in YYYY-MM-DD format

  try {
    // Step 1: Get information from Perplexity
    console.log('Calling Perplexity API for topic information...')
    const perplexityResponse = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that provides detailed information about topics.'
          },
          {
            role: 'user',
            content: `Provide detailed information about the following topic: "${topic}". Include any relevant dates, historical context, and current significance.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const perplexityInfo = perplexityResponse.data.choices[0].message.content
    console.log('Perplexity API response:', perplexityInfo)

    // Step 2: Use Claude to analyze the topic and generate JSON
    console.log('Calling Claude API for topic analysis...')
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Analyze the following topic: "${topic}". Consider the audience (${audience}) and country (${country}) in your analysis. Today's date is ${currentDate}.

          Here's additional information about the topic:
          ${perplexityInfo}

          Based on this information:
          1. Determine if the topic is related to an event, and if so, its timing and date.
          2. Categorize the topic into one of the following categories: Science, Sports, Politics, Technology, Entertainment, Business, Health, Education, or Other.
          3. Generate a concise summary of the topic in less than 240 characters.

          When determining the event timing:
          - If the event's start date is in the future compared to today's date (${currentDate}), set eventTiming to "Future".
          - If the event's end date is in the past compared to today's date, set eventTiming to "Past".
          - If today's date falls between the event's start and end dates (inclusive), set eventTiming to "Ongoing".
          - If the event is not date-specific or the timing cannot be determined, set eventTiming to null.

          For the eventDate, use the start date of the event if available. If not, use the most relevant date mentioned.

          Provide your response in the following JSON format:
          {
            "isEvent": boolean,
            "eventTiming": "Past" | "Ongoing" | "Future" | null,
            "eventDate": "YYYY-MM-DD" or null if not applicable,
            "category": "Science" | "Sports" | "Politics" | "Technology" | "Entertainment" | "Business" | "Health" | "Education" | "Other",
            "summary": "Concise summary of the topic in less than 240 characters"
          }

          Ensure that the JSON is valid and properly formatted. Double-check your date comparisons before finalizing the eventTiming.`
        }
      ]
    })

    const claudeOutput = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : null
    if (typeof claudeOutput !== 'string') {
      throw new Error('Unexpected response format from Claude API')
    }
    console.log('Claude API response:', claudeOutput)

    // Extract JSON from the response
    const jsonMatch = claudeOutput.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude API response')
    }

    const jsonOutput = jsonMatch[0]

    // Validate and correct JSON output
    try {
      const parsedOutput = JSON.parse(jsonOutput)
      
      // Validate eventTiming
      if (parsedOutput.isEvent && parsedOutput.eventDate) {
        const eventDate = new Date(parsedOutput.eventDate)
        const today = new Date(currentDate)
        
        if (eventDate > today) {
          parsedOutput.eventTiming = "Future"
        } else if (eventDate < today) {
          parsedOutput.eventTiming = "Past"
        } else {
          parsedOutput.eventTiming = "Ongoing"
        }
      }

      // Validate summary length
      if (parsedOutput.summary && parsedOutput.summary.length > 240) {
        parsedOutput.summary = parsedOutput.summary.substring(0, 237) + '...'
      }

      // Re-stringify the corrected output
      const correctedOutput = JSON.stringify(parsedOutput)
      
      console.log('Validated and corrected Claude API response:', correctedOutput)
      return NextResponse.json({ perplexityInfo, claudeOutput: correctedOutput })
    } catch (error) {
      console.error('Invalid JSON from Claude API:', error)
      return NextResponse.json({ error: 'Invalid JSON response from Claude API' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error analyzing topic:', error)
    return NextResponse.json({ error: `An error occurred while analyzing the topic: ${(error as Error).message}` }, { status: 500 })
  }
}