import { NextRequest, NextResponse } from "next/server";
import { callAnthropic } from "@/app/lib/anthropic";
import { parseJsonSafe } from "@/app/lib/parse-json";

export async function POST(req: NextRequest) {
  try {
    const { alreadySuggested = [] } = await req.json();

    const system = `Tu es un concepteur de sujets d'examen pour l'épreuve d'analyse de texte de l'UVSQ en PASS/LAS.

Propose exactement 3 thèmes d'actualité (année scolaire 2025-2026, sept. 2025 à mai 2026) pour un texte argumentatif d'examen.

Utilise ta capacité de recherche web pour trouver des sujets récents et réels qui font débat.

RÉPARTITION OBLIGATOIRE des 3 thèmes — respecte cet ordre exactement :
1. Thème HORS SANTÉ (société, éducation, justice, technologie, environnement, urbanisme...)
2. Thème HORS SANTÉ (catégorie différente du thème 1)
3. Thème SANTÉ / MÉDECINE / BIOÉTHIQUE (médecine, corps, système de soins, éthique médicale...)

Contraintes communes :
- Chaque thème doit FAIRE DÉBAT (arguments solides pour et contre)
- Tous accessibles à des étudiants en médecine 1ère année
- NE PAS proposer ces thèmes déjà suggérés : ${alreadySuggested.length > 0 ? alreadySuggested.join(" ; ") : "(aucun pour l'instant)"}

Exemples calibrants (NE PAS réutiliser tels quels) :
- Hors santé : "Interdire les réseaux sociaux aux moins de 15 ans", "Imposer des wagons sans enfants dans les trains", "Demander une contribution de 32€ aux détenus"
- Santé : "Rendre obligatoire le don d'organes sans possibilité de refus", "Autoriser l'euthanasie pour les mineurs atteints de maladies incurables", "Supprimer le numerus clausus en médecine"

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
