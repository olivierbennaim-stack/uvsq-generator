import jsPDF from "jspdf";

interface PDFOptions {
  title: string;
  subtitle: string;
  body: string;
}

export function generatePDF(options: PDFOptions): jsPDF {
  const { title, subtitle, body } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 25;
  const marginBottom = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = marginTop;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("UVSQ — PASS/LAS — Épreuve d'analyse de texte", pageWidth / 2, y, {
    align: "center",
  });
  y += 5;
  doc.setFontSize(9);
  doc.text(subtitle, pageWidth / 2, y, { align: "center" });
  y += 3;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, marginLeft, y);
  y += titleLines.length * 6 + 6;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

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
    const isQuestion = /^\d+[\.\)]/.test(paragraph.trim());

    if (isQuestion) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
    } else {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
    }

    const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
    const blockHeight = lines.length * 5.5;

    if (y + blockHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }

    doc.text(lines, marginLeft, y);
    y += blockHeight + 4;
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
