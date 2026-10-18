import { alphabet } from "@/data/alphabet";
import { grammar } from "@/data/grammar";
import { vocabulary } from "@/data/vocabulary";
import { kanaReading } from "@/lib/study/romaji";
import type { Glyph, Script, Word } from "@/lib/study/types";

export { alphabet, grammar, vocabulary };

export const SCRIPTS: { id: Script; label: string; note: string }[] = [
  { id: "hiragana", label: "Hiragana", note: "Chữ mềm, dùng để viết tiếng Nhật" },
  { id: "katakana", label: "Katakana", note: "Chữ vuông, dùng cho từ ngoại lai" },
  { id: "kanji", label: "Kanji", note: "Chữ Hán, theo bài JPD" },
];

const VOWEL: Record<string, "a" | "i" | "u" | "e" | "o"> = {
  a: "a",
  i: "i",
  u: "u",
  e: "e",
  o: "o",
  ka: "a",
  ki: "i",
  ku: "u",
  ke: "e",
  ko: "o",
  sa: "a",
  shi: "i",
  su: "u",
  se: "e",
  so: "o",
  ta: "a",
  chi: "i",
  tsu: "u",
  te: "e",
  to: "o",
  na: "a",
  ni: "i",
  nu: "u",
  ne: "e",
  no: "o",
  ha: "a",
  hi: "i",
  fu: "u",
  he: "e",
  ho: "o",
  ma: "a",
  mi: "i",
  mu: "u",
  me: "e",
  mo: "o",
  ya: "a",
  yu: "u",
  yo: "o",
  ra: "a",
  ri: "i",
  ru: "u",
  re: "e",
  ro: "o",
  wa: "a",
  wo: "o",
};

export const KANA_ROWS = ["A", "K", "S", "T", "N", "H", "M", "Y", "R", "W"] as const;
export const KANA_VOWELS = ["a", "i", "u", "e", "o"] as const;

export function glyphsOf(script: Script) {
  return alphabet.filter((item) => item.type === script);
}

export function kanaCell(glyphs: Glyph[], row: string, vowel: (typeof KANA_VOWELS)[number]) {
  return glyphs.find((item) => item.row === row && item.romaji && VOWEL[item.romaji] === vowel);
}

export function kanaN(glyphs: Glyph[]) {
  return glyphs.find((item) => item.romaji === "n");
}

export function courses() {
  const names = [...new Set(vocabulary.map((word) => word.course || "Khác"))];
  return names.map((course) => ({
    course,
    lessons: [...new Set(vocabulary.filter((word) => (word.course || "Khác") === course).map((word) => word.lesson))],
  }));
}

export function wordsIn(lesson: string): Word[] {
  return vocabulary.filter((word) => word.lesson === lesson);
}

export function lessonTitle(lesson: string) {
  return lesson.replace(/^JPD\d+\s*-\s*/, "");
}

export function pointById(id: string) {
  for (const lesson of grammar) {
    const point = lesson.points.find((item) => item.id === id);
    if (point) return { lesson, point };
  }
  return null;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy;
}

export function findReading(surface: string): string | null {
  const clean = surface.replace(/[（(][^）)]*[）)]/g, "").replace(/\s+/g, "").trim();
  if (!clean || !/[一-龯々]/.test(clean)) return null;

  // Exact match
  const match = vocabulary.find((w) => {
    const s = w.word.replace(/[（(][^）)]*[）)]/g, "").replace(/\s+/g, "").trim();
    return s === clean;
  });
  if (match) {
    const kana = kanaReading(match);
    if (kana && kana !== clean) return kana;
    if (match.reading && match.reading !== clean && /[ぁ-んァ-ヶ]/.test(match.reading)) {
      return match.reading;
    }
  }

  // Partial match for inflections
  const partial = vocabulary.find((w) => {
    const s = w.word.replace(/[（(][^）)]*[）)]/g, "").replace(/\s+/g, "").trim();
    return clean.startsWith(s) || s.startsWith(clean);
  });
  if (partial) {
    const kana = kanaReading(partial);
    if (kana && kana !== clean && /[ぁ-んァ-ヶ]/.test(kana)) return kana;
    if (partial.reading && partial.reading !== clean && /[ぁ-んァ-ヶ]/.test(partial.reading)) {
      return partial.reading;
    }
  }

  return null;
}

