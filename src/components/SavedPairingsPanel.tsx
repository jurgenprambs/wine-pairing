'use client';

import { useEffect, useState } from 'react';
import { Pairing } from '@/lib/types';
import { getAllPairings, deletePairing, clearAllPairings } from '@/lib/storage';

interface SavedPairingsPanelProps {
  refreshKey: number;
  onLoad: (pairing: Pairing) => void;
}

export default function SavedPairingsPanel({
  refreshKey,
  onLoad,
}: SavedPairingsPanelProps) {
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setPairings(getAllPairings());
  }, [refreshKey]);

  const handleDelete = (id: string) => {
    deletePairing(id);
    setPairings(getAllPairings());
  };

  const handleClearAll = () => {
    if (confirmClear) {
      clearAllPairings();
      setPairings([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between glass-panel p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <span className="text-cream text-sm font-medium">
            Saved Pairings
          </span>
          {pairings.length > 0 && (
            <span className="bg-gold/20 text-gold text-xs font-medium px-2 py-0.5 rounded-full">
              {pairings.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-cream/50 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-1 glass-panel overflow-hidden">
          {pairings.length === 0 ? (
            <div className="p-6 text-center text-cream/40 text-sm">
              No saved pairings yet.
              <br />
              <span className="text-xs">
                Generate your first pairing above.
              </span>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex justify-end">
                <button
                  onClick={handleClearAll}
                  className="text-xs text-cream/40 hover:text-error transition-colors"
                >
                  {confirmClear ? 'Confirm clear all?' : 'Clear All'}
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {pairings.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-cream text-sm font-medium truncate">
                          {p.wineInput.wineName}
                          {p.wineInput.vintage ? (
                            <span className="text-cream/40 font-normal">
                              {' '}
                              {p.wineInput.vintage}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-cream-dim text-xs mt-0.5 truncate font-[family-name:var(--font-display)] italic">
                          {p.recipe.dishName}
                        </div>
                        <div className="text-cream/30 text-[10px] mt-1">
                          {new Date(p.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onLoad(p)}
                          className="text-xs text-gold/70 hover:text-gold px-2 py-1 rounded hover:bg-gold/10 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-cream/30 hover:text-error p-1 rounded hover:bg-error-surface transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
