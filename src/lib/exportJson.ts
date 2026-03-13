import { Pairing } from './types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function exportJson(pairing: Pairing): void {
  const slug = slugify(pairing.wineInput.wineName);
  const date = new Date(pairing.createdAt).toISOString().split('T')[0];
  const filename = `terroir-${slug}-${date}.json`;

  const blob = new Blob([JSON.stringify(pairing, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
