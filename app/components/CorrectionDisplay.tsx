"use client";

interface CorrectionDisplayProps {
  correctionText: string;
  onDownloadPDF: () => void;
}

function renderCorrectionText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key++} className="h-3" />);
      continue;
    }

    // Section headers like "QUESTION 1 —"
    if (/^QUESTION\s+\d+/i.test(trimmed)) {
      elements.push(
        <h3 key={key++} className="font-semibold text-[#1a365d] text-sm uppercase tracking-wide mt-4 mb-2">
          {trimmed}
        </h3>
      );
      continue;
    }

    // Points of view "► Point de vue"
    if (trimmed.startsWith("►")) {
      elements.push(
        <p key={key++} className="font-semibold text-gray-700 text-sm mt-3 mb-1">
          {trimmed}
        </p>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("•")) {
      elements.push(
        <div key={key++} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
          <span className="text-[#1a365d] mt-0.5 flex-shrink-0">•</span>
          <span>{trimmed.slice(1).trim()}</span>
        </div>
      );
      continue;
    }

    // Note méthodologique
    if (trimmed.startsWith("Note méthodologique")) {
      elements.push(
        <p key={key++} className="text-xs text-gray-500 italic mt-4 pt-3 border-t border-gray-100 leading-relaxed">
          {trimmed}
        </p>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-sm text-gray-700 leading-relaxed">
        {trimmed}
      </p>
    );
  }

  return elements;
}

export default function CorrectionDisplay({ correctionText, onDownloadPDF }: CorrectionDisplayProps) {
  return (
    <div className="w-full">
      <div className="bg-[#f0f4f9] border border-[#1a365d]/15 rounded-lg overflow-hidden">
        <div className="px-6 sm:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#1a365d] rounded-full"></div>
            <h3 className="font-semibold text-[#1a365d] text-base">Corrigé modèle</h3>
          </div>

          <div className="space-y-1.5">
            {renderCorrectionText(correctionText)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={onDownloadPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-[#1a365d] text-[#1a365d] rounded-lg font-medium text-sm hover:bg-[#1a365d]/5 transition-colors"
        >
          <span>📄</span>
          Télécharger le corrigé (PDF)
        </button>
      </div>
    </div>
  );
}
