import { useState } from "react";
import { api } from "@shared/routes";

interface StoryState {
  topic: string;
  language: string;
  totalParts: number;
  currentPart: number;
  parts: string[];
  isLoading: boolean;
  error: string | null;
}

export function useStory() {
  const [state, setState] = useState<StoryState>({
    topic: "",
    language: "ru",
    totalParts: 6,
    currentPart: 0,
    parts: [],
    isLoading: false,
    error: null,
  });

  const generatePart = async (partNumber: number) => {
    if (!state.topic.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch(api.story.generatePart.path, {
        method: api.story.generatePart.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: state.topic,
          language: state.language,
          totalParts: state.totalParts,
          partNumber,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? "Ошибка генерации истории");
      }

      const data = await res.json();
      setState((prev) => ({
        ...prev,
        parts: [...prev.parts, data.content],
        currentPart: partNumber,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Неизвестная ошибка",
      }));
    }
  };

  const startStory = () => {
    setState((prev) => ({ ...prev, parts: [], currentPart: 0, error: null }));
    generatePart(1);
  };

  const nextPart = () => {
    if (state.currentPart < state.totalParts) {
      generatePart(state.currentPart + 1);
    }
  };

  const reset = () => {
    setState((prev) => ({
      ...prev,
      parts: [],
      currentPart: 0,
      error: null,
      isLoading: false,
    }));
  };

  const setTopic = (topic: string) => setState((prev) => ({ ...prev, topic }));
  const setLanguage = (language: string) => setState((prev) => ({ ...prev, language }));
  const setTotalParts = (totalParts: number) => setState((prev) => ({ ...prev, totalParts }));

  return {
    ...state,
    startStory,
    nextPart,
    reset,
    setTopic,
    setLanguage,
    setTotalParts,
    hasMoreParts: state.currentPart < state.totalParts && state.currentPart > 0,
    isStarted: state.currentPart > 0,
  };
}
