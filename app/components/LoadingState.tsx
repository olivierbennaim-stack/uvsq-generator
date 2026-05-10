"use client";

import { useEffect, useState } from "react";

const messages = [
  "Recherche de sources en cours…",
  "Analyse de l'actualité récente…",
  "Rédaction du texte…",
  "Mise en forme finale…",
];

export default function LoadingState({ label }: { label?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#4e3bf0]/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#4e3bf0] animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#4e3bf0] tracking-wide">
          {label ?? messages[msgIndex]}
        </p>
        <p className="text-xs text-gray-400 mt-1">Cela peut prendre 15 à 30 secondes</p>
      </div>
    </div>
  );
}
