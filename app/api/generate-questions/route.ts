import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { topic, audience, country, isEvent, eventTiming } = await request.json()

  try {
    console.log('Calling Anthropic Claude API for question generation...')
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Generate 6 questions about the following topic: "${topic}". 
            Consider that the audience is ${audience} from ${country}.
            The topic is ${isEvent ? '' : 'not'} related to an event, and if it is, it's a ${eventTiming} event.
            
            If the event is in the past:
            - Use past tense in the questions
            - Focus on what happened, the outcomes, and the significance of the event
            - Ask about key figures involved and their roles
            - Explore the historical context and impact of the event

            If the event is in the future:
            - Use future tense in the questions
            - Focus on the anticipated details of the event (date, place, organization)
            - Ask about preparations, expectations, and potential outcomes
            - Explore the significance and potential impact of the upcoming event

            If the event is ongoing:
            - Use present tense in the questions
            - Focus on current developments, progress, and immediate impacts
            - Ask about key players and their current roles
            - Explore how the event is unfolding and its potential future implications

            If it's not an event:
            - Focus on general aspects, current relevance, and key concepts related to the topic
            - Ask about its importance, applications, or impact in the relevant field

            Generate questions that the target audience would ask themselves and a journalist would answer about the topic.
            Format the output as a JSON object with a single key "questions" containing an array of 6 question strings.`
        }
      ]
    })

    const claudeOutput = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : null
    if (typeof claudeOutput !== 'string') {
      console.error('Unexpected response format from Claude API')
      return NextResponse.json({ error: 'Unexpected response format from Claude API' }, { status: 500 })
    }
    console.log('Claude API response:', claudeOutput)

    // Validate JSON
    let questions
    try {
      questions = JSON.parse(claudeOutput).questions
    } catch (error) {
      console.error('Invalid JSON from Claude API:', error)
      return NextResponse.json({ error: 'Invalid JSON response from Claude API' }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json({ error: `An error occurred while generating questions: ${(error as Error).message}` }, { status: 500 })
  }
}