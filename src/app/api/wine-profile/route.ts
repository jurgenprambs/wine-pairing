import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WineInput } from '@/lib/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { wineInput } = (await request.json()) as { wineInput: WineInput };

    if (!wineInput?.wineName || !wineInput?.winery || !wineInput?.vintage) {
      return NextResponse.json(
        { error: 'Missing required wine input fields' },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      instructions: `You are a master sommelier. Given a wine name, winery, and vintage, generate a structured wine profile. Use web search to find accurate information about the wine. Return ONLY a valid JSON object with no markdown, no code fences, no explanation — raw JSON only.`,
      input: `Generate a wine profile for: ${wineInput.wineName} by ${wineInput.winery}, vintage ${wineInput.vintage}.

Return this exact JSON structure:
{
  "body": "",
  "tannin": "",
  "acidity": "",
  "sweetness": "",
  "fruitCharacter": "",
  "flavorProfile": "",
  "oakInfluence": "",
  "umamiMinerality": "",
  "complexity": 0,
  "flavorIntensity": 0,
  "finishLength": ""
}

Rules:
- String fields: descriptive prose (e.g. "Full-bodied with velvety texture, rich and enveloping")
- complexity and flavorIntensity: integers between 1 and 10
- If the wine is unknown or fictional, make a reasonable inference based on the name and region`,
    });

    let text = response.output_text ?? '';
    text = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

    const profile = JSON.parse(text);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Wine profile error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate wine profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
