import jsPDF from "jspdf";

interface PDFOptions {
  title: string;
  subtitle: string;
  body: string;
}

// Couleurs Oral Prépa
const VIOLET = [78, 59, 240] as const;       // #4e3bf0
const VIOLET_LIGHT = [235, 233, 255] as const; // #ebe9ff
const VIOLET_MID = [112, 96, 208] as const;   // #7060d0
const DARK = [26, 26, 46] as const;           // #1a1a2e

function addPageHeader(doc: jsPDF, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Bande de fond violette
  doc.setFillColor(...VIOLET_LIGHT);
  doc.rect(0, 0, pageWidth, 18, "F");

  // Texte "Oral Prépa" à gauche
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...VIOLET);
  doc.text("Oral Prépa", 20, 12);

  // Séparateur "·" et UVSQ PASS/LAS au centre
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...VIOLET_MID);
  doc.text(`UVSQ – PASS/LAS  ·  ${subtitle}`, pageWidth / 2, 12, { align: "center" });

  // Ligne séparatrice violette
  doc.setDrawColor(...VIOLET);
  doc.setLineWidth(0.4);
  doc.line(0, 18, pageWidth, 18);
}

function addPageFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(...VIOLET_LIGHT);
  doc.rect(0, pageHeight - 10, pageWidth, 10, "F");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...VIOLET_MID);
  doc.text(
    "© Oral Prépa – Toute reproduction ou diffusion, même partielle, est strictement interdite sans autorisation préalable",
    pageWidth / 2,
    pageHeight - 4,
    { align: "center" }
  );
}

export function generatePDF(options: PDFOptions): jsPDF {
  const { title, subtitle, body } = options;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 26; // after header band (18mm) + gap
  const marginBottom = 18; // before footer band
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = marginTop;

  addPageHeader(doc, subtitle);

  // Title
  y = 26;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...VIOLET);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, marginLeft, y);
  y += titleLines.length * 6.5 + 2;

  // Underline under title
  doc.setDrawColor(...VIOLET);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, marginLeft + Math.min(contentWidth, title.length * 2.8), y);
  y += 6;

  // Body
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);

  // Regrouper les lignes consécutives non vides en vrais paragraphes
  const rawBlocks: string[] = [];
  let current: string[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      if (current.length > 0) { rawBlocks.push(current.join(" ")); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) rawBlocks.push(current.join(" "));
  const paragraphs = rawBlocks.filter((p) => p.length > 0);

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    const isQuestion = /^\d+[\.\)]/.test(trimmed);
    const isSectionHeader = /^QUESTION\s+\d+/i.test(trimmed);
    const isBullet = trimmed.startsWith("•") || trimmed.startsWith("►");
    const isNote = trimmed.startsWith("Note méthodologique");

    if (isSectionHeader) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...VIOLET);
    } else if (isQuestion) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...DARK);
    } else if (isBullet) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...DARK);
    } else if (isNote) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...VIOLET_MID);
    } else {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...DARK);
    }

    const lines = doc.splitTextToSize(trimmed, contentWidth);
    const blockHeight = lines.length * 5.5;
    const extraSpacing = isSectionHeader ? 4 : 0;

    if (y + blockHeight + extraSpacing > pageHeight - marginBottom) {
      addPageFooter(doc);
      doc.addPage();
      addPageHeader(doc, subtitle);
      y = marginTop;
    }

    if (isSectionHeader && y > marginTop + 2) y += 3;
    doc.text(lines, marginLeft, y);
    y += blockHeight + (isSectionHeader ? 5 : 4);

    // Trait sous les en-têtes de section
    if (isSectionHeader) {
      doc.setDrawColor(...VIOLET);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, y - 2, marginLeft + contentWidth, y - 2);
      y += 1;
    }
  }

  addPageFooter(doc);
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
