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
  body: string;
  tannin: string;
  acidity: string;
  sweetness: string;
  fruitCharacter: string;
  flavorProfile: string;
  oakInfluence: string;
  umamiMinerality: string;
  complexity: number;
  flavorIntensity: number;
  finishLength: string;
}

export interface RecipeOutput {
  dishName: string;
  pairingRationale: string;
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
