import { NextResponse } from 'next/server'
import axios from 'axios'
import FormData from 'form-data'

export async function POST(request: Request) {
  const { imageUrl } = await request.json()

  try {
    console.log('Downloading image from:', imageUrl)
    // Step 1: Download the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(imageResponse.data, 'binary')
    console.log('Image downloaded successfully')

    // Step 2: Prepare FormData with the image
    const formData = new FormData()
    formData.append('image_file', imageBuffer, { filename: 'image.jpg', contentType: imageResponse.headers['content-type'] })
    console.log('FormData prepared')

    console.log('Calling Photoroom API')
    // Step 3: Call Photoroom API
    const photoroomResponse = await axios.post(
      'https://sdk.photoroom.com/v1/segment',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': process.env.PHOTOROOM_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    )
    console.log('Photoroom API call successful')

    // Step 4: Convert the response to base64
    const base64Image = Buffer.from(photoroomResponse.data, 'binary').toString('base64')
    const dataUrl = `data:image/png;base64,${base64Image}`
    console.log('Image converted to base64')

    return NextResponse.json({ imageWithoutBackground: dataUrl })
  } catch (error) {
    console.error('Error removing background:', error)
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data)
      console.error('Axios error status:', error.response?.status)
      console.error('Axios error headers:', error.response?.headers)
    }
    return NextResponse.json({ error: 'Failed to remove background', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}