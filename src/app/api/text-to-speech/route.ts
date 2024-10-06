import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log('API Key available:', !!process.env.ELEVENLABS_API_KEY);

  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    console.log('Sending request to ElevenLabs API...');
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
    );

    console.log('ElevenLabs API Response Status:', response.status);
    console.log('ElevenLabs API Response Headers:', response.headers);

    const audioBuffer = Buffer.from(response.data);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Error converting text to speech:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data.toString('utf8'));
      return NextResponse.json({ 
        error: 'Failed to convert text to speech', 
        details: error.response?.data.toString('utf8') 
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        error: 'Failed to convert text to speech', 
        details: (error as Error).message 
      }, { status: 500 });
    }
  }
}