import jsPDF from 'jspdf';
import { Pairing } from './types';

export function exportPdf(pairing: Pairing): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const burgundy: [number, number, number] = [74, 21, 40];
  const gold: [number, number, number] = [201, 168, 76];
  const charcoal: [number, number, number] = [28, 28, 28];
  const cream: [number, number, number] = [245, 240, 232];

  // Background
  doc.setFillColor(...cream);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...burgundy);
  doc.text('TERROIR', pageWidth / 2, y + 10, { align: 'center' });
  y += 16;

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Wine info
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...charcoal);
  const wineTitle = `${pairing.wineInput.wineName} — ${pairing.wineInput.winery}, ${pairing.wineInput.vintage}`;
  doc.text(wineTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${new Date(pairing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Wine Profile section header
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...burgundy);
  doc.text('WINE PROFILE', margin, y);
  y += 6;

  const profileSections: [string, string][] = [
    ['Region & Terroir', pairing.wineProfile.regionTerroir],
    ['Important Notes', pairing.wineProfile.importantNotes],
    ['Flavors', pairing.wineProfile.flavors],
    ['Smelling & Visual Notes', pairing.wineProfile.smellingVisualNotes],
    ['How It Should Taste', pairing.wineProfile.howItShouldTaste],
  ];

  for (const [label, content] of profileSections) {
    if (y > 255) {
      doc.addPage();
      doc.setFillColor(...cream);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...burgundy);
    doc.text(label, margin, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    const plainContent = content.replace(/\*\*(.+?)\*\*/g, '$1');
    const lines = doc.splitTextToSize(plainContent, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.5 + 4;
  }

  y += 2;

  // Recipe section header
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...burgundy);
  doc.text('RECIPE', margin, y);
  y += 8;

  // Dish name
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...charcoal);
  doc.text(pairing.recipe.dishName, margin, y);
  y += 6;

  // Pairing rationale
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const rationaleLines = doc.splitTextToSize(pairing.recipe.pairingRationale, contentWidth);
  doc.text(rationaleLines, margin, y);
  y += rationaleLines.length * 4 + 4;

  if (pairing.recipe.ingredients && pairing.recipe.ingredients.length > 0) {
    if (y > 255) {
      doc.addPage();
      doc.setFillColor(...cream);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...burgundy);
    doc.text('Ingredients', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    for (const item of pairing.recipe.ingredients) {
      if (y > 275) {
        doc.addPage();
        doc.setFillColor(...cream);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        y = margin;
      }
      doc.setFillColor(...gold);
      doc.circle(margin + 1.5, y - 1, 0.6, 'F');
      const itemLines = doc.splitTextToSize(item, contentWidth - 5);
      doc.text(itemLines, margin + 5, y);
      y += itemLines.length * 3.5 + 1;
    }
    y += 3;
  }

  const sections: [string, string][] = [
    ['Protein & Main Component', pairing.recipe.proteinComponent],
    ['Supporting Components', pairing.recipe.supportingComponents],
    ['Sauce / Finishing', pairing.recipe.sauceFinishing],
    ['Cooking Instructions', pairing.recipe.cookingInstructions],
  ];

  for (const [label, content] of sections) {
    if (y > 260) {
      doc.addPage();
      doc.setFillColor(...cream);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...burgundy);
    doc.text(label, margin, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    const lines = doc.splitTextToSize(content, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.8 + 4;
  }

  // Estimated time
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.text(`Estimated Time: ${pairing.recipe.estimatedTime}`, margin, y);
  y += 6;

  // Key Pairing Elements
  if (pairing.recipe.keyPairingElements.length > 0) {
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...burgundy);
    doc.text('Key Pairing Elements', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    for (const el of pairing.recipe.keyPairingElements) {
      if (y > 280) {
        doc.addPage();
        doc.setFillColor(...cream);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        y = margin;
      }
      doc.setFillColor(...gold);
      doc.circle(margin + 1.5, y - 1, 0.8, 'F');
      doc.text(el, margin + 5, y);
      y += 4;
    }
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 10;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 3, pageWidth - margin, y - 3);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Generated by Terroir', pageWidth / 2, y, { align: 'center' });

  const slug = pairing.wineInput.wineName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const date = new Date(pairing.createdAt).toISOString().split('T')[0];
  doc.save(`terroir-${slug}-${date}.pdf`);
}
