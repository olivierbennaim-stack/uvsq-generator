// Couleurs Oral Prépa
const VIOLET = "#4e3bf0";
const VIOLET_LIGHT = "#ebe9ff";
const VIOLET_MID = "#7060d0";
const DARK = "#1a1a2e";

const BLOCK_STARTERS = /^(\d+[\.\)]\s|•|►|QUESTION\s+\d+|Note méthodologique)/i;

function collapseToBlocks(text: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      if (current.length > 0) { blocks.push(current.join(" ")); current = []; }
    } else if (BLOCK_STARTERS.test(line) && current.length > 0) {
      blocks.push(current.join(" "));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join(" "));
  return blocks.filter((b) => b.length > 0);
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function mdHtml(s: string): string {
  return escHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

function stripHeading(s: string): { text: string; isHeading: boolean } {
  const m = s.match(/^#{1,3}\s+(.+)$/);
  if (m) return { text: m[1].trim(), isHeading: true };
  return { text: s, isHeading: false };
}

function blocksToHtml(blocks: string[], isCorrection: boolean): string {
  const lines: string[] = [];
  let questionsStarted = false;

  for (const block of blocks) {
    const raw = block.trim();
    if (!raw) continue;

    const { text: t, isHeading } = stripHeading(raw);

    const isQ      = /^\d+[\.\)]\s/.test(t);
    const isSec    = isHeading || /^QUESTION\s+\d+/i.test(t);
    const isPdV    = t.startsWith("►");
    const isBullet = t.startsWith("•") || t.startsWith("- ");
    const isNote   = t.startsWith("Note méthodologique");
    const isSource = /^(Slate|Le Monde|Libération|Le Figaro|L'Obs|La Croix|Mediapart|Les Échos|Courrier|Le Parisien|Philosophie|Sciences)/i.test(t);

    if (isSec) {
      lines.push(`<div class="section-hdr">${mdHtml(t)}</div>`);
      continue;
    }

    if (isSource) {
      lines.push(`<p class="source">${mdHtml(t)}</p>`);
      continue;
    }

    if (isQ && !isCorrection && !questionsStarted) {
      questionsStarted = true;
      lines.push(`<div class="questions-separator"><span>Questions d'analyse</span></div>`);
    }

    if (isQ) {
      lines.push(`<p class="question">${mdHtml(t)}</p>`);
      continue;
    }

    if (isPdV) {
      lines.push(`<p class="point-de-vue">${mdHtml(t)}</p>`);
      continue;
    }

    if (isBullet) {
      const inner = t.startsWith("•") ? t.slice(1).trim() : t.slice(2).trim();
      lines.push(`<div class="bullet"><span class="bullet-dot">•</span><span>${mdHtml(inner)}</span></div>`);
      continue;
    }

    if (isNote) {
      lines.push(`<p class="note">${mdHtml(t)}</p>`);
      continue;
    }

    lines.push(`<p class="body">${mdHtml(t)}</p>`);
  }

  return lines.join("\n");
}

function buildHtml(title: string, subtitle: string, body: string, isCorrection: boolean): string {
  const blocks = collapseToBlocks(body);
  const content = blocksToHtml(blocks, isCorrection);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escHtml(title)}</title>
<style>
  @page { margin: 18mm 20mm 18mm 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 11pt;
    color: ${DARK};
    background: white;
    line-height: 1.65;
  }
  header {
    background: ${VIOLET_LIGHT};
    padding: 10px 0 8px;
    margin: -18mm -20mm 0;
    border-bottom: 1.5px solid ${VIOLET};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20mm;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .logo-text {
    font-size: 13pt;
    font-weight: bold;
    color: ${VIOLET};
    letter-spacing: -0.02em;
  }
  .header-right {
    font-size: 8pt;
    color: ${VIOLET_MID};
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .title {
    font-size: 15pt;
    font-weight: bold;
    color: ${DARK};
    margin: 18px 0 4px;
    line-height: 1.3;
  }
  .title-rule {
    border: none;
    border-top: 1px solid ${VIOLET};
    margin: 0 0 8px;
  }
  p.source {
    font-style: italic;
    color: ${VIOLET_MID};
    font-size: 10pt;
    margin-bottom: 14px;
  }
  p.body {
    margin-bottom: 10px;
    text-align: justify;
  }
  .questions-separator {
    border-top: 1px solid ${VIOLET};
    margin: 16px 0 8px;
    padding-top: 6px;
  }
  .questions-separator span {
    font-size: 7.5pt;
    font-weight: bold;
    color: ${VIOLET};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  p.question {
    font-weight: bold;
    font-size: 10.5pt;
    margin-bottom: 5px;
    color: ${DARK};
  }
  .section-hdr {
    background: ${VIOLET_LIGHT};
    color: ${VIOLET};
    font-weight: bold;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 5px 8px;
    border-radius: 4px;
    margin: 12px 0 6px;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  p.point-de-vue {
    font-weight: bold;
    color: ${VIOLET};
    font-size: 10.5pt;
    margin: 10px 0 4px;
  }
  .bullet {
    display: flex;
    gap: 6px;
    margin-bottom: 5px;
    font-size: 10.5pt;
  }
  .bullet-dot { color: ${VIOLET}; flex-shrink: 0; }
  p.note {
    font-size: 8.5pt;
    font-style: italic;
    color: ${VIOLET_MID};
    border-top: 1px solid ${VIOLET_MID};
    margin-top: 12px;
    padding-top: 6px;
  }
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${VIOLET_LIGHT};
    color: ${VIOLET_MID};
    font-size: 7pt;
    font-style: italic;
    text-align: center;
    padding: 4px 20mm;
    border-top: 1px solid ${VIOLET};
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  @media print {
    .no-print { display: none; }
    body { padding-bottom: 20mm; }
  }
  .print-btn {
    position: fixed;
    top: 16px;
    right: 16px;
    background: ${VIOLET};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 2px 8px rgba(78,59,240,0.3);
    z-index: 9999;
  }
  .print-btn:hover { background: #3d2cd0; }
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">📄 Enregistrer en PDF</button>

<header>
  <div class="logo-text">Oral Prépa</div>
  <div class="header-right">UVSQ – PASS/LAS &nbsp;·&nbsp; ${escHtml(subtitle)}</div>
</header>

<h1 class="title">${escHtml(title)}</h1>
<hr class="title-rule">

${content}

<footer>
  © Oral Prépa – Toute reproduction ou diffusion, même partielle, est strictement interdite sans autorisation préalable
</footer>

</body>
</html>`;
}

export function openPrintWindow(title: string, subtitle: string, body: string, isCorrection = false): void {
  const html = buildHtml(title, subtitle, body, isCorrection);
  const win = window.open("", "_blank");
  if (!win) { alert("Autorisez les popups pour cette page."); return; }
  win.document.write(html);
  win.document.close();
}

export function copyAsRichText(title: string, body: string): void {
  const blocks = collapseToBlocks(body);
  const content = blocksToHtml(blocks, false);
  const html = `<h2 style="color:${VIOLET};font-family:sans-serif">${escHtml(title)}</h2>${content}`;

  const blob = new Blob([html], { type: "text/html" });
  const item = new ClipboardItem({ "text/html": blob });
  navigator.clipboard.write([item]).catch(() => {
    // Fallback : texte brut
    navigator.clipboard.writeText(title + "\n\n" + body);
  });
}
