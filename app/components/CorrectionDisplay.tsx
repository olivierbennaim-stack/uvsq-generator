"use client";

import LogoOralPrepa from "./LogoOralPrepa";

interface CorrectionDisplayProps {
  correctionText: string;
  onPrint: () => void;
  onCopy: () => void;
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
        <h3 key={key++} className="font-bold text-[#4e3bf0] text-xs uppercase tracking-widest border-b border-[#4e3bf0] pb-1 mt-5 mb-3">
          {trimmed}
        </h3>
      );
      continue;
    }

    // Points of view "► Point de vue"
    if (trimmed.startsWith("►")) {
      elements.push(
        <p key={key++} className="font-semibold text-[#4e3bf0] text-sm mt-4 mb-1">
          {trimmed}
        </p>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("•")) {
      elements.push(
        <div key={key++} className="flex gap-2 text-sm text-[#1a1a2e] leading-relaxed">
          <span className="text-[#4e3bf0] mt-0.5 flex-shrink-0">•</span>
          <span>{trimmed.slice(1).trim()}</span>
        </div>
      );
      continue;
    }

    // Note méthodologique
    if (trimmed.startsWith("Note méthodologique")) {
      elements.push(
        <p key={key++} className="text-xs text-[#7060d0] italic mt-4 pt-3 border-t border-[#c5bffa] leading-relaxed">
          {trimmed}
        </p>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-sm text-[#1a1a2e] leading-relaxed">
        {trimmed}
      </p>
    );
  }

  return elements;
}

export default function CorrectionDisplay({ correctionText, onPrint, onCopy }: CorrectionDisplayProps) {
  return (
    <div className="w-full">
      <div className="bg-[#ebe9ff] border border-[#c5bffa] rounded-xl overflow-hidden">
        {/* Logo header */}
        <div className="px-6 sm:px-8 pt-6 pb-3 flex items-center justify-between">
          
          <LogoOralPrepa className="h-9" />
          <span className="text-xs uppercase tracking-widest text-[#7060d0] font-medium">
            Corrigé modèle
          </span>
        </div>
        <div className="mx-6 sm:mx-8 border-t border-[#4e3bf0] opacity-20 mb-0" />

        <div className="px-6 sm:px-8 py-6 sm:py-8 bg-white">
          <div className="space-y-1.5">
            {renderCorrectionText(correctionText)}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#ebe9ff] px-6 sm:px-8 py-3 text-center">
          <p className="text-[10px] text-[#7060d0] italic">
            © Oral Prépa – Toute reproduction ou diffusion, même partielle, est strictement interdite sans autorisation préalable
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={onPrint}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-[#4e3bf0] text-[#4e3bf0] rounded-lg font-medium text-sm hover:bg-[#4e3bf0]/5 transition-colors"
        >
          <span>📄</span>
          Exporter en PDF
        </button>
        <button
          onClick={onCopy}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium text-sm hover:border-[#4e3bf0]/40 hover:text-[#4e3bf0] transition-colors"
        >
          <span>📋</span>
          Copier
        </button>
      </div>
    </div>
  );
}
