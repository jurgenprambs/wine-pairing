'use client';

import { RecipeOutput, Pairing } from '@/lib/types';
import ExportButtons from './ExportButtons';

interface RecipeCardProps {
  recipe: RecipeOutput;
  pairing: Pairing;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function renderMarkdownInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-semibold text-cream">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {renderMarkdownInline(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function RecipeSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="text-gold-muted text-xs font-medium uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-cream/90 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function RecipeCard({
  recipe,
  pairing,
  onRegenerate,
  isRegenerating,
}: RecipeCardProps) {
  return (
    <div className="fade-in-up">
      <div className="section-label mb-4">02 / Recipe</div>
      <div className="glass-panel-strong p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-semibold text-cream mb-3">
          {recipe.dishName}
        </h2>

        <p className="font-[family-name:var(--font-display)] italic text-cream-dim text-base leading-relaxed mb-6">
          {recipe.pairingRationale}
        </p>

        <div className="border-t border-border pt-5 space-y-0">
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <RecipeSection label="Ingredients">
              <ul className="space-y-1.5">
                {recipe.ingredients.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-1.5 shrink-0" />
                    <span>{renderMarkdownInline(item)}</span>
                  </li>
                ))}
              </ul>
            </RecipeSection>
          )}

          <RecipeSection label="Protein & Main Component">
            <MarkdownText text={recipe.proteinComponent} />
          </RecipeSection>

          <RecipeSection label="Supporting Components">
            <MarkdownText text={recipe.supportingComponents} />
          </RecipeSection>

          <RecipeSection label="Sauce / Finishing">
            <MarkdownText text={recipe.sauceFinishing} />
          </RecipeSection>

          <RecipeSection label="Cooking Instructions">
            <MarkdownText text={recipe.cookingInstructions} />
          </RecipeSection>
        </div>

        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-5">
          <svg
            className="w-4 h-4 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-gold text-sm font-medium">
            {recipe.estimatedTime}
          </span>
        </div>

        {recipe.keyPairingElements.length > 0 && (
          <div className="mb-6">
            <div className="text-gold-muted text-xs font-medium uppercase tracking-wider mb-3">
              Key Pairing Elements
            </div>
            <ul className="space-y-2">
              {recipe.keyPairingElements.map((el, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  <span className="text-cream/85">{el}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-border pt-5 flex flex-wrap items-center gap-3">
          <ExportButtons pairing={pairing} />
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="btn-outline-cream flex items-center gap-2 ml-auto"
          >
            {isRegenerating ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Regenerating…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Regenerate Recipe
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
