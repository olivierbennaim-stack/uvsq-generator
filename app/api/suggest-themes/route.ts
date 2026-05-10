import { NextRequest, NextResponse } from "next/server";
import { callAnthropic } from "@/app/lib/anthropic";
import { parseJsonSafe } from "@/app/lib/parse-json";

export async function POST(req: NextRequest) {
  try {
    const { alreadySuggested = [] } = await req.json();

    const system = `Tu es un concepteur de sujets d'examen pour l'épreuve d'analyse de texte de l'UVSQ en PASS/LAS.

Propose exactement 3 thèmes d'actualité (année scolaire 2025-2026, sept. 2025 à mai 2026) pour un texte argumentatif d'examen.

Utilise ta capacité de recherche web pour trouver des sujets récents et réels qui font débat.

Contraintes :
- Chaque thème doit FAIRE DÉBAT (arguments solides pour et contre)
- Priorité santé, médecine, bioéthique, corps, système de soins
- Si hors santé : accessible à des étudiants en médecine 1ère année
- Varier les catégories (santé, société, techno, environnement, éthique) — pas 2 thèmes de la même catégorie
- NE PAS proposer ces thèmes déjà suggérés : ${alreadySuggested.length > 0 ? alreadySuggested.join(" ; ") : "(aucun pour l'instant)"}

Exemples du bon niveau de sujet (pour calibrage, NE PAS les réutiliser tels quels) :
- Interdire les réseaux sociaux aux moins de 15 ans
- Imposer des wagons sans enfants dans les trains
- Rendre obligatoire le don d'organes sans possibilité de refus

Réponds UNIQUEMENT en JSON, sans backticks markdown, sans texte avant/après :
[
  {
    "title": "Titre formulé comme question ou affirmation clivante",
    "hook": "2 phrases max : pourquoi ça fait débat cette année"
  },
  {
    "title": "...",
    "hook": "..."
  },
  {
    "title": "...",
    "hook": "..."
  }
]`;

    const raw = await callAnthropic({
      system,
      messages: [{ role: "user", content: "Propose 3 thèmes." }],
      useWebSearch: true,
      maxTokens: 1024,
    });

    const themes = parseJsonSafe<Array<{ title: string; hook: string }>>(raw);

    if (!Array.isArray(themes) || themes.length < 1) {
      throw new Error("Invalid themes format");
    }

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("suggest-themes error:", error);
    return NextResponse.json(
      { error: "Impossible de générer les thèmes. Réessayez." },
      { status: 500 }
    );
  }
}
