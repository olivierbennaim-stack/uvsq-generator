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

const LINE_HEIGHT = 5.8;
const HEADER_H = 20;
const FOOTER_H = 12;

function collapseToBlocks(text: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      if (current.length > 0) { blocks.push(current.join(" ")); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join(" "));
  return blocks.filter((b) => b.length > 0);
}

function blockHeight(doc: jsPDF, text: string, width: number, fontSize: number): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, width);
  return lines.length * LINE_HEIGHT;
}

export function generatePDF(options: PDFOptions): jsPDF {
  const { title, subtitle, body } = options;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 20;
  const MR = 20;
  const CW = PW - ML - MR;
  const CONTENT_TOP = HEADER_H + 8;
  const CONTENT_BOTTOM = PH - FOOTER_H - 4;

  let y = CONTENT_TOP;

  const newPage = () => {
    addPageFooter(doc);
    doc.addPage();
    addPageHeader(doc, subtitle);
    y = CONTENT_TOP;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > CONTENT_BOTTOM) newPage();
  };

  addPageHeader(doc, subtitle);

  // ── Titre ──────────────────────────────────────────────
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...VIOLET);
  const titleLines = doc.splitTextToSize(title, CW);
  const titleH = titleLines.length * 7;
  ensureSpace(titleH + 8);
  doc.text(titleLines, ML, y);
  y += titleH + 1;

  // Trait sous titre
  doc.setDrawColor(...VIOLET);
  doc.setLineWidth(0.5);
  doc.line(ML, y, ML + CW, y);
  y += 7;

  // ── Corps ──────────────────────────────────────────────
  const blocks = collapseToBlocks(body);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const isQuestion    = /^\d+[\.\)]\s/.test(trimmed);
    const isSectionHdr  = /^QUESTION\s+\d+/i.test(trimmed);
    const isPointDeVue  = trimmed.startsWith("►");
    const isBullet      = trimmed.startsWith("•");
    const isNote        = trimmed.startsWith("Note méthodologique");
    const isSource      = /^(Slate|Le Monde|Libération|Le Figaro|L'Obs|La Croix|Mediapart|Les Échos|Courrier|Le Parisien|Philosophie|Sciences)/i.test(trimmed);

    // ── En-tête de section (QUESTION 1 —) ──
    if (isSectionHdr) {
      const h = blockHeight(doc, trimmed, CW, 9);
      ensureSpace(h + 10);
      if (y > CONTENT_TOP + 2) y += 4;
      doc.setFillColor(...VIOLET_LIGHT);
      doc.roundedRect(ML, y - 5, CW, h + 7, 2, 2, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...VIOLET);
      const lines = doc.splitTextToSize(trimmed, CW - 4);
      doc.text(lines, ML + 4, y);
      y += h + 6;
      continue;
    }

    // ── Source (italique violet) ──
    if (isSource) {
      const h = blockHeight(doc, trimmed, CW, 10);
      ensureSpace(h + 4);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...VIOLET_MID);
      const lines = doc.splitTextToSize(trimmed, CW);
      doc.text(lines, ML, y);
      y += h + 5;
      continue;
    }

    // ── Questions d'analyse (numérotées) ──
    if (isQuestion) {
      const h = blockHeight(doc, trimmed, CW, 10.5);
      ensureSpace(h + 4);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(trimmed, CW);
      doc.text(lines, ML, y);
      y += h + 3;
      continue;
    }

    // ── Point de vue ──
    if (isPointDeVue) {
      const h = blockHeight(doc, trimmed, CW, 10.5);
      ensureSpace(h + 4);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...VIOLET);
      const lines = doc.splitTextToSize(trimmed, CW);
      doc.text(lines, ML, y);
      y += h + 3;
      continue;
    }

    // ── Bullet ──
    if (isBullet) {
      const innerText = trimmed.slice(1).trim();
      const h = blockHeight(doc, innerText, CW - 6, 10.5);
      ensureSpace(h + 3);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...VIOLET);
      doc.text("•", ML, y);
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(innerText, CW - 6);
      doc.text(lines, ML + 5, y);
      y += h + 3;
      continue;
    }

    // ── Note méthodologique ──
    if (isNote) {
      const h = blockHeight(doc, trimmed, CW, 9);
      ensureSpace(h + 6);
      y += 2;
      doc.setDrawColor(...VIOLET_MID);
      doc.setLineWidth(0.2);
      doc.line(ML, y - 2, ML + CW, y - 2);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...VIOLET_MID);
      const lines = doc.splitTextToSize(trimmed, CW);
      doc.text(lines, ML, y + 2);
      y += h + 6;
      continue;
    }

    // ── Paragraphe normal ──
    const h = blockHeight(doc, trimmed, CW, 11);
    ensureSpace(h + 4);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(trimmed, CW);
    doc.text(lines, ML, y);
    y += h + 4;
  }

  addPageFooter(doc);
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
