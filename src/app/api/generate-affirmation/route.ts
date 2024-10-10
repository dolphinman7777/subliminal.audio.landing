import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add the new constants and functions here
const gratitudePhrases: string[] = [
    "I am grateful for",
    "I appreciate",
    "I feel blessed by",
    "I am thankful for",
    "I welcome",
    "I celebrate"
];

const completionPhrases: string[] = [
    "as it is already happening.",
    "because it's unfolding perfectly.",
    "as I experience it fully now.",
    "because it has come to fruition.",
    "since it's part of my reality now."
];

const emotionalTones: string[] = [
    "I embrace",
    "I welcome with open arms",
    "I confidently manifest",
    "I celebrate",
    "I feel empowered by",
    "I find peace in"
];

const reframeInput = (inputWord: string): string => {
    const negativeToPositive: { [key: string]: string } = {
        "stress": "peace and calm",
        "problem": "solution",
        "lack": "abundance",
        "fear": "confidence",
        "doubt": "trust"
        // Add more mappings as needed
    };
    return negativeToPositive[inputWord.toLowerCase()] || inputWord;
};

const generateAffirmation = (userInput: string): string => {
    const gratitude = gratitudePhrases[Math.floor(Math.random() * gratitudePhrases.length)];
    const completion = completionPhrases[Math.floor(Math.random() * completionPhrases.length)];
    const tone = emotionalTones[Math.floor(Math.random() * emotionalTones.length)];
    const inputWord = reframeInput(userInput);

    const affirmationOptions: string[] = [
        `${gratitude} the ${inputWord} ${completion}`,
        `${tone} the ${inputWord} and feel ${completion}`,
        `${gratitude} how the ${inputWord} is unfolding naturally ${completion}`,
        `${gratitude} the journey towards ${inputWord}, and know ${completion}`,
        `As I ${tone} ${inputWord}, I know ${completion}`
    ];

    return affirmationOptions[Math.floor(Math.random() * affirmationOptions.length)];
};

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // Generate affirmations using the new rules
    const affirmations = prompt.split(',').map(word => generateAffirmation(word.trim()));

    // Use OpenAI to enhance and expand on the generated affirmations
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that enhances and expands on given affirmations. Keep the core meaning intact but make them more inspiring and varied." },
        { role: "user", content: `Enhance and expand on these affirmations, providing at least 10 in total: ${affirmations.join('. ')}` }
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
    const enhancedAffirmations = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '')) // Remove hyphens, bullets, or asterisks at the start
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove any numbering at the start

    return NextResponse.json({ affirmations: enhancedAffirmations });
  } catch (error: any) {
    console.error('Error generating affirmations:', error.response ? error.response.data : error.message);
    return NextResponse.json({ error: 'Failed to generate affirmations', details: error.message }, { status: 500 });
  }
}