import React from "react";

/**
 * Convertit le markdown inline en HTML string (pour l'export print).
 * Gère : **gras**, *italique*, __gras__, _italique_
 */
export function mdToHtml(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

/**
 * Convertit le markdown inline en React nodes (pour l'affichage).
 * Retourne un tableau de string | JSX.Element.
 */
export function mdToReact(text: string): React.ReactNode[] {
  // Regex qui capture les segments gras (**...**) et italiques (*...*)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part) || /^__(.+)__$/.test(part)) {
      const inner = part.replace(/^\*\*|\*\*$|^__|__$/g, "");
      return React.createElement("strong", { key: i }, inner);
    }
    if (/^\*(.+)\*$/.test(part) || /^_(.+)_$/.test(part)) {
      const inner = part.replace(/^\*|\*$|^_|_$/g, "");
      return React.createElement("em", { key: i }, inner);
    }
    return part;
  });
}

/**
 * Nettoie les marqueurs markdown de structure qui ne sont pas inline
 * (## titre, # titre) et retourne le texte propre + le type de bloc.
 */
export function normalizeBlock(raw: string): { text: string; isHeading: boolean } {
  const heading = raw.match(/^#{1,3}\s+(.+)$/);
  if (heading) return { text: heading[1].trim(), isHeading: true };
  return { text: raw, isHeading: false };
}
