import { NextRequest, NextResponse } from "next/server";
import { callAnthropic } from "@/app/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();

    if (!theme || typeof theme !== "string") {
      return NextResponse.json({ error: "Thème manquant" }, { status: 400 });
    }

    const system = `Tu es un éditorialiste français chevronné. Tu rédiges des textes d'opinion pour la presse nationale.

On te donne un thème. Tu dois rédiger un texte argumentatif d'environ 450-550 mots, en français, qui prend clairement position.

Utilise ta capacité de recherche web pour t'appuyer sur des faits, chiffres et événements réels.

STYLE IMPÉRATIF :
- Ton éditorialiste engagé, assumé, parfois provocateur
- Tu PRENDS POSITION clairement (pas un article neutre)
- Registre soutenu mais accessible, phrases parfois courtes et percutantes
- Formules rhétoriques fortes, ironie maîtrisée permise
- Tu anticipes les objections et tu les réfutes ou nuances
- Inclus au minimum : un chiffre/statistique crédible, un témoignage inventé réaliste (prénom + âge), une référence géographique précise, une comparaison avec un autre pays

STRUCTURE OBLIGATOIRE :
Ligne 1 : TITRE — affirmation tranchée ou question provocante
Ligne 2 : SOURCE — "[Média], [date entre sept. 2025 et mai 2026]"
  Médias possibles : Slate, Le Monde, Libération, Le Figaro, L'Obs, La Croix, Mediapart, Les Échos, Courrier International, Le Parisien, Philosophie Magazine, Sciences et Avenir
Ligne 3 : ligne vide
Lignes suivantes : 5 à 7 paragraphes argumentatifs
Puis ligne vide
Puis EXACTEMENT ces 4 lignes (ne modifie PAS le texte de ces questions) :
1. Pouvez-vous identifier le message principal ?
2. Sur quels arguments principaux s'appuie l'auteur ? Citez-en au moins deux.
3. À quels contre-arguments pourriez-vous penser ?
4. Quelle est votre position sur ce sujet ? Motivez votre réponse.

Réponds UNIQUEMENT avec le texte complet. Rien d'autre.`;

    const subject = await callAnthropic({
      system,
      messages: [{ role: "user", content: `Le thème est : ${theme}` }],
      useWebSearch: true,
      maxTokens: 4096,
    });

    return NextResponse.json({ subject });
  } catch (error) {
    console.error("generate-subject error:", error);
    return NextResponse.json(
      { error: "Impossible de générer le sujet. Réessayez." },
      { status: 500 }
    );
  }
}
