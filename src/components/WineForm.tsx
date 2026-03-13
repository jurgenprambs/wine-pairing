'use client';

import { useState, useRef } from 'react';
import { WineInput, UserPreferences } from '@/lib/types';

interface WineFormProps {
  onSubmit: (wineInput: WineInput, preferences: UserPreferences) => void;
  isLoading: boolean;
}

const cuisineOptions = [
  'French',
  'Italian',
  'Mediterranean',
  'American',
  'Asian-Fusion',
  'Japanese',
  'Spanish',
  'Middle Eastern',
  'Modern European',
  'No Preference',
];

const cookingMethods = [
  'Roasting',
  'Braising',
  'Grilling',
  'Pan-Searing',
  'Steaming',
  'Slow Cooking',
  'Stir-Frying',
  'Raw/Cured',
  'No Preference',
];

const effortLevels: {
  value: UserPreferences['effortLevel'];
  label: string;
  desc: string;
}[] = [
  { value: 'Low', label: 'Low', desc: 'Quick & Simple' },
  { value: 'Medium', label: 'Medium', desc: 'Weekend Cook' },
  { value: 'High', label: 'High', desc: 'Fine Dining at Home' },
];

export default function WineForm({ onSubmit, isLoading }: WineFormProps) {
  const [wineName, setWineName] = useState('');
  const [winery, setWinery] = useState('');
  const [vintage, setVintage] = useState('');
  const [mainIngredient, setMainIngredient] =
    useState<UserPreferences['mainIngredient']>('Red Meat');
  const [cuisineStyle, setCuisineStyle] = useState('French');
  const [cookingMethod, setCookingMethod] = useState('No Preference');
  const [season, setSeason] = useState<UserPreferences['season']>('Winter');
  const [effortLevel, setEffortLevel] =
    useState<UserPreferences['effortLevel']>('Medium');
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wineName.trim() || !winery.trim() || !vintage.trim()) return;
    onSubmit(
      { wineName: wineName.trim(), winery: winery.trim(), vintage: vintage.trim() },
      { mainIngredient, cuisineStyle, cookingMethod, season, effortLevel }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 01 — The Wine */}
      <div className="glass-panel p-5 md:p-6">
        <div className="section-label mb-4">01 / The Wine</div>
        <div className="space-y-3">
          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Wine Name
            </label>
            <input
              type="text"
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              placeholder="e.g. Château Margaux"
              className="wine-input"
              required
            />
          </div>
          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Winery
            </label>
            <input
              type="text"
              value={winery}
              onChange={(e) => setWinery(e.target.value)}
              placeholder="e.g. Château Margaux Estate"
              className="wine-input"
              required
            />
          </div>
          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Vintage
            </label>
            <input
              type="number"
              value={vintage}
              onChange={(e) => setVintage(e.target.value)}
              placeholder="e.g. 2018"
              min={1900}
              max={2030}
              className="wine-input"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 02 — Your Table */}
      <div className="glass-panel p-5 md:p-6">
        <div className="section-label mb-4">02 / Your Table</div>
        <div className="space-y-3">
          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Main Ingredient
            </label>
            <select
              value={mainIngredient}
              onChange={(e) =>
                setMainIngredient(
                  e.target.value as UserPreferences['mainIngredient']
                )
              }
              className="wine-input"
            >
              <option value="Red Meat">Red Meat</option>
              <option value="White Meat">White Meat</option>
              <option value="Vegetarian">Vegetarian</option>
            </select>
          </div>

          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Cuisine Style
            </label>
            <select
              value={cuisineStyle}
              onChange={(e) => setCuisineStyle(e.target.value)}
              className="wine-input"
            >
              {cuisineOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Cooking Method
            </label>
            <select
              value={cookingMethod}
              onChange={(e) => setCookingMethod(e.target.value)}
              className="wine-input"
            >
              {cookingMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-cream/70 text-xs mb-1.5 font-medium">
              Season
            </label>
            <select
              value={season}
              onChange={(e) =>
                setSeason(e.target.value as UserPreferences['season'])
              }
              className="wine-input"
            >
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Autumn">Autumn</option>
              <option value="Winter">Winter</option>
            </select>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-cream/70 text-xs font-medium">
                Effort Level
              </label>
              <button
                type="button"
                className="w-4 h-4 rounded-full border border-cream/30 text-cream/40 text-[10px] flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                onClick={() => setShowTooltip(!showTooltip)}
                onBlur={() => setTimeout(() => setShowTooltip(false), 150)}
              >
                ?
              </button>
              {showTooltip && (
                <div
                  ref={tooltipRef}
                  className="absolute left-20 top-0 z-10 glass-panel p-3 text-xs text-cream/80 w-56 space-y-1.5"
                >
                  <div>
                    <strong className="text-gold">Low:</strong> Quick cooking,
                    minimal prep, under 30 min
                  </div>
                  <div>
                    <strong className="text-gold">Medium:</strong> Moderate
                    techniques, 30–90 min
                  </div>
                  <div>
                    <strong className="text-gold">High:</strong> Long braises,
                    layered techniques, 90+ min
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {effortLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`effort-pill flex-1 ${
                    effortLevel === level.value ? 'active' : ''
                  }`}
                  onClick={() => setEffortLevel(level.value)}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {level.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isLoading || !wineName.trim() || !winery.trim() || !vintage.trim()
        }
        className="btn-gold"
      >
        {isLoading ? 'Generating…' : 'Generate My Pairing →'}
      </button>
    </form>
  );
}
