import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Key available:', !!process.env.ELEVENLABS_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    )

    console.log('ElevenLabs API Response Status:', response.status);
    console.log('ElevenLabs API Response Headers:', response.headers);

    const audioBuffer = Buffer.from(response.data, 'binary')
    const audioBase64 = audioBuffer.toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`

    res.status(200).json({ audioUrl })
  } catch (error) {
    console.error('Error converting text to speech:', error)
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data.toString('utf8'))
      res.status(500).json({ error: 'Failed to convert text to speech', details: error.response?.data.toString('utf8') })
    } else {
      res.status(500).json({ error: 'Failed to convert text to speech', details: (error as Error).message })
    }
  }
}

console.log('API Key available:', !!process.env.ELEVENLABS_API_KEY);