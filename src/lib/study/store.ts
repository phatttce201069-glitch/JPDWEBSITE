import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LastPlace } from "@/lib/study/types";

type StudyState = {
  hydrated: boolean;
  knownKana: string[];
  knownWords: number[];
  starred: number[];
  last: LastPlace | null;
  setHydrated: (value: boolean) => void;
  setKanaKnown: (key: string, known: boolean) => void;
  setWordKnown: (id: number, known: boolean) => void;
  toggleStar: (id: number) => void;
  unstarMany: (ids: number[]) => void;
  setLast: (last: LastPlace | null) => void;
};

export const useStudy = create<StudyState>()(
  persist(
    (set) => ({
      hydrated: false,
      knownKana: [],
      knownWords: [],
      starred: [],
      last: null,
      setHydrated: (hydrated) => set({ hydrated }),
      setKanaKnown: (key, known) =>
        set((state) => ({
          knownKana: known
            ? state.knownKana.includes(key)
              ? state.knownKana
              : [...state.knownKana, key]
            : state.knownKana.filter((item) => item !== key),
        })),
      setWordKnown: (id, known) =>
        set((state) => ({
          knownWords: known
            ? state.knownWords.includes(id)
              ? state.knownWords
              : [...state.knownWords, id]
            : state.knownWords.filter((item) => item !== id),
        })),
      toggleStar: (id) =>
        set((state) => ({
          starred: state.starred.includes(id)
            ? state.starred.filter((item) => item !== id)
            : [...state.starred, id],
        })),
      unstarMany: (ids) =>
        set((state) => ({
          starred: state.starred.filter((item) => !ids.includes(item)),
        })),
      setLast: (last) => set({ last }),
    }),
    {
      name: "sumi-study",
      skipHydration: true,
      partialize: (state) => ({
        knownKana: state.knownKana,
        knownWords: state.knownWords,
        starred: state.starred,
        last: state.last,
      }),
    },
  ),
);

export function kanaKey(type: string, char: string) {
  return `${type}:${char}`;
}
