import { NextRequest, NextResponse } from "next/server";
import { callAnthropic } from "@/app/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { subjectText } = await req.json();

    if (!subjectText || typeof subjectText !== "string") {
      return NextResponse.json({ error: "Texte du sujet manquant" }, { status: 400 });
    }

    const system = `Tu es un professeur de méthodologie universitaire à l'UVSQ, spécialisé dans la préparation PASS/LAS.

On te donne un texte argumentatif d'examen. Rédige un corrigé modèle complet.

FORMAT EXACT À RESPECTER :

QUESTION 1 — Message principal
[4-6 phrases identifiant la thèse de l'auteur avec précision. Pas juste reformuler le titre — analyser la position défendue dans l'ensemble du texte.]

QUESTION 2 — Arguments principaux de l'auteur
[Au moins 3 arguments :]
• Argument 1 : [Nom] — [2-3 phrases : paraphraser le passage, expliquer la logique]
• Argument 2 : [Nom] — [2-3 phrases]
• Argument 3 : [Nom] — [2-3 phrases]

QUESTION 3 — Contre-arguments possibles
[3-4 contre-arguments solides :]
• [Contre-argument 1 : 2-3 phrases]
• [Contre-argument 2 : 2-3 phrases]
• [Contre-argument 3 : 2-3 phrases]
• [Contre-argument 4 (optionnel)]

QUESTION 4 — Position personnelle (exemples de réponses)

► Point de vue « Pour » (en accord avec l'auteur) :
[5-6 phrases : réponse personnelle argumentée qui soutient la thèse avec des arguments propres, pas une reprise du texte.]

► Point de vue « Contre » (en désaccord avec l'auteur) :
[5-6 phrases : réponse personnelle argumentée qui s'oppose à la thèse avec des arguments propres.]

Note méthodologique : Le correcteur évalue la qualité de l'argumentation, pas l'opinion. Une copie « pour » bien argumentée vaut autant qu'une copie « contre ». L'essentiel : (1) formuler une thèse claire, (2) développer au moins 2 arguments personnels, (3) illustrer par des exemples concrets, (4) nuancer sa position.

Réponds UNIQUEMENT avec le corrigé structuré. Rien d'autre.`;

    const correction = await callAnthropic({
      system,
      messages: [
        {
          role: "user",
          content: `Voici le texte du sujet :\n\n---\n${subjectText}\n---\n\nRédige le corrigé modèle.`,
        },
      ],
      useWebSearch: false,
      maxTokens: 4096,
    });

    return NextResponse.json({ correction });
  } catch (error) {
    console.error("generate-correction error:", error);
    return NextResponse.json(
      { error: "Impossible de générer le corrigé. Réessayez." },
      { status: 500 }
    );
  }
}
