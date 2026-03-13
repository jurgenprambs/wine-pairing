import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WineProfile, UserPreferences, RecipeOutput } from '@/lib/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseRecipeText(text: string): RecipeOutput {
  const get = (start: string, ...ends: string[]): string => {
    const startIdx = text.indexOf(start);
    if (startIdx === -1) return '';
    const afterStart = startIdx + start.length;
    let endIdx = text.length;
    for (const end of ends) {
      const idx = text.indexOf(end, afterStart);
      if (idx !== -1 && idx < endIdx) endIdx = idx;
    }
    return text.slice(afterStart, endIdx).trim();
  };

  const dishName = get('DISH NAME', 'PAIRING RATIONALE');
  const pairingRationale = get('PAIRING RATIONALE', 'RECIPE');
  const proteinComponent = get(
    'Protein & Main Component',
    'Supporting Components'
  );
  const supportingComponents = get('Supporting Components', 'Sauce / Finishing');
  const sauceFinishing = get('Sauce / Finishing', 'COOKING INSTRUCTIONS');
  const cookingInstructions = get('COOKING INSTRUCTIONS', 'ESTIMATED TIME');
  const estimatedTime = get('ESTIMATED TIME', 'KEY PAIRING ELEMENTS');
  const keyPairingRaw = get('KEY PAIRING ELEMENTS');
  const keyPairingElements = keyPairingRaw
    .split('\n')
    .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter((line) => line.length > 0);

  return {
    dishName,
    pairingRationale,
    proteinComponent,
    supportingComponents,
    sauceFinishing,
    cookingInstructions,
    estimatedTime,
    keyPairingElements,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { wineProfile, preferences } = (await request.json()) as {
      wineProfile: WineProfile;
      preferences: UserPreferences;
    };

    if (!wineProfile || !preferences) {
      return NextResponse.json(
        { error: 'Missing wine profile or preferences' },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      instructions: `You are an expert chef and sommelier who designs elegant dishes that structurally complement a wine profile. Your goal is to create a restaurant-quality but home-cookable recipe based on wine characteristics and user constraints.`,
      input: `WINE PROFILE
Body: ${wineProfile.body}
Tannin: ${wineProfile.tannin}
Acidity: ${wineProfile.acidity}
Sweetness: ${wineProfile.sweetness}
Fruit Character: ${wineProfile.fruitCharacter}
Flavor Profile / Dominant Aromas: ${wineProfile.flavorProfile}
Oak Influence: ${wineProfile.oakInfluence}
Umami / Minerality: ${wineProfile.umamiMinerality}
Complexity (1–10): ${wineProfile.complexity}
Flavor Intensity (1–10): ${wineProfile.flavorIntensity}
Finish / Length: ${wineProfile.finishLength}

USER PREFERENCES
Cuisine Style: ${preferences.cuisineStyle}
Cooking Method: ${preferences.cookingMethod}
Season / Available Ingredients: ${preferences.season}
Effort Level: ${preferences.effortLevel}
Main Ingredient Category: ${preferences.mainIngredient}

INTERNAL PROCESS (DO NOT OUTPUT)

Step 1 — Determine Dish Structure
From the wine profile determine: ideal protein weight, cooking intensity, sauce richness, dish format (e.g., plated entrée, rustic stew, composed bowl, grilled dish).
Guidelines:
Full body + high tannin → fatty or braised dishes
Light body + high acid → delicate preparations
Medium body → roasted or pan-seared dishes
High acidity → supports richness
Low acidity → leaner foods

Step 2 — Build a Flavor Bridge
Use flavor profile and fruit character to choose ingredients that echo or contrast the wine.
Earthy → mushrooms, truffle, root vegetables
Floral → herbs, herb crusts
Spice → spice rubs, pepper crusts
Fruit → fruit reductions, savory fruit elements

Step 3 — Apply Technique Logic
Oak Influence → cooking style:
None/Subtle → lighter cooking
Moderate → roasting, caramelization
High → char, smoke, deep reduction

Step 4 — Set Dish Complexity
1–4 → 2–3 components
5–7 → 3–4 components
8–10 → 4–5 components

Step 5 — Ingredient Constraints
Respect Main Ingredient Category:
Red Meat: beef, lamb, pork, duck, game
White Meat: chicken, turkey, lean pork, rabbit
Vegetarian: vegetables, legumes, tofu, tempeh, eggs, dairy
If wine profile conflicts with the category, adapt creatively.

Step 6 — Seasonal Integration
Incorporate ingredients appropriate for the selected season.

Step 7 — Effort Level (STRICTLY ENFORCE THESE TIME LIMITS)
Low → quick cooking, minimal prep. TOTAL TIME MUST BE UNDER 30 MINUTES.
Medium → moderate techniques. TOTAL TIME MUST BE BETWEEN 30 AND 90 MINUTES.
High → long braises, layered techniques. TOTAL TIME MUST BE OVER 90 MINUTES.

FINAL OUTPUT
Return ONLY this exact format with these exact section headers:

DISH NAME
[A creative dish title]

PAIRING RATIONALE
[2–3 sentences explaining how wine characteristics influenced the dish]

RECIPE
Protein & Main Component
[Cut, cooking method, seasoning]

Supporting Components
[2–4 elements: vegetables, starches, garnishes]

Sauce / Finishing
[Sauce base, reduction style, finishing elements]

COOKING INSTRUCTIONS
[Clear numbered step-by-step instructions]

ESTIMATED TIME
[Total prep + cooking time]

KEY PAIRING ELEMENTS
• [wine attribute] → [dish element]
• [wine attribute] → [dish element]
• [wine attribute] → [dish element]
• [wine attribute] → [dish element]

STRICT RULES
• Produce a real, cookable recipe
• Respect cuisine style and cooking method
• Respect effort level timing: Low < 30 min, Medium 30–90 min, High > 90 min
• Integrate seasonal ingredients
• Maintain logical connections between wine traits and dish elements
• Do not mention the wine by name
• Do not recommend wine pairings`,
    });

    const text = response.output_text ?? '';
    const recipe = parseRecipeText(text);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Recipe generation error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate recipe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
