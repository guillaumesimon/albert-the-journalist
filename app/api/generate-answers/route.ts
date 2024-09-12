import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  const { topic, questions } = await request.json()

  try {
    console.log('Calling Perplexity API for answer generation...')
    const answers = await Promise.all(questions.map(async (question: string) => {
      const perplexityResponse = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that provides concise and informative answers to questions about specific topics.'
            },
            {
              role: 'user',
              content: `Topic: ${topic}\nQuestion: ${question}\nProvide a concise answer in about 2-3 sentences.`
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

      return {
        question,
        answer: perplexityResponse.data.choices[0].message.content
      }
    }))

    console.log('Perplexity API responses received')
    return NextResponse.json({ answers })
  } catch (error) {
    console.error('Error generating answers:', error)
    return NextResponse.json({ error: `An error occurred while generating answers: ${(error as Error).message}` }, { status: 500 })
  }
}