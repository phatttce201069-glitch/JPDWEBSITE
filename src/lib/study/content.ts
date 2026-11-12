import { alphabet } from "../../data/alphabet.ts";
import { grammar } from "../../data/grammar.ts";
import { vocabulary } from "../../data/vocabulary.ts";
import { kanaReading } from "./romaji.ts";
import type { Glyph, Script, Word } from "./types.ts";

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

const LESSON_TO_SLUG = new Map<string, string>();
const SLUG_TO_LESSON = new Map<string, string>();

(() => {
  const uniqueLessons = [...new Set(vocabulary.map((w) => w.lesson))];
  for (const lesson of uniqueLessons) {
    const courseMatch = lesson.match(/^(JPD\d+)\s*-\s*Bài\s*(\d+)\s*·\s*(.+)$/i);
    let slug = "";
    if (courseMatch) {
      const coursePrefix = courseMatch[1].toLowerCase();
      const bai = courseMatch[2];
      const partRaw = courseMatch[3].trim();
      const partNum = partRaw.match(/^(\d+)\b/);
      if (partNum) {
        slug = `${coursePrefix}-bai-${bai}-${partNum[1]}`;
      } else if (/hội thoại/i.test(partRaw)) {
        slug = `${coursePrefix}-bai-${bai}-hoi-thoai`;
      } else if (/もう一度/.test(partRaw)) {
        slug = `${coursePrefix}-bai-${bai}-nghe-lai`;
      } else {
        const cleanPart = partRaw
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        slug = `${coursePrefix}-bai-${bai}-${cleanPart || "extra"}`;
      }
    } else {
      slug =
        lesson
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `lesson-${LESSON_TO_SLUG.size + 1}`;
    }

    // Bảo đảm không trùng slug
    let uniqueSlug = slug;
    let counter = 2;
    while (SLUG_TO_LESSON.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter += 1;
    }

    LESSON_TO_SLUG.set(lesson, uniqueSlug);
    SLUG_TO_LESSON.set(uniqueSlug, lesson);
  }
})();

export function lessonSlug(lesson: string): string {
  if (!lesson) return "";
  if (lesson === "starred") return "starred";
  return LESSON_TO_SLUG.get(lesson) ?? lesson;
}

export function resolveLessonSlug(param: string): string {
  if (!param) return "";
  if (param === "starred") return "starred";
  if (SLUG_TO_LESSON.has(param)) return SLUG_TO_LESSON.get(param)!;
  if (LESSON_TO_SLUG.has(param)) return param;
  return "";
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

