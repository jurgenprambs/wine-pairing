import jsPDF from 'jspdf';
import { Pairing } from './types';

function sanitize(text: string): string {
  let s = text;
  // Strip bold/italic markdown — remove all ** pairs
  while (s.includes('**')) {
    s = s.replace('**', '');
  }
  // Strip URLs and citations
  s = s
    .replace(/\s*\(\[?https?:\/\/[^\s)]+\]?\)*/g, '')
    .replace(/\s*\[https?:\/\/[^\]]+\]/g, '')
    .replace(/\s*\[[^\]]*\]\(https?:\/\/[^\)]+\)/g, '')
    .replace(/\s*https?:\/\/\S+/g, '')
    .replace(/\s*\[\w+[\.\w]*\]/g, '');
  // Replace unicode arrows and special chars that break jsPDF Times font
  s = s.replace(/[\u2192\u2190\u2191\u2193\u279C\u27A1\u21D2\uFFEB]/g, '>');
  s = s.replace(/\u2014/g, '--');
  s = s.replace(/\u2013/g, '-');
  s = s.replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/[\u201C\u201D]/g, '"');
  s = s.replace(/\u2026/g, '...');
  s = s.replace(/\u00B7/g, '-');
  // Replace bullet char used inline
  s = s.replace(/\u2022/g, '-');
  return s.trim();
}

function splitBullets(text: string): string[] {
  return sanitize(text)
    .split(/\n|(?=\u2022)|(?=•)/)
    .map((s) => s.replace(/^[•\-]\s*/, '').trim())
    .filter((s) => s.length > 0);
}

