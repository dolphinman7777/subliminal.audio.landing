import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates positive affirmations." },
        { role: "user", content: `Generate multiple positive affirmations based on the following themes: ${prompt}. Provide at least 10 affirmations. Make them varied and inspiring. Do not number or use hyphens before the affirmations.` }
      ],
      max_tokens: 500,
      n: 1,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Split the content into lines and clean up each affirmation
    const affirmations = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '')) // Remove hyphens, bullets, or asterisks at the start
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove any numbering at the start

    return NextResponse.json({ affirmations });
  } catch (error: any) {
    console.error('Error generating affirmations:', error.response ? error.response.data : error.message);
    return NextResponse.json({ error: 'Failed to generate affirmations', details: error.message }, { status: 500 });
  }
}