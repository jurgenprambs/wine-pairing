import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  const profileData = [
    ['Body', pairing.wineProfile.body],
    ['Tannin', pairing.wineProfile.tannin],
    ['Acidity', pairing.wineProfile.acidity],
    ['Sweetness', pairing.wineProfile.sweetness],
    ['Fruit Character', pairing.wineProfile.fruitCharacter],
    ['Flavor Profile', pairing.wineProfile.flavorProfile],
    ['Oak Influence', pairing.wineProfile.oakInfluence],
    ['Umami / Minerality', pairing.wineProfile.umamiMinerality],
    ['Complexity', `${pairing.wineProfile.complexity} / 10`],
    ['Flavor Intensity', `${pairing.wineProfile.flavorIntensity} / 10`],
    ['Finish Length', pairing.wineProfile.finishLength],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: profileData,
    theme: 'plain',
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42, textColor: burgundy, font: 'times', fontSize: 9 },
      1: { textColor: charcoal, font: 'helvetica', fontSize: 9 },
    },
    styles: { cellPadding: 1.5 },
    didDrawPage: () => {},
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

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
