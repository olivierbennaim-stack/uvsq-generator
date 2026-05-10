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

// Ces patterns démarrent toujours un nouveau bloc même sans ligne vide avant eux
const BLOCK_STARTERS = /^(\d+[\.\)]\s|•|►|QUESTION\s+\d+|Note méthodologique)/i;

function collapseToBlocks(text: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim();

    if (line === "") {
      // Ligne vide = rupture de paragraphe
      if (current.length > 0) { blocks.push(current.join(" ")); current = []; }
    } else if (BLOCK_STARTERS.test(line) && current.length > 0) {
      // Début d'un item spécial => ferme le bloc courant, commence un nouveau
      blocks.push(current.join(" "));
      current = [line];
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

const isQuestion   = (s: string) => /^\d+[\.\)]\s/.test(s);
const isSectionHdr = (s: string) => /^QUESTION\s+\d+/i.test(s);
const isPointDeVue = (s: string) => s.startsWith("►");
const isBullet     = (s: string) => s.startsWith("•");
const isNote       = (s: string) => s.startsWith("Note méthodologique");
const isSource     = (s: string) =>
  /^(Slate|Le Monde|Libération|Le Figaro|L'Obs|La Croix|Mediapart|Les Échos|Courrier|Le Parisien|Philosophie|Sciences)/i.test(s);

export function generatePDF(options: PDFOptions): jsPDF {
  const { title, subtitle, body } = options;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 20;
  const CW = PW - ML * 2;
  const TOP = HEADER_H + 8;
  const BOT = PH - FOOTER_H - 4;

  let y = TOP;

  const newPage = () => {
    addPageFooter(doc);
    doc.addPage();
    addPageHeader(doc, subtitle);
    y = TOP;
  };

  const fit = (needed: number) => { if (y + needed > BOT) newPage(); };

  const write = (
    text: string,
    opts: { size: number; style?: string; color?: readonly [number, number, number]; indent?: number; gap?: number }
  ) => {
    const { size, style = "normal", color = DARK, indent = 0, gap = 4 } = opts;
    doc.setFont("Helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW - indent);
    const h = lines.length * LINE_HEIGHT;
    fit(h + gap);
    doc.text(lines, ML + indent, y);
    y += h + gap;
  };

  addPageHeader(doc, subtitle);

  // ── Titre ──
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(title, CW);
  const titleH = titleLines.length * 7.5;
  fit(titleH + 10);
  doc.text(titleLines, ML, y);
  y += titleH + 2;
  // Trait de séparation fin sous le titre
  doc.setDrawColor(...VIOLET);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + CW, y);
  y += 7;

  // ── Corps ──
  const blocks = collapseToBlocks(body);
  let inQuestionsSection = false;

  for (const block of blocks) {
    const t = block.trim();
    if (!t) continue;

    // Source (italique violet sous le titre)
    if (isSource(t)) {
      write(t, { size: 10, style: "italic", color: VIOLET_MID, gap: 6 });
      continue;
    }

    // En-tête de section QUESTION X — (corrigé)
    if (isSectionHdr(t)) {
      const h = blockHeight(doc, t, CW - 4, 9);
      fit(h + 12);
      y += 3;
      doc.setFillColor(...VIOLET_LIGHT);
      doc.roundedRect(ML, y - 5, CW, h + 7, 2, 2, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...VIOLET);
      doc.text(doc.splitTextToSize(t, CW - 4), ML + 4, y);
      y += h + 7;
      continue;
    }

    // Séparateur avant la section questions (sujet)
    if (isQuestion(t) && !inQuestionsSection) {
      inQuestionsSection = true;
      fit(14);
      y += 2;
      doc.setDrawColor(...VIOLET);
      doc.setLineWidth(0.3);
      doc.line(ML, y, ML + CW, y);
      y += 3;
      // Label "Questions d'analyse"
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...VIOLET);
      doc.text("QUESTIONS D'ANALYSE", ML, y);
      y += 6;
    }

    // Question numérotée
    if (isQuestion(t)) {
      write(t, { size: 10.5, style: "bold", color: DARK, gap: 3 });
      continue;
    }

    // Point de vue (►)
    if (isPointDeVue(t)) {
      write(t, { size: 10.5, style: "bold", color: VIOLET, gap: 3 });
      continue;
    }

    // Bullet (•)
    if (isBullet(t)) {
      const inner = t.slice(1).trim();
      const h = blockHeight(doc, inner, CW - 6, 10.5);
      fit(h + 3);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...VIOLET);
      doc.text("•", ML, y);
      doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(inner, CW - 6), ML + 5, y);
      y += h + 3;
      continue;
    }

    // Note méthodologique
    if (isNote(t)) {
      const h = blockHeight(doc, t, CW, 9);
      fit(h + 8);
      y += 3;
      doc.setDrawColor(...VIOLET_MID);
      doc.setLineWidth(0.2);
      doc.line(ML, y - 1, ML + CW, y - 1);
      y += 2;
      write(t, { size: 9, style: "italic", color: VIOLET_MID, gap: 4 });
      continue;
    }

    // Paragraphe normal du corps
    write(t, { size: 11, style: "normal", color: DARK, gap: 5 });
  }

  addPageFooter(doc);
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
