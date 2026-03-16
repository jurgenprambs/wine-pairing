export interface WineInput {
  wineName: string;
  winery: string;
  vintage: string;
}

export interface UserPreferences {
  mainIngredient: 'Red Meat' | 'White Meat' | 'Vegetarian';
  cuisineStyle: string;
  cookingMethod: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  effortLevel: 'Low' | 'Medium' | 'High';
}

export interface WineProfile {
  regionTerroir: string;
  importantNotes: string;
  flavors: string;
  smellingVisualNotes: string;
  howItShouldTaste: string;
  isInferred?: boolean;
}

export interface IngredientGroup {
  group: string;
  items: string[];
}

export interface RecipeOutput {
  dishName: string;
  pairingRationale: string;
  ingredients: IngredientGroup[];
  proteinComponent: string;
  supportingComponents: string;
  sauceFinishing: string;
  cookingInstructions: string;
  estimatedTime: string;
  keyPairingElements: string[];
}

export interface Pairing {
  id: string;
  createdAt: string;
  wineInput: WineInput;
  preferences: UserPreferences;
  wineProfile: WineProfile;
  recipe: RecipeOutput;
}
