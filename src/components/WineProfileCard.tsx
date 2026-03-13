'use client';

import { WineProfile } from '@/lib/types';

interface WineProfileCardProps {
  profile: WineProfile;
}

function BarIndicator({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="flex items-center gap-3">
      <div className="bar-track flex-1">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gold text-sm font-medium w-8 text-right font-[family-name:var(--font-display)]">
        {value}/{max}
      </span>
    </div>
  );
}

const fieldLabels: { key: keyof WineProfile; label: string }[] = [
  { key: 'body', label: 'Body' },
  { key: 'tannin', label: 'Tannin' },
  { key: 'acidity', label: 'Acidity' },
  { key: 'sweetness', label: 'Sweetness' },
  { key: 'fruitCharacter', label: 'Fruit Character' },
  { key: 'flavorProfile', label: 'Flavor Profile' },
  { key: 'oakInfluence', label: 'Oak Influence' },
  { key: 'umamiMinerality', label: 'Umami / Minerality' },
  { key: 'finishLength', label: 'Finish / Length' },
];

export default function WineProfileCard({ profile }: WineProfileCardProps) {
  return (
    <div className="fade-in-up">
      <div className="section-label mb-4">01 / Wine Profile</div>
      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {fieldLabels.map(({ key, label }) => (
            <div key={key}>
              <div className="text-gold-muted text-xs font-medium uppercase tracking-wider mb-1">
                {label}
              </div>
              <div className="text-cream text-sm leading-relaxed">
                {String(profile[key])}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-gold-muted text-xs font-medium uppercase tracking-wider mb-2">
                Complexity
              </div>
              <BarIndicator value={profile.complexity} />
            </div>
            <div>
              <div className="text-gold-muted text-xs font-medium uppercase tracking-wider mb-2">
                Flavor Intensity
              </div>
              <BarIndicator value={profile.flavorIntensity} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
