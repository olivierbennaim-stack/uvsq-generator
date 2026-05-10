"use client";

interface SubjectDisplayProps {
  subjectText: string;
  onGenerateCorrection: () => void;
  onDownloadPDF: () => void;
  correctionLoading: boolean;
}

/**
 * Regroupe les lignes consécutives non vides en un seul paragraphe.
 * Seules les lignes vides créent une vraie rupture de paragraphe.
 */
function collapseBlocks(text: string): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));

  return paragraphs.filter((p) => p.length > 0);
}

function parseSubject(text: string) {
  const lines = text.split("\n");
  let i = 0;

  // First non-empty line = title
  while (i < lines.length && !lines[i].trim()) i++;
  const title = i < lines.length ? lines[i].trim() : "";
  i++;

  // Second non-empty line = source
  while (i < lines.length && !lines[i].trim()) i++;
  const source = i < lines.length ? lines[i].trim() : "";
  i++;

  // Remaining text
  const remaining = lines.slice(i).join("\n");

  // Detect where questions start (line starting with "1.")
  const qRegex = /(?:^|\n)(1[\.\)]\s+Pouvez-vous)/m;
  const qMatch = remaining.match(qRegex);

  let bodyText = remaining;
  let questionsText = "";

  if (qMatch && qMatch.index !== undefined) {
    const offset = qMatch[0].startsWith("\n") ? qMatch.index + 1 : qMatch.index;
    bodyText = remaining.slice(0, offset);
    questionsText = remaining.slice(offset);
  }

  // Body: regrouper les lignes consécutives en vrais paragraphes
  const bodyLines = collapseBlocks(bodyText);

  // Questions: chaque question numérotée = un élément
  const questions = questionsText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return { title, source, bodyLines, questions };
}

export default function SubjectDisplay({
  subjectText,
  onGenerateCorrection,
  onDownloadPDF,
  correctionLoading,
}: SubjectDisplayProps) {
  const { title, source, bodyLines, questions } = parseSubject(subjectText);

  return (
    <div className="w-full">
      {/* A4-style paper */}
      <div className="bg-[#ebe9ff] shadow-lg rounded-xl overflow-hidden border border-[#c5bffa]">
        {/* Logo header */}
        <div className="bg-[#ebe9ff] px-8 sm:px-12 pt-7 pb-3 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-oral-prepa.svg" alt="Oral Prépa" className="h-9" />
          <span className="text-xs uppercase tracking-widest text-[#7060d0] font-medium">
            UVSQ — PASS/LAS
          </span>
        </div>

        {/* Separator */}
        <div className="mx-8 sm:mx-12 border-t border-[#4e3bf0] opacity-20" />

        <div className="px-8 sm:px-12 py-7 sm:py-9 bg-white">
          {/* Title */}
          {title && (
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a2e] leading-tight mb-2">
              {title}
            </h2>
          )}

          {/* Source */}
          {source && (
            <p className="text-sm text-[#7060d0] italic mb-7">{source}</p>
          )}

          {/* Body */}
          <div className="space-y-4 mb-8">
            {bodyLines.map((para, i) => (
              <p key={i} className="font-serif text-[15px] leading-[1.8] text-[#1a1a2e]">
                {para}
              </p>
            ))}
          </div>

          {/* Questions */}
          {questions.length > 0 && (
            <div className="border-t border-[#4e3bf0]/20 pt-6">
              <p className="text-xs uppercase tracking-widest text-[#4e3bf0] font-bold mb-4">
                Questions d&apos;analyse
              </p>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <p key={i} className="text-sm font-medium text-[#1a1a2e] leading-relaxed">
                    {q}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer brand */}
        <div className="bg-[#ebe9ff] px-8 sm:px-12 py-3 text-center">
          <p className="text-[10px] text-[#7060d0] italic">
            © Oral Prépa – Toute reproduction ou diffusion, même partielle, est strictement interdite sans autorisation préalable
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <button
          onClick={onDownloadPDF}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-[#4e3bf0] text-[#4e3bf0] rounded-lg font-medium text-sm hover:bg-[#4e3bf0]/5 transition-colors"
        >
          <span>📄</span>
          Télécharger le sujet (PDF)
        </button>
        <button
          onClick={onGenerateCorrection}
          disabled={correctionLoading}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#4e3bf0] text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-[#3d2cd0] transition-colors"
        >
          <span>✏️</span>
          {correctionLoading ? "Génération en cours…" : "Générer le corrigé"}
        </button>
      </div>
    </div>
  );
}
