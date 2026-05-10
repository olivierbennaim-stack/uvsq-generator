"use client";

import { useState } from "react";

interface CustomTopicInputProps {
  onValidate: (topic: string) => void;
  loading: boolean;
}

export default function CustomTopicInput({ onValidate, loading }: CustomTopicInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onValidate(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex : Interdire les réseaux sociaux aux moins de 15 ans"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] resize-none transition-colors bg-white"
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="w-full px-6 py-3 bg-[#1a365d] text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3f6f] transition-colors"
        >
          Générer ce sujet
        </button>
      </div>
    </form>
  );
}
