'use client';

import { useState, useCallback } from 'react';
import {
  WineInput,
  UserPreferences,
  WineProfile,
  RecipeOutput,
  Pairing,
} from '@/lib/types';
import { savePairing } from '@/lib/storage';
import WineForm from '@/components/WineForm';
import WineProfileCard from '@/components/WineProfileCard';
import RecipeCard from '@/components/RecipeCard';
import SavedPairingsPanel from '@/components/SavedPairingsPanel';

type LoadingPhase = null | 'profile' | 'recipe';

function WineGlassSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 4h32l-4 36c-1 8-6 14-12 16v24h12v4H20v-4h12V56c-6-2-11-8-12-16L16 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 8h28l-2.5 22c-.8 6-4.5 11-9.5 13-5-2-8.7-7-9.5-13L22 8z"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  );
}

function LoadingSkeleton({ phase }: { phase: LoadingPhase }) {
  return (
    <div className="fade-in-up space-y-6">
      <div className="flex flex-col items-center justify-center py-12">
        <WineGlassSvg className="w-12 h-12 text-gold pulse-glow mb-4" />
        <p className="text-cream/60 text-sm font-[family-name:var(--font-display)] italic">
          {phase === 'profile'
            ? 'Consulting the cellar…'
            : 'Building your recipe…'}
        </p>
      </div>
      <div className="glass-panel p-6 space-y-4">
        <div className="shimmer h-4 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="shimmer h-3 rounded w-2/3" />
              <div className="shimmer h-4 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="fade-in-up glass-panel border-error/30 p-6 text-center">
      <svg
        className="w-10 h-10 text-error mx-auto mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-cream text-sm font-medium mb-1">
        Something went wrong. Please try again.
      </p>
      <p className="text-cream/40 text-xs mb-4">{message}</p>
      <button onClick={onRetry} className="btn-outline-gold">
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <WineGlassSvg className="w-20 h-20 text-gold/20 mb-6" />
      <h3 className="font-[family-name:var(--font-display)] text-2xl text-cream/30 mb-2">
        Your pairing awaits
      </h3>
      <p className="text-cream/20 text-sm max-w-xs">
        Fill in the details about your wine and preferences to generate a
        perfectly matched recipe.
      </p>
    </div>
  );
}

export default function Home() {
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
  const [error, setError] = useState<string | null>(null);
  const [wineProfile, setWineProfile] = useState<WineProfile | null>(null);
  const [recipe, setRecipe] = useState<RecipeOutput | null>(null);
  const [currentPairing, setCurrentPairing] = useState<Pairing | null>(null);
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [lastWineInput, setLastWineInput] = useState<WineInput | null>(null);
  const [lastPreferences, setLastPreferences] =
    useState<UserPreferences | null>(null);

  const generateRecipe = useCallback(
    async (profile: WineProfile, prefs: UserPreferences, wine: WineInput) => {
      setLoadingPhase('recipe');
      setRecipe(null);
      setError(null);

      try {
        const res = await fetch('/api/recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wineProfile: profile, preferences: prefs }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Recipe API error: ${res.status}`);
        }
        const recipeData: RecipeOutput = await res.json();
        setRecipe(recipeData);

        const pairing: Pairing = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          wineInput: wine,
          preferences: prefs,
          wineProfile: profile,
          recipe: recipeData,
        };
        savePairing(pairing);
        setCurrentPairing(pairing);
        setSavedRefreshKey((k) => k + 1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate recipe'
        );
      } finally {
        setLoadingPhase(null);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (wineInput: WineInput, preferences: UserPreferences) => {
      setLoadingPhase('profile');
      setError(null);
      setWineProfile(null);
      setRecipe(null);
      setCurrentPairing(null);
      setLastWineInput(wineInput);
      setLastPreferences(preferences);

      try {
        const res = await fetch('/api/wine-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wineInput }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || `Wine profile API error: ${res.status}`
          );
        }
        const profile: WineProfile = await res.json();
        setWineProfile(profile);
        await generateRecipe(profile, preferences, wineInput);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate wine profile'
        );
        setLoadingPhase(null);
      }
    },
    [generateRecipe]
  );

  const handleRegenerate = useCallback(async () => {
    if (!wineProfile || !lastPreferences || !lastWineInput) return;
    setIsRegenerating(true);
    await generateRecipe(wineProfile, lastPreferences, lastWineInput);
    setIsRegenerating(false);
  }, [wineProfile, lastPreferences, lastWineInput, generateRecipe]);

  const handleLoadPairing = useCallback((pairing: Pairing) => {
    setWineProfile(pairing.wineProfile);
    setRecipe(pairing.recipe);
    setCurrentPairing(pairing);
    setLastWineInput(pairing.wineInput);
    setLastPreferences(pairing.preferences);
    setError(null);
    setLoadingPhase(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRetry = useCallback(() => {
    if (lastWineInput && lastPreferences) {
      handleSubmit(lastWineInput, lastPreferences);
    }
  }, [lastWineInput, lastPreferences, handleSubmit]);

  const isLoading = loadingPhase !== null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="pt-10 pb-6 md:pt-16 md:pb-10 px-6 text-center">
        <h1
          className="font-[family-name:var(--font-display)] font-light tracking-[0.06em] text-cream"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          TERROIR
        </h1>
        <p className="font-[family-name:var(--font-display)] text-cream-dim italic text-lg md:text-xl mt-1">
          From bottle to table — recipes shaped by your wine.
        </p>
        <div className="w-32 h-px bg-gold mx-auto mt-5" />
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="w-full lg:w-[40%] lg:min-w-[380px] shrink-0">
            <WineForm onSubmit={handleSubmit} isLoading={isLoading} />
            <SavedPairingsPanel
              refreshKey={savedRefreshKey}
              onLoad={handleLoadPairing}
            />
          </div>

          {/* Right column */}
          <div className="w-full lg:w-[60%] space-y-8">
            {error && <ErrorCard message={error} onRetry={handleRetry} />}

            {loadingPhase && <LoadingSkeleton phase={loadingPhase} />}

            {!error && !loadingPhase && wineProfile && (
              <WineProfileCard profile={wineProfile} />
            )}

            {!error && !loadingPhase && recipe && currentPairing && (
              <RecipeCard
                recipe={recipe}
                pairing={currentPairing}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
              />
            )}

            {!error && !loadingPhase && !wineProfile && !recipe && (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-border">
        <p className="text-cream/20 text-xs font-[family-name:var(--font-display)]">
          Terroir — AI-powered wine &amp; recipe pairing
        </p>
      </footer>
    </div>
  );
}
