import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import axios from 'axios'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { topic, audience } = await request.json()
  const currentDate = new Date().toISOString().split('T')[0] // Get current date in YYYY-MM-DD format

  try {
    // Step 1: Get information from Perplexity
    console.log('Calling Perplexity API for recent developments...')
    const perplexityResponse = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that provides recent developments about topics.'
          },
          {
            role: 'user',
            content: `What are the most recent developments regarding "${topic}"? Provide a concise summary.`
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

    const recentDevelopments = perplexityResponse.data.choices[0].message.content
    console.log('Perplexity API response:', recentDevelopments)

    // Step 2: Use Claude to generate the podcast outline
    console.log('Calling Claude API for podcast outline...')
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Create a detailed podcast outline for a ${audience} audience on the topic: "${topic}". Today's date is ${currentDate}.

          Consider these recent developments about the topic:
          ${recentDevelopments}

          The outline should include:
          1. An engaging title for the podcast episode
          2. 3-5 main sections, each with a clear subtitle
          3. 2-3 key points or discussion topics for each section

          Provide your response in the following JSON format:
          {
            "title": "Podcast Episode Title",
            "sections": [
              {
                "title": "Section Title",
                "content": ["Key point 1", "Key point 2", "Key point 3"]
              },
              ...
            ]
          }

          Ensure that the JSON is valid and properly formatted.`
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

    const podcastOutline = JSON.parse(jsonMatch[0])

    console.log('Validated and parsed podcast outline:', podcastOutline)
    return NextResponse.json({ podcastOutline })
  } catch (error) {
    console.error('Error generating podcast outline:', error)
    return NextResponse.json({ error: `An error occurred while generating the podcast outline: ${(error as Error).message}` }, { status: 500 })
  }
}