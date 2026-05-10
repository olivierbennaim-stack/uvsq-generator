"use client";

interface Theme {
  title: string;
  hook: string;
}

interface ThemeSuggestionsProps {
  themes: Theme[];
  selected: string | null;
  onSelect: (title: string) => void;
  onOtherSuggestions: () => void;
  onValidate: () => void;
  loading: boolean;
}

export default function ThemeSuggestions({
  themes,
  selected,
  onSelect,
  onOtherSuggestions,
  onValidate,
  loading,
}: ThemeSuggestionsProps) {
  return (
    <div className="w-full">
      <div className="grid gap-3 sm:gap-4">
        {themes.map((theme, i) => (
          <button
            key={i}
            onClick={() => onSelect(theme.title)}
            className={`w-full text-left p-4 sm:p-5 rounded-lg border transition-all duration-200 group ${
              selected === theme.title
                ? "border-[#4e3bf0] bg-[#4e3bf0]/5 shadow-sm"
                : "border-gray-200 bg-white hover:border-[#4e3bf0]/40 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                  selected === theme.title
                    ? "border-[#4e3bf0] bg-[#4e3bf0]"
                    : "border-gray-300 group-hover:border-[#4e3bf0]/50"
                }`}
              >
                {selected === theme.title && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 leading-snug text-sm sm:text-base">
                  {theme.title}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                  {theme.hook}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={onValidate}
          disabled={!selected || loading}
          className="flex-1 px-6 py-3 bg-[#4e3bf0] text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d2cd0] transition-colors"
        >
          Générer ce sujet
        </button>
        <button
          onClick={onOtherSuggestions}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium text-sm disabled:opacity-40 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          Autres suggestions
        </button>
      </div>
    </div>
  );
}