export function exportPdf(pairing: Pairing): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  const center = pageWidth / 2;
  let y = 0;

  const burgundy: [number, number, number] = [74, 21, 40];
  const gold: [number, number, number] = [201, 168, 76];
  const charcoal: [number, number, number] = [38, 38, 38];
  const cream: [number, number, number] = [250, 247, 242];
  const muted: [number, number, number] = [130, 120, 110];

  function paintBg() {
    doc.setFillColor(...cream);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  function newPage() {
    doc.addPage();
    paintBg();
    y = margin;
  }

  function checkSpace(needed: number) {
    if (y + needed > pageHeight - 18) {
      newPage();
    }
  }

  function thinRule(width = 24) {
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.15);
    doc.line(center - width / 2, y, center + width / 2, y);
    y += 6;
  }

  function sectionLabel(title: string) {
    checkSpace(12);
    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...gold);
    doc.text(title.toUpperCase(), margin, y);
    y += 6;
  }

  function wrappedText(
    text: string,
    opts?: { italic?: boolean; fontSize?: number; color?: [number, number, number] }
  ) {
    const size = opts?.fontSize ?? 8.5;
    const style = opts?.italic ? 'italic' : 'normal';
    const color = opts?.color ?? charcoal;
    doc.setFont('times', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lineHeight = size * 0.48;
    const lines: string[] = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkSpace(lineHeight + 1);
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  function bulletItems(items: string[], indent = 0) {
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    const lineHeight = 4;
    const left = margin + indent;
    const bulletWidth = contentWidth - indent - 6;
    for (const item of items) {
      const clean = sanitize(item);
      const wrapped: string[] = doc.splitTextToSize(clean, bulletWidth);
      checkSpace(wrapped.length * lineHeight + 2);
      for (let j = 0; j < wrapped.length; j++) {
        if (j === 0) {
          doc.setFillColor(...gold);
          doc.circle(left + 1, y - 1.2, 0.5, 'F');
          doc.text(wrapped[j], left + 4, y);
        } else {
          doc.text(wrapped[j], left + 4, y);
        }
        y += lineHeight;
      }
    }
  }

  // ── Page 1: Wine Profile ──

  paintBg();
  y = margin + 5;

  // Title
  doc.setFont('times', 'normal');
  doc.setFontSize(26);
  doc.setTextColor(...burgundy);
  doc.text('T E R R O I R', center, y, { align: 'center' });
  y += 7;

  thinRule();

  // Wine name
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(...charcoal);
  const titleLines: string[] = doc.splitTextToSize(pairing.wineInput.wineName, contentWidth);
  for (const line of titleLines) {
    doc.text(line, center, y, { align: 'center' });
    y += 6;
  }

  // Winery + optional vintage
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  const vintageLine = pairing.wineInput.vintage?.trim()
    ? `${pairing.wineInput.winery}  ·  ${pairing.wineInput.vintage.trim()}`
    : pairing.wineInput.winery;
  doc.text(vintageLine, center, y, { align: 'center' });
  y += 10;

  thinRule();
  y += 2;

  const highlights = pairing.wineProfile.patronHighlights;
  if (highlights && highlights.length > 0) {
    sectionLabel('At a glance — for your guest');
    bulletItems(highlights.map((h) => sanitize(h)));
    y += 5;
  }

  // Wine profile sections
  const profileSections: [string, string][] = [
    ['Region & Terroir', pairing.wineProfile.regionTerroir],
    ['Important Notes', pairing.wineProfile.importantNotes],
    ['Flavors', pairing.wineProfile.flavors],
    ['Smelling & Visual Notes', pairing.wineProfile.smellingVisualNotes],
    ['How It Should Taste', pairing.wineProfile.howItShouldTaste],
  ];

  for (const [label, content] of profileSections) {
    sectionLabel(label);
    const bullets = splitBullets(content);
    if (bullets.length > 1) {
      bulletItems(bullets);
    } else {
      wrappedText(sanitize(content).replace(/^[•\-]\s*/, '').trim());
    }
    y += 5;
  }

  // ── Page 2: Recipe ──

  newPage();
  y += 3;

  // Header
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...gold);
  doc.text('THE PAIRING', center, y, { align: 'center' });
  y += 8;

  // Dish name
  doc.setFont('times', 'italic');
  doc.setFontSize(15);
  doc.setTextColor(...burgundy);
  const dishLines: string[] = doc.splitTextToSize(pairing.recipe.dishName, contentWidth);
  for (const line of dishLines) {
    doc.text(line, center, y, { align: 'center' });
    y += 6.5;
  }
  y += 2;

  thinRule();

  // Pairing rationale
  wrappedText(sanitize(pairing.recipe.pairingRationale), { italic: true, fontSize: 8, color: muted });
  y += 7;

  // Grouped ingredients
  if (pairing.recipe.ingredients && pairing.recipe.ingredients.length > 0) {
    sectionLabel('Ingredients');
    for (const group of pairing.recipe.ingredients) {
      checkSpace(12);
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...charcoal);
      doc.text(sanitize(group.group), margin + 2, y);
      y += 4;
      bulletItems(group.items.map(sanitize), 2);
      y += 2;
    }
    y += 3;
  }

  // Recipe sections
  const recipeSections: [string, string][] = [
    ['Protein & Main Component', pairing.recipe.proteinComponent],
    ['Supporting Components', pairing.recipe.supportingComponents],
    ['Sauce & Finishing', pairing.recipe.sauceFinishing],
  ];

  for (const [label, content] of recipeSections) {
    sectionLabel(label);
    wrappedText(sanitize(content));
    y += 5;
  }

  // Method
  sectionLabel('Method');
  const instrClean = sanitize(pairing.recipe.cookingInstructions);
  const steps = instrClean
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (steps.length > 1) {
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    for (const step of steps) {
      const wrapped: string[] = doc.splitTextToSize(step, contentWidth - 2);
      checkSpace(wrapped.length * 4 + 2);
      for (const line of wrapped) {
        doc.text(line, margin, y);
        y += 4;
      }
      y += 0.5;
    }
  } else {
    wrappedText(instrClean);
  }
  y += 4;

  // Estimated time
  checkSpace(10);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(pairing.recipe.estimatedTime, margin, y);
  y += 7;

  thinRule();

  // Key pairing elements
  if (pairing.recipe.keyPairingElements.length > 0) {
    sectionLabel('Wine & Dish Harmony');
    bulletItems(pairing.recipe.keyPairingElements);
    y += 4;
  }

  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.15);
  doc.line(center - 18, footerY - 2, center + 18, footerY - 2);
  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text('Generated by Terroir', center, footerY, { align: 'center' });
  const dateStr = new Date(pairing.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(dateStr, center, footerY + 3.5, { align: 'center' });

  const slug = pairing.wineInput.wineName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const date = new Date(pairing.createdAt).toISOString().split('T')[0];
  doc.save(`terroir-${slug}-${date}.pdf`);
}
