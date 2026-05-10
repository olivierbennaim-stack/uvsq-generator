"use client";

import { useState, useCallback } from "react";
import LogoOralPrepa from "./components/LogoOralPrepa";
import ThemeSuggestions from "./components/ThemeSuggestions";
import CustomTopicInput from "./components/CustomTopicInput";
import SubjectDisplay from "./components/SubjectDisplay";
import CorrectionDisplay from "./components/CorrectionDisplay";
import LoadingState from "./components/LoadingState";

type Theme = { title: string; hook: string };
type AppState = "home" | "themes" | "generating" | "subject";

const MAX_RETRIES = 1;
const RETRY_DELAY = 2000;

async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(fetcher, retries - 1);
    }
    throw err;
  }
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("home");
  const [activeTab, setActiveTab] = useState<"suggest" | "custom">("suggest");

  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [themesLoading, setThemesLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [subjectText, setSubjectText] = useState("");
  const [correctionText, setCorrectionText] = useState("");
  const [correctionLoading, setCorrectionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const getAlreadySuggested = (): string[] => {
    try {
      const stored = sessionStorage.getItem("suggestedThemes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addToSuggested = (newThemes: Theme[]) => {
    try {
      const existing = getAlreadySuggested();
      const titles = newThemes.map((t) => t.title);
      const merged = Array.from(new Set([...existing, ...titles]));
      sessionStorage.setItem("suggestedThemes", JSON.stringify(merged));
    } catch {
      // sessionStorage not available
    }
  };

  const loadThemes = useCallback(async () => {
    setThemesLoading(true);
    setError(null);
    setSelectedTheme(null);
    try {
      const already = getAlreadySuggested();
      const data = await fetchWithRetry(async () => {
        const res = await fetch("/api/suggest-themes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alreadySuggested: already }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Erreur API");
        return res.json();
      });
      setThemes(data.themes);
      addToSuggested(data.themes);
      setAppState("themes");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Le service est temporairement indisponible. Veuillez réessayer dans quelques instants."
      );
    } finally {
      setThemesLoading(false);
    }
  }, []);

  const generateSubject = useCallback(async (theme: string) => {
    setAppState("generating");
    setSubjectLoading(true);
    setError(null);
    setCorrectionText("");
    try {
      const data = await fetchWithRetry(async () => {
        const res = await fetch("/api/generate-subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Erreur API");
        return res.json();
      });
      setSubjectText(data.subject);
      setAppState("subject");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Le service est temporairement indisponible. Veuillez réessayer dans quelques instants."
      );
      setAppState(themes.length > 0 ? "themes" : "home");
    } finally {
      setSubjectLoading(false);
    }
  }, [themes.length]);

  const generateCorrection = useCallback(async () => {
    setCorrectionLoading(true);
    setError(null);
    try {
      const data = await fetchWithRetry(async () => {
        const res = await fetch("/api/generate-correction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectText }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Erreur API");
        return res.json();
      });
      setCorrectionText(data.correction);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Le service est temporairement indisponible. Veuillez réessayer dans quelques instants."
      );
    } finally {
      setCorrectionLoading(false);
    }
  }, [subjectText]);

  const getSubjectTitle = useCallback(() =>
    subjectText.split("\n").find((l) => l.trim()) ?? "Sujet"
  , [subjectText]);

  const getSubjectBody = useCallback(() =>
    subjectText.split("\n").slice(1).join("\n")
  , [subjectText]);

  const openSubjectPrint = useCallback(async () => {
    const { openPrintWindow } = await import("./lib/print-export");
    openPrintWindow(getSubjectTitle(), "Sujet d'entraînement", getSubjectBody(), false);
  }, [getSubjectTitle, getSubjectBody]);

  const openCorrectionPrint = useCallback(async () => {
    const { openPrintWindow } = await import("./lib/print-export");
    openPrintWindow(getSubjectTitle(), "Corrigé modèle", correctionText, true);
  }, [getSubjectTitle, correctionText]);

  const copySubject = useCallback(async () => {
    const { copyAsRichText } = await import("./lib/print-export");
    copyAsRichText(getSubjectTitle(), subjectText);
  }, [getSubjectTitle, subjectText]);

  const copyCorrection = useCallback(async () => {
    const { copyAsRichText } = await import("./lib/print-export");
    copyAsRichText(getSubjectTitle(), correctionText);
  }, [getSubjectTitle, correctionText]);

  const reset = () => {
    setAppState("home");
    setThemes([]);
    setSelectedTheme(null);
    setSubjectText("");
    setCorrectionText("");
    setError(null);
    setActiveTab("suggest");
  };

  return (
    <main className="min-h-screen bg-[#ebe9ff]/40">
      {/* Header */}
      <header className="border-b border-[#c5bffa] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            <LogoOralPrepa className="h-10" />
            <div className="border-l border-[#c5bffa] pl-4">
              <p className="text-xs font-semibold text-[#4e3bf0] uppercase tracking-wide leading-none">Analyse de texte</p>
              <p className="text-[11px] text-[#7060d0] mt-0.5">UVSQ — PASS/LAS</p>
            </div>
          </div>
          {appState !== "home" && (
            <button
              onClick={reset}
              className="text-sm text-[#4e3bf0] hover:text-[#3d2cd0] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>←</span>
              Nouveau sujet
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Error banner */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* HOME */}
        {appState === "home" && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Préparez votre épreuve
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                Générez des sujets d&apos;examen réalistes et leurs corrigés modèles pour vous entraîner à l&apos;épreuve d&apos;analyse de texte.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("suggest")}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "suggest"
                    ? "border-[#4e3bf0] text-[#4e3bf0]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Proposez-moi des thèmes
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "custom"
                    ? "border-[#4e3bf0] text-[#4e3bf0]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                J&apos;ai mon propre sujet
              </button>
            </div>

            {activeTab === "suggest" ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-5">
                  L&apos;IA recherche 3 thèmes d&apos;actualité 2025-2026 adaptés à l&apos;épreuve.
                </p>
                <button
                  onClick={loadThemes}
                  disabled={themesLoading}
                  className="px-8 py-3 bg-[#4e3bf0] text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-[#3d2cd0] transition-colors"
                >
                  {themesLoading ? "Recherche en cours…" : "Suggérer des thèmes"}
                </button>
                {themesLoading && (
                  <div className="mt-8">
                    <LoadingState label="Recherche de sujets d'actualité…" />
                  </div>
                )}
              </div>
            ) : (
              <CustomTopicInput
                onValidate={(topic) => generateSubject(topic)}
                loading={subjectLoading}
              />
            )}
          </div>
        )}

        {/* THEMES */}
        {appState === "themes" && (
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
                Choisissez un thème
              </h2>
              <p className="text-sm text-gray-500">
                Sélectionnez le sujet qui vous intéresse ou demandez d&apos;autres suggestions.
              </p>
            </div>
            <ThemeSuggestions
              themes={themes}
              selected={selectedTheme}
              onSelect={setSelectedTheme}
              onOtherSuggestions={loadThemes}
              onValidate={() => selectedTheme && generateSubject(selectedTheme)}
              loading={themesLoading}
            />
            {themesLoading && (
              <div className="mt-4">
                <LoadingState label="Recherche de nouveaux thèmes…" />
              </div>
            )}

            {/* Custom topic option */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                Ou saisir votre propre sujet
              </p>
              <CustomTopicInput
                onValidate={(topic) => generateSubject(topic)}
                loading={subjectLoading}
              />
            </div>
          </div>
        )}

        {/* GENERATING */}
        {appState === "generating" && (
          <div className="max-w-xl mx-auto">
            <LoadingState />
          </div>
        )}

        {/* SUBJECT */}
        {appState === "subject" && subjectText && (
          <div className="space-y-8">
            <SubjectDisplay
              subjectText={subjectText}
              onGenerateCorrection={generateCorrection}
              onPrint={openSubjectPrint}
              onCopy={copySubject}
              correctionLoading={correctionLoading}
            />

            {correctionLoading && <LoadingState label="Rédaction du corrigé modèle…" />}

            {correctionText && (
              <CorrectionDisplay
                correctionText={correctionText}
                onPrint={openCorrectionPrint}
                onCopy={copyCorrection}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-gray-400">
            Outil d&apos;entraînement à l&apos;épreuve d&apos;analyse de texte UVSQ PASS/LAS — Les sujets et corrigés sont générés par IA à titre pédagogique.
          </p>
        </div>
      </footer>
    </main>
  );
}
