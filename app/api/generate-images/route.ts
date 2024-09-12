import { NextResponse } from 'next/server'
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: Request) {
  const { imagePrompts } = await request.json()

  try {
    console.log('Calling Replicate API for image generation...')
    const generatedImages = await Promise.all(imagePrompts.map(async (prompt: string) => {
      const output = await replicate.run(
        "black-forest-labs/flux-dev",
        {
          input: {
            prompt: prompt,
            width: 1024,
            height: 576,
            num_inference_steps: 50
          }
        }
      )
      // Check if output is an array and has at least one element
      if (Array.isArray(output) && output.length > 0) {
        return output[0] as string
      } else {
        console.error('Unexpected output format from Replicate API:', output)
        throw new Error('Unexpected output format from image generation API')
      }
    }))

    console.log('Images generated successfully:', generatedImages.length)
    return NextResponse.json({ generatedImages })
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json({ error: `An error occurred while generating images: ${(error as Error).message}` }, { status: 500 })
  }
}