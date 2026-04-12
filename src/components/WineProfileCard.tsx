'use client';

import { WineProfile } from '@/lib/types';

interface WineProfileCardProps {
  profile: WineProfile;
  /** When set, shows framing for floor staff / servers (no recipe flow) */
  variant?: 'default' | 'floorStaff';
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

function stripUrls(text: string): string {
  return text
    .replace(/\s*\(\[?https?:\/\/[^\s)]+\]?\)*/g, '')
    .replace(/\s*\[https?:\/\/[^\]]+\]/g, '')
    .replace(/\s*\[[^\]]*\]\(https?:\/\/[^\)]+\)/g, '')
    .replace(/\s*https?:\/\/\S+/g, '')
    .replace(/\s*\[\w+[\.\w]*\]/g, '')
    .trim();
}

function ProfileSection({
  icon,
  label,
  content,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
}) {
  const bullets = stripUrls(content)
    .split(/\n|(?=•)/)
    .map((s) => s.replace(/^[•\-]\s*/, '').trim())
    .filter((s) => s.length > 0);

  return (
    <div className="py-5 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-gold">{icon}</span>
        <h3 className="text-gold text-xs font-medium uppercase tracking-wider">
          {label}
        </h3>
      </div>
      <ul className="space-y-2 pl-7">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-cream/85 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/50 mt-1.5 shrink-0" />
            <span>{renderMarkdownInline(bullet)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WineProfileCard({
  profile,
  variant = 'default',
}: WineProfileCardProps) {
  return (
    <div className="fade-in-up">
      <div className="mb-4">
        <div className="section-label">01 / Wine Profile</div>
        {variant === 'floorStaff' && (
          <p className="text-cream/55 text-sm mt-2 max-w-xl leading-relaxed">
            Start with <strong className="text-cream/70 font-medium">At a glance</strong> for
            quick guest conversation — then the full profile below. No recipe;
            perfect for the floor.
          </p>
        )}
      </div>
      <div className="glass-panel p-6 md:p-8">
        {profile.patronHighlights && profile.patronHighlights.length > 0 && (
          <div className="mb-6 pb-6 border-b border-border">
            <div className="text-gold text-xs font-medium uppercase tracking-wider mb-3">
              At a glance — for your guest
            </div>
            <ul className="space-y-2.5">
              {profile.patronHighlights.map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-cream leading-relaxed"
                >
                  <span className="font-[family-name:var(--font-display)] text-gold font-semibold tabular-nums shrink-0 w-5">
                    {i + 1}.
                  </span>
                  <span>{renderMarkdownInline(stripUrls(line))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {profile.isInferred && (
          <div className="mb-5 pb-5 border-b border-border">
            <div className="flex items-start gap-2.5 bg-gold/5 border border-gold/20 rounded-lg p-3.5">
              <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-cream/60 text-xs leading-relaxed">
                We couldn&apos;t find this exact wine in our records, so our sommelier
                put together their best assessment based on the name, winery, and
                vintage you provided. Think of it as an educated pour.
              </p>
            </div>
          </div>
        )}
        <ProfileSection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Region & Terroir"
          content={profile.regionTerroir}
        />

        <ProfileSection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Important Notes"
          content={profile.importantNotes}
        />

        <ProfileSection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          label="Flavors"
          content={profile.flavors}
        />

        <ProfileSection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          label="Smelling & Visual Notes"
          content={profile.smellingVisualNotes}
        />

        <ProfileSection
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="How It Should Taste"
          content={profile.howItShouldTaste}
        />

      </div>
    </div>
  );
}
