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
      model: 'gpt-5.4',
      tools: [{ type: 'web_search_preview' }],
      instructions: `You are a sommelier with 15 years of experience with particular aptitude in explaining notes in wine and how they should be understood by the customer.

Please explain this wine as you would to someone really interested in learning about the key notes and flavors.

Use web search to find accurate, specific information about this wine, its producer, and its region.

Return ONLY a valid JSON object with no markdown, no code fences, no explanation — raw JSON only.`,
      input: `Generate a concise wine profile for: ${wineInput.wineName} by ${wineInput.winery}, vintage ${wineInput.vintage}.

Return this exact JSON structure:
{
  "regionTerroir": "",
  "importantNotes": "",
  "flavors": "",
  "smellingVisualNotes": "",
  "howItShouldTaste": "",
  "isInferred": false
}

Field instructions — BE SUCCINCT. Use bullet points (•) where it makes sense. Aim for 2 bullet points or sentences per field, maximum 4.

1. "regionTerroir" — Region, terroir, and what it's known for. Keep it tight: where, what soil/climate, and how that shapes the wine. 2–4 bullet points.

2. "importantNotes" — Key context about this wine or producer: winemaking philosophy, natural/organic/biodynamic, fermentation methods, anything distinctive. 2–4 bullet points.

3. "flavors" — The key flavors: grape character, fruit notes, secondary/tertiary notes, how acidity and structure keep things balanced. Conversational sommelier tone. 2–4 bullet points.

4. "smellingVisualNotes" — What you'll experience on the nose and visually. Specific aroma notes, color, clarity. 2–4 bullet points.

5. "howItShouldTaste" — Palate experience: texture, mouthfeel, tannins, acidity, finish. Guide the reader as if they're sipping now. 2–4 bullet points.

Rules:
- Be specific and detailed, not generic — but CONCISE
- Use bullet points (•) to structure each field
- Target 2 bullets per field, max 4 — no long paragraphs
- Write as a passionate sommelier speaking to a curious customer
- If you cannot find specific information about this exact wine after searching, set "isInferred" to true and make your best educated inferences based on the grape variety, region, winery style, and vintage. Still produce a complete, high-quality profile.
- If you DID find the wine, set "isInferred" to false
- NEVER include URLs, citations, source links, or references like [decanter.com] or (https://...) in the output. Only include your own prose.`,
    });

    let text = response.output_text ?? '';
    text = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

    const profile = JSON.parse(text);

    // Strip any URLs/citations the model may have included
    for (const key of Object.keys(profile)) {
      if (typeof profile[key] === 'string') {
        profile[key] = profile[key]
          .replace(/\s*\(\[?https?:\/\/[^\s)]+\]?\)*/g, '')
          .replace(/\s*\[https?:\/\/[^\]]+\]/g, '')
          .replace(/\s*\[[^\]]*\]\(https?:\/\/[^\)]+\)/g, '')
          .replace(/\s*https?:\/\/\S+/g, '')
          .replace(/\s*\[\w+[\.\w]*\]/g, '')
          .trim();
      }
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Wine profile error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate wine profile';

    const isQuotaError =
      message.includes('insufficient_quota') ||
      message.includes('rate_limit') ||
      message.includes('billing') ||
      message.includes('exceeded') ||
      message.includes('429');

    return NextResponse.json(
      { error: message, isQuotaError },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}
