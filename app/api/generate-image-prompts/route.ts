import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { topic, audience, country } = await request.json()

  try {
    console.log('Calling Anthropic Claude API for image prompt generation...')
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Generate 4 detailed prompts suitable for a text-to-image AI model to illustrate the following topic: "${topic}".
            Consider that the audience is ${audience} from ${country}.

            Each prompt should be vivid, descriptive, and capture a unique aspect or perspective of the topic.
            Include details about style, mood, colors, and composition that would result in engaging and relevant images for the topic.

            IMPORTANT: 
            - Each prompt MUST start with "a magazine high fidelity photography of"
            - Each prompt MUST end with "shot with Sony A7R IV with 16-35mm f/2.8 GM, orange color grade LUT –ar 16:9"

            Format the output as a JSON object with a single key "imagePrompts" containing an array of 4 prompt strings.
            
            Example format:
            {
              "imagePrompts": [
                "a magazine high fidelity photography of [detailed description of the scene] shot with Sony A7R IV with 16-35mm f/2.8 GM, orange color grade LUT –ar 16:9",
                "a magazine high fidelity photography of [detailed description of the scene] shot with Sony A7R IV with 16-35mm f/2.8 GM, orange color grade LUT –ar 16:9",
                "a magazine high fidelity photography of [detailed description of the scene] shot with Sony A7R IV with 16-35mm f/2.8 GM, orange color grade LUT –ar 16:9",
                "a magazine high fidelity photography of [detailed description of the scene] shot with Sony A7R IV with 16-35mm f/2.8 GM, orange color grade LUT –ar 16:9"
              ]
            }

            Ensure that each prompt is unique and captures different aspects of the topic.`
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
    let imagePrompts
    try {
      imagePrompts = JSON.parse(claudeOutput).imagePrompts
    } catch (error) {
      console.error('Invalid JSON from Claude API:', error)
      return NextResponse.json({ error: 'Invalid JSON response from Claude API' }, { status: 500 })
    }

    // Ensure all prompts start and end with the required phrases
    imagePrompts = imagePrompts.map((prompt: string) => {
      let updatedPrompt = prompt.trim()
      if (!updatedPrompt.toLowerCase().startsWith("a magazine high fidelity photography of")) {
        updatedPrompt = "a magazine high fidelity photography of " + updatedPrompt
      }
      if (!updatedPrompt.toLowerCase().endsWith("shot with sony a7r iv with 16-35mm f/2.8 gm, orange color grade lut –ar 16:9")) {
        updatedPrompt += " shot with Sony A7R IV with 16-35mm f/2.8 GM, orange color grade LUT –ar 16:9"
      }
      return updatedPrompt
    })

    return NextResponse.json({ imagePrompts })
  } catch (error) {
    console.error('Error generating image prompts:', error)
    return NextResponse.json({ error: `An error occurred while generating image prompts: ${(error as Error).message}` }, { status: 500 })
  }
}